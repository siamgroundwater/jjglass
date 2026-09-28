// Run with: node scripts/check-cms.mjs
// Uses the project's installed TypeScript compiler; does not build or write files.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { runInThisContext } from 'node:vm';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modules = new Map();

function loadTypeScript(filename) {
  const resolved = path.resolve(filename);
  if (modules.has(resolved)) return modules.get(resolved).exports;
  const source = fs.readFileSync(resolved, 'utf8');
  const compiled = ts.transpileModule(source, {
    fileName: resolved,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    reportDiagnostics: true,
  });
  const errors = (compiled.diagnostics || []).filter(item => item.category === ts.DiagnosticCategory.Error);
  assert.equal(errors.length, 0, errors.map(item => ts.flattenDiagnosticMessageText(item.messageText, '\n')).join('\n'));
  const module = { exports: {} };
  modules.set(resolved, module);
  const localRequire = createRequire(resolved);
  const requireSource = specifier => {
    if (!specifier.startsWith('.')) return localRequire(specifier);
    const target = path.resolve(path.dirname(resolved), specifier);
    const candidate = [target, `${target}.ts`, path.join(target, 'index.ts')].find(item => fs.existsSync(item) && fs.statSync(item).isFile());
    assert.ok(candidate, `Missing module: ${specifier} from ${resolved}`);
    return candidate.endsWith('.ts') ? loadTypeScript(candidate) : localRequire(candidate);
  };
  const execute = runInThisContext(`(function(exports, require, module, __filename, __dirname) {\n${compiled.outputText}\n})`, { filename: resolved });
  execute(module.exports, requireSource, module, resolved, path.dirname(resolved));
  return module.exports;
}

const { createCmsSeed, createCmsPresentationSeed, createCmsTrashSample, isCmsData, mediaIsUsed, normalizeCmsData, CATALOG_REVISION, CMS_STORAGE_KEY, LEGACY_CMS_STORAGE_KEY } = loadTypeScript(path.join(root, 'src/lib/cms-data.ts'));
const { moveToTrash, restoreFromTrash, permanentlyDeleteFromTrash, purgeExpiredTrash, TRASH_RETENTION_MS } = loadTypeScript(path.join(root, 'src/lib/cms-trash.ts'));
const { orderTotal } = loadTypeScript(path.join(root, 'src/lib/cms-types.ts'));
const { cmsRoutePath, parseCmsRoute } = loadTypeScript(path.join(root, 'src/lib/cms-routing.ts'));
const { getUnitPrice, getLineTotal, getLowestUnitPrice, getNextPriceTier, MAX_PRODUCT_QUANTITY } = loadTypeScript(path.join(root, 'src/lib/pricing.ts'));
const { applyStockChanges, stockResult, matchesStock, productCsv, csvCell } = loadTypeScript(path.join(root, 'src/lib/cms-inventory.ts'));
const { productGallery } = loadTypeScript(path.join(root, 'src/lib/catalog.ts'));
const { legacyCatalogProducts } = loadTypeScript(path.join(root, 'src/lib/legacy-products.ts'));
const seed = createCmsSeed();
const { legacyStoreGalleries, illustratedStoreGalleries } = loadTypeScript(path.join(root, 'src/lib/store-art.ts'));
const collections = ['products', 'categories', 'brands', 'orders', 'customers', 'content', 'stores', 'media', 'activity', 'trash'];
let passed = 0;
let failed = 0;

function check(name, run) {
  try { run(); passed += 1; console.log(`PASS ${name}`); }
  catch (error) { failed += 1; console.error(`FAIL ${name}\n  ${error.message}`); }
}
function corrupt(mutator) {
  const data = structuredClone(seed);
  mutator(data);
  return data;
}
function rejects(name, mutator) {
  check(name, () => assert.equal(isCmsData(corrupt(mutator)), false));
}
function unique(items, value, label) {
  const values = items.map(value);
  assert.ok(values.every(item => typeof item === 'string' && item.trim()), `${label}: blank value`);
  assert.equal(new Set(values).size, values.length, `${label}: duplicate value`);
}
function publicAssetFilename(src, label) {
  assert.ok(src.startsWith('/images/'), `${label}: unexpected local image source: ${src}`);
  const assetPath = src.split(/[?#]/, 1)[0];
  const filename = path.resolve(root, 'public', assetPath.slice(1));
  assert.ok(filename.startsWith(`${path.join(root, 'public')}${path.sep}`), `${label}: image path escapes public folder: ${src}`);
  return filename;
}

check('seed and JSON storage round trip satisfy the runtime contract', () => {
  assert.equal(isCmsData(seed), true);
  assert.equal(isCmsData(JSON.parse(JSON.stringify(seed))), true);
  assert.ok(CMS_STORAGE_KEY.endsWith(`v${seed.version}`));
  assert.equal(seed.catalogRevision, CATALOG_REVISION);
});

check('every seeded product has three to five distinct gallery views with its cover first', () => {
  const media = new Set(seed.media.map(item => item.src));
  for (const product of seed.products) {
    const gallery = productGallery(product);
    assert.ok(gallery.length >= 3 && gallery.length <= 5, `${product.id}: expected 3–5 images, got ${gallery.length}`);
    assert.equal(gallery[0], product.image, `${product.id}: cover is not the first image`);
    assert.equal(new Set(gallery).size, gallery.length, `${product.id}: duplicate gallery image`);
    for (const src of gallery) {
      assert.ok(media.has(src), `${product.id}: gallery image missing from media library: ${src}`);
      assert.ok(fs.existsSync(publicAssetFilename(src, product.id)), `${product.id}: gallery file missing: ${src}`);
    }
  }
});

check('presentation trash sample is restorable, removable, and isolated from fresh seeds', () => {
  const preview = createCmsPresentationSeed();
  assert.equal(preview.trash.length, 1);
  assert.equal(preview.trash[0].kind, 'product');
  assert.equal(isCmsData(preview), true);
  assert.equal(preview.products.some(product => product.id === preview.trash[0].record.id), false);
  const restored = restoreFromTrash(preview, preview.trash[0].id);
  assert.ok(restored);
  assert.equal(restored.trash.length, 0);
  assert.equal(restored.products.some(product => product.id === preview.trash[0].record.id), true);
  const removed = permanentlyDeleteFromTrash(preview, preview.trash[0].id);
  assert.ok(removed);
  assert.equal(removed.trash.length, 0);
  assert.equal(preview.trash.length, 1);
  const second = createCmsTrashSample();
  assert.notEqual(second.id, preview.trash[0].id);
  assert.notEqual(second.record.id, preview.trash[0].record.id);
  assert.equal(isCmsData({ ...preview, trash: [second, ...preview.trash] }), true);
});

check('product delete routes work in Thai and English', () => {
  const itemId = 'product/example';
  assert.equal(cmsRoutePath({ locale: 'th', view: 'products', action: 'delete', itemId }), '/cms/products/product%2Fexample/delete');
  assert.equal(cmsRoutePath({ locale: 'en', view: 'products', action: 'delete', itemId }), '/cms/en/products/product%2Fexample/delete');
  assert.deepEqual(parseCmsRoute(['products', 'product%2Fexample', 'delete']), { locale: 'th', view: 'products', itemId: 'product%2Fexample', action: 'delete', canonical: true });
  assert.deepEqual(parseCmsRoute(['en', 'products', 'product%2Fexample', 'delete']), { locale: 'en', view: 'products', itemId: 'product%2Fexample', action: 'delete', canonical: true });
});

check('deleting a catalog product preserves historical order snapshots', () => {
  const next = structuredClone(seed);
  const orderBefore = structuredClone(next.orders[0]);
  const totalBefore = orderTotal(orderBefore);
  const productId = orderBefore.items[0].productId;
  next.products = next.products.filter(product => product.id !== productId);
  assert.equal(next.products.some(product => product.id === productId), false);
  assert.deepEqual(next.orders[0], orderBefore);
  assert.equal(orderTotal(next.orders[0]), totalBefore);
  assert.equal(isCmsData(next), true);
});
check('legacy browser data migrates without retaining customer segments', () => {
  const legacy = structuredClone(seed);
  legacy.version = 1;
  delete legacy.trash;
  for (const product of legacy.products) delete product.priceTiers;
  for (const [index, customer] of legacy.customers.entries()) customer.type = index % 2 ? 'legacy-a' : 'legacy-b';
  const migrated = normalizeCmsData(legacy);
  assert.ok(migrated, 'legacy snapshot was not migrated');
  assert.equal(migrated.version, 3);
  assert.equal(isCmsData(migrated), true);
  assert.deepEqual(migrated.trash, []);
  assert.ok(migrated.products.every(product => product.priceTiers.length > 0), 'quantity prices were not added');
  assert.ok(migrated.customers.every(customer => !Object.hasOwn(customer, 'type')), 'obsolete customer segment remained');
  assert.ok(LEGACY_CMS_STORAGE_KEY.endsWith('v1'));
  assert.ok(legacy.customers.every(customer => Object.hasOwn(customer, 'type')), 'migration mutated the source snapshot');
});
check('version 2 browser data gains missing catalog records without changing saved records', () => {
  const legacy = structuredClone(seed);
  legacy.version = 2;
  delete legacy.trash;
  delete legacy.catalogRevision;
  const missingId = legacyCatalogProducts[0].id;
  legacy.products = legacy.products.filter(product => product.id !== missingId);
  const savedProducts = structuredClone(legacy.products);
  const migrated = normalizeCmsData(legacy);
  assert.ok(migrated);
  assert.equal(migrated.version, 3);
  assert.equal(migrated.catalogRevision, CATALOG_REVISION);
  assert.deepEqual(migrated.trash, []);
  assert.deepEqual(migrated.products.slice(0, savedProducts.length), savedProducts);
  assert.equal(migrated.products.filter(product => product.id === missingId).length, 1);
  assert.deepEqual(migrated.orders, legacy.orders);
  assert.equal(isCmsData(migrated), true);
  assert.equal(Object.hasOwn(legacy, 'trash'), false, 'migration mutated source data');
});
check('catalog revision migration preserves edits and trash, adds new media, and runs once', () => {
  assert.ok(legacyCatalogProducts.length >= 2, 'need distinct new source products for migration checks');
  const [missingSource, trashedSource] = legacyCatalogProducts;
  const old = structuredClone(seed);
  delete old.catalogRevision;
  const custom = old.products.find(product => product.id !== missingSource.id && product.id !== trashedSource.id);
  assert.ok(custom);
  custom.name.en = 'Client-edited name';
  custom.stock = 71;
  custom.image = '/images/lifestyle-cafe.jpg';
  custom.images = [custom.image];
  const missingProduct = seed.products.find(product => product.id === missingSource.id);
  const trashedProduct = seed.products.find(product => product.id === trashedSource.id);
  assert.ok(missingProduct && trashedProduct);
  old.products = old.products.filter(product => product.id !== missingSource.id && product.id !== trashedSource.id);
  old.trash.push({ id: 'trash-pre-catalog-upgrade', kind: 'product', deletedAt: '2026-09-27T09:00:00.000Z', record: structuredClone(trashedProduct) });
  const missingPhoto = productGallery(missingProduct).find(src => !old.products.some(product => productGallery(product).includes(src)));
  assert.ok(missingPhoto, 'new product needs one unique image for media migration check');
  old.media = old.media.filter(item => item.src !== missingPhoto);
  assert.equal(isCmsData(old), true);
  const before = structuredClone(old);
  const migrated = normalizeCmsData(old);
  assert.ok(migrated);
  assert.equal(migrated.catalogRevision, CATALOG_REVISION);
  assert.equal(migrated.products.filter(product => product.id === missingSource.id).length, 1, 'new source product was not appended exactly once');
  assert.equal(migrated.products.some(product => product.id === trashedSource.id), false, 'trashed product was resurrected');
  assert.deepEqual(migrated.trash, old.trash);
  assert.deepEqual(migrated.products.find(product => product.id === custom.id), custom, 'saved product edits were overwritten');
  assert.ok(migrated.media.some(item => item.src === missingPhoto), 'new product image was not added to media library');
  unique(migrated.media, item => item.id, 'migrated media IDs');
  unique(migrated.media, item => item.src, 'migrated media sources');
  assert.equal(isCmsData(migrated), true);
  assert.deepEqual(old, before, 'normalization mutated saved data');
  assert.strictEqual(normalizeCmsData(migrated), migrated, 'migration ran again after its revision was saved');
  const deletedAgain = { ...migrated, products: migrated.products.filter(product => product.id !== missingSource.id) };
  assert.strictEqual(normalizeCmsData(deletedAgain), deletedAgain, 'later product deletion was undone');
});
check('existing store records gain supplied hours and LINE without replacing edits', () => {
  const old = structuredClone(seed);
  old.stores[0].hours = { th: 'สอบถามเวลาเปิดกับสาขา', en: 'Contact the store for opening hours' };
  delete old.stores[0].lineId;
  old.stores[1].hours = { th: 'เวลาเฉพาะที่แก้ไว้', en: 'Custom saved hours' };
  delete old.stores[1].lineId;
  const next = normalizeCmsData(old);
  assert.ok(next);
  assert.equal(next.stores[0].hours.th, seed.stores[0].hours.th);
  assert.equal(next.stores[0].lineId, '@jjglass');
  assert.deepEqual(next.stores[1].hours, old.stores[1].hours);
  assert.equal(next.stores[1].lineId, '@jjglass');
  assert.equal(old.stores[0].lineId, undefined, 'source snapshot changed');
});
check('each deletable record moves to trash and restores as an unchanged snapshot', () => {
  const deletedAt = new Date('2026-09-26T09:00:00.000Z');
  for (const [kind, collection] of [['product', 'products'], ['content', 'content'], ['store', 'stores'], ['media', 'media']]) {
    const original = structuredClone(seed);
    if (kind === 'media') original.media.push({ id: 'media-trash-test', name: 'Unused photo', src: '/images/check-trash-unused.jpg', alt: { th: 'ภาพ', en: 'Photo' }, uploaded: true, created: deletedAt.toISOString() });
    const item = structuredClone(kind === 'media' ? original.media.at(-1) : original[collection][0]);
    const next = moveToTrash(original, kind, item.id, deletedAt);
    assert.ok(next, `${kind}: deletion failed`);
    assert.equal(next[collection].some(record => record.id === item.id), false, `${kind}: still active`);
    const trashItem = next.trash.find(record => record.kind === kind && record.record.id === item.id);
    assert.ok(trashItem, `${kind}: missing from trash`);
    assert.deepEqual(trashItem.record, item, `${kind}: snapshot changed`);
    assert.equal(trashItem.deletedAt, deletedAt.toISOString());
    assert.equal(isCmsData(next), true, `${kind}: invalid trashed snapshot`);
    assert.ok(original[collection].some(record => record.id === item.id), `${kind}: source was mutated`);
    const restored = restoreFromTrash(next, trashItem.id, new Date(deletedAt.getTime() + 60_000));
    assert.ok(restored, `${kind}: restore failed`);
    assert.deepEqual(restored[collection].find(record => record.id === item.id), item, `${kind}: restore changed record`);
    assert.equal(restored.trash.some(record => record.id === trashItem.id), false, `${kind}: remained in trash`);
    assert.equal(isCmsData(restored), true, `${kind}: invalid restored snapshot`);
  }
});
check('trash restoration expires at the 30-day boundary', () => {
  const deletedAt = new Date('2026-09-01T00:00:00.000Z');
  assert.equal(TRASH_RETENTION_MS, 30 * 24 * 60 * 60 * 1000);
  const next = moveToTrash(seed, 'content', seed.content[0].id, deletedAt);
  assert.ok(next);
  const trashId = next.trash[0].id;
  const withinWindow = new Date(deletedAt.getTime() + TRASH_RETENTION_MS - 1);
  const expired = new Date(deletedAt.getTime() + TRASH_RETENTION_MS);
  assert.ok(restoreFromTrash(next, trashId, withinWindow), 'restore before expiry was blocked');
  assert.equal(restoreFromTrash(next, trashId, expired), null, 'restore at expiry was accepted');
  assert.equal(purgeExpiredTrash(next, withinWindow).trash.length, 1, 'item purged early');
  const purged = purgeExpiredTrash(next, expired);
  assert.equal(purged.trash.length, 0, 'expired item remained');
  assert.equal(purged.content.some(item => item.id === seed.content[0].id), false, 'purge restored content');
  assert.equal(isCmsData(purged), true);
  assert.equal(next.trash.length, 1, 'purge mutated input');
});
check('permanent deletion removes only the selected trash entry', () => {
  const deletedAt = new Date('2026-09-26T09:00:00.000Z');
  const first = moveToTrash(seed, 'product', seed.products[0].id, deletedAt);
  assert.ok(first);
  const second = moveToTrash(first, 'content', first.content[0].id, deletedAt);
  assert.ok(second);
  const originalOrder = structuredClone(second.orders[0]);
  const originalTotal = orderTotal(originalOrder);
  const productTrashId = second.trash.find(item => item.kind === 'product')?.id;
  assert.ok(productTrashId);
  const next = permanentlyDeleteFromTrash(second, productTrashId);
  assert.ok(next);
  assert.equal(next.trash.length, 1);
  assert.equal(next.trash[0].kind, 'content');
  assert.equal(next.products.some(item => item.id === seed.products[0].id), false);
  assert.deepEqual(next.orders[0], originalOrder, 'historical order snapshot changed');
  assert.equal(orderTotal(next.orders[0]), originalTotal);
  assert.equal(isCmsData(next), true);
  assert.equal(second.trash.length, 2, 'permanent deletion mutated input');
  assert.equal(permanentlyDeleteFromTrash(next, 'missing-trash-id'), null);
});
check('restoration refuses active ID, SKU, and slug collisions without losing either record', () => {
  const deleted = moveToTrash(seed, 'product', seed.products[0].id, new Date('2026-09-26T09:00:00.000Z'));
  assert.ok(deleted);
  const original = seed.products[0];
  for (const conflict of [
    { id: original.id, sku: 'NEW-SKU', slug: 'new-slug' },
    { id: 'new-product', sku: original.sku, slug: 'new-slug' },
    { id: 'new-product', sku: 'NEW-SKU', slug: original.slug },
  ]) {
    const conflicting = { ...deleted, products: [...deleted.products, { ...original, ...conflict, name: { th: 'สินค้าใหม่', en: 'New product' } }] };
    const snapshot = structuredClone(conflicting);
    assert.equal(restoreFromTrash(conflicting, deleted.trash[0].id, new Date('2026-09-27T09:00:00.000Z')), null, `accepted conflict ${JSON.stringify(conflict)}`);
    assert.deepEqual(conflicting, snapshot, 'failed restore mutated data');
  }
});
check('media restoration refuses a duplicate source path', () => {
  const source = structuredClone(seed);
  const record = { id: 'media-conflict', name: 'Unused photo', src: '/images/check-trash-conflict.jpg', alt: { th: 'ภาพ', en: 'Photo' }, uploaded: true, created: '2026-09-26T09:00:00.000Z' };
  source.media.push(record);
  const deleted = moveToTrash(source, 'media', record.id, new Date('2026-09-26T09:00:00.000Z'));
  assert.ok(deleted);
  const conflicting = { ...deleted, media: [...deleted.media, { ...record, id: 'new-media' }] };
  assert.equal(restoreFromTrash(conflicting, deleted.trash[0].id, new Date('2026-09-27T09:00:00.000Z')), null);
  assert.equal(conflicting.trash.length, 1);
});
check('media referenced by a restorable record remains protected', () => {
  const source = structuredClone(seed);
  const image = '/images/check-trash-reference.jpg';
  source.media.push({ id: 'media-trash-reference', name: 'Restorable photo', src: image, alt: { th: 'ภาพ', en: 'Photo' }, uploaded: true, created: '2026-09-26T09:00:00.000Z' });
  source.products.push({ ...structuredClone(source.products[0]), id: 'product-trash-reference', slug: 'product-trash-reference', sku: 'TRASH-REFERENCE', image });
  const moved = moveToTrash(source, 'product', 'product-trash-reference', new Date('2026-09-26T09:00:00.000Z'));
  assert.ok(moved);
  assert.equal(moved.products.some(item => item.image === image), false);
  assert.equal(mediaIsUsed(moved, image), true, 'trash snapshot lost media reference');
  assert.equal(moveToTrash(moved, 'media', 'media-trash-reference'), null, 'referenced image entered trash');
});
check('invalid trash entries fail runtime validation', () => {
  const valid = moveToTrash(seed, 'store', seed.stores[0].id, new Date('2026-09-26T09:00:00.000Z'));
  assert.ok(valid);
  for (const mutate of [
    data => { data.trash[0].kind = 'order'; },
    data => { data.trash[0].deletedAt = 'not-a-date'; },
    data => { delete data.trash[0].record; },
    data => { delete data.trash[0].record.name.en; },
    data => { data.trash.push(structuredClone(data.trash[0])); },
  ]) {
    const invalid = structuredClone(valid);
    mutate(invalid);
    assert.equal(isCmsData(invalid), false, 'invalid trash entry was accepted');
  }
});
check('invalid root snapshots and versions are rejected', () => {
  for (const value of [null, undefined, [], {}, false, 'bad data', { ...seed, version: 0 }, { ...seed, version: '1' }]) assert.equal(isCmsData(value), false);
  for (const value of [-1, 1.5, null, '2']) assert.equal(isCmsData({ ...seed, catalogRevision: value }), false, `Accepted catalog revision: ${JSON.stringify(value)}`);
});
check('every required collection is checked before rendering', () => {
  for (const name of collections) {
    assert.equal(isCmsData(corrupt(data => { delete data[name]; })), false, `${name}: missing collection accepted`);
    assert.equal(isCmsData(corrupt(data => { data[name] = [null]; })), false, `${name}: null record accepted`);
  }
});
rejects('incomplete product translations are rejected', data => { delete data.products[0].name.en; });
rejects('missing product image fields are rejected', data => { delete data.products[0].image; });
rejects('blank product cover is rejected', data => { data.products[0].image = ' '; });
rejects('invalid product numeric values are rejected', data => { data.products[0].price = Number.NaN; });
rejects('missing product price tiers are rejected', data => { delete data.products[0].priceTiers; });
check('malformed product price tiers are rejected', () => {
  const mutations = [
    data => { data.products[0].priceTiers = null; },
    data => { data.products[0].priceTiers = {}; },
    data => { data.products[0].priceTiers[0].minQuantity = 1; },
    data => { data.products[0].priceTiers[0].minQuantity = 6.5; },
    data => { data.products[0].priceTiers[0].minQuantity = MAX_PRODUCT_QUANTITY + 1; },
    data => { data.products[0].priceTiers[0].unitPrice = 0; },
    data => { data.products[0].priceTiers[0].unitPrice = Number.NaN; },
    data => { data.products[0].priceTiers[0].unitPrice = data.products[0].price; },
    data => { data.products[0].priceTiers[1].minQuantity = data.products[0].priceTiers[0].minQuantity; },
    data => { data.products[0].priceTiers.reverse(); },
    data => { data.products[0].priceTiers[1].unitPrice = data.products[0].priceTiers[0].unitPrice; },
  ];
  for (const mutate of mutations) assert.equal(isCmsData(corrupt(mutate)), false);
});
check('products may intentionally have no quantity price tiers', () => {
  assert.equal(isCmsData(corrupt(data => { data.products[0].priceTiers = []; })), true);
});
check('optional product capacity rejects values that cannot be edited as text', () => {
  for (const value of [42, null, false, {}, []]) {
    assert.equal(isCmsData(corrupt(data => { data.products[0].capacity = value; })), false, `Accepted capacity: ${JSON.stringify(value)}`);
  }
  for (const value of [undefined, '', '350 ml']) {
    assert.equal(isCmsData(corrupt(data => { data.products[0].capacity = value; })), true, `Rejected valid capacity: ${String(value)}`);
  }
});
check('invalid product gallery and size-group fields are rejected', () => {
  const cover = seed.products[0].image;
  for (const images of [null, {}, [], [cover, cover], ['/images/not-the-cover.jpg', cover], [cover, null], [cover, ' '], [cover, 'a', 'b', 'c', 'd', 'e']]) {
    assert.equal(isCmsData(corrupt(data => { data.products[0].images = images; })), false, `Accepted gallery: ${JSON.stringify(images)}`);
  }
  for (const sizeGroup of [null, 1, false, {}, []]) {
    assert.equal(isCmsData(corrupt(data => { data.products[0].sizeGroup = sizeGroup; })), false, `Accepted size group: ${JSON.stringify(sizeGroup)}`);
  }
});
rejects('incomplete category translations are rejected', data => { delete data.categories[0].name.th; });
rejects('invalid brand status is rejected', data => { data.brands[0].status = 'deleted'; });
rejects('incomplete order item snapshots are rejected', data => { delete data.orders[0].items[0].name.en; });
rejects('invalid order payment states are rejected', data => { data.orders[0].payment = 'unknown'; });
rejects('incomplete customer addresses are rejected', data => { data.customers[0].address = 'Bangkok'; });
check('customer records do not retain the obsolete segment field', () => {
  for (const customer of seed.customers) assert.equal(Object.hasOwn(customer, 'type'), false, `${customer.id}: obsolete type field`);
});
rejects('incomplete page metadata is rejected', data => { delete data.content[0].seoDescription.th; });
rejects('invalid store gallery values are rejected', data => { data.stores[0].images.push(null); });
rejects('incomplete image alternative text is rejected', data => { delete data.media[0].alt.en; });
rejects('incomplete settings are rejected', data => { delete data.settings.lowStockNotifications; });
rejects('nonfinite settings are rejected', data => { data.settings.deliveryFee = Infinity; });
rejects('incomplete activity text is rejected', data => { delete data.activity[0].text.th; });

for (const [collection, field] of [['orders', 'date'], ['customers', 'joined'], ['media', 'created'], ['activity', 'date']]) {
  check(`${collection}.${field} rejects snapshots with unrenderable dates`, () => {
    for (const value of ['', 'not-a-date', '2026-13-25T09:00:00+07:00', null, 0]) {
      assert.equal(isCmsData(corrupt(data => { data[collection][0][field] = value; })), false, `Accepted date: ${JSON.stringify(value)}`);
    }
  });
}

check('record IDs, product SKUs, slugs, and brand names are unique', () => {
  for (const name of collections) unique(seed[name], item => item.id, `${name} IDs`);
  unique(seed.products, item => item.sku.trim().toLowerCase(), 'product SKUs');
  unique(seed.products, item => item.slug, 'product slugs');
  unique(seed.brands, item => item.name.trim().toLowerCase(), 'brand names');
  unique(seed.media, item => item.src, 'media sources');
});
check('source-backed legacy additions appear exactly once in the presentation catalog', () => {
  assert.ok(legacyCatalogProducts.length >= 40, `expected a substantial addition from the archive, got ${legacyCatalogProducts.length}`);
  unique(legacyCatalogProducts, item => item.id, 'additional legacy IDs');
  for (const source of legacyCatalogProducts) {
    const matches = seed.products.filter(product => product.id === source.id);
    assert.equal(matches.length, 1, `${source.id}: missing or duplicated source product`);
    assert.equal(matches[0].sku, source.sku, `${source.id}: source SKU changed`);
  }
});
check('quantity pricing selects the correct tier at every boundary', () => {
  const product = {
    price: 100,
    priceTiers: [
      { minQuantity: 6, unitPrice: 95 },
      { minQuantity: 12, unitPrice: 90 },
    ],
  };
  for (const [quantity, expected] of [[1, 100], [5, 100], [6, 95], [11, 95], [12, 90], [99, 90], [100, 90], [9999, 90]]) {
    assert.equal(getUnitPrice(product, quantity), expected, `quantity ${quantity}`);
  }
  assert.equal(getLineTotal(product, 6), 570);
  assert.equal(getLineTotal(product, 12), 1080);
  assert.equal(getLineTotal(product, 9999), 899910);
  assert.equal(getLowestUnitPrice(product), 90);
  assert.deepEqual(getNextPriceTier(product, 1), { minQuantity: 6, unitPrice: 95 });
  assert.deepEqual(getNextPriceTier(product, 6), { minQuantity: 12, unitPrice: 90 });
  assert.equal(getNextPriceTier(product, 12), undefined);
  assert.equal(getNextPriceTier(product, 99), undefined);
});
check('quantity pricing supports products without tiers', () => {
  const product = { price: 37.5, priceTiers: [] };
  for (const quantity of [1, 5, 6, 11, 12, 99, 100, 9999]) assert.equal(getUnitPrice(product, quantity), 37.5);
  assert.equal(getLineTotal(product, 12), 450);
  assert.equal(getLowestUnitPrice(product), 37.5);
  assert.equal(getNextPriceTier(product, 1), undefined);
});
check('quantity pricing rejects invalid quantities and does not mutate tier data', () => {
  const product = {
    price: 100,
    priceTiers: [
      { minQuantity: 12, unitPrice: 90 },
      { minQuantity: 6, unitPrice: 95 },
    ],
  };
  const original = structuredClone(product);
  assert.equal(getUnitPrice(product, 12), 90);
  assert.deepEqual(getNextPriceTier(product, 1), { minQuantity: 6, unitPrice: 95 });
  assert.deepEqual(product, original);
  for (const quantity of [0, 10000, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => getUnitPrice(product, quantity), RangeError, `accepted quantity ${quantity}`);
    assert.throws(() => getLineTotal(product, quantity), RangeError, `accepted line quantity ${quantity}`);
  }
});
check('CMS supports order and price-tier quantities up to 9999', () => {
  assert.equal(MAX_PRODUCT_QUANTITY, 9999);
  const data = structuredClone(seed);
  data.products[0].priceTiers = [{ minQuantity: 9999, unitPrice: data.products[0].price / 2 }];
  data.orders[0].items[0].quantity = 9999;
  assert.equal(isCmsData(data), true);
  assert.equal(getUnitPrice(data.products[0], 9998), data.products[0].price);
  assert.equal(getUnitPrice(data.products[0], 9999), data.products[0].price / 2);
  data.orders[0].items[0].quantity = 10000;
  assert.equal(isCmsData(data), false);
  data.orders[0].items[0].quantity = 9999;
  data.products[0].priceTiers[0].minQuantity = 10000;
  assert.equal(isCmsData(data), false);
});
check('product category and brand relationships resolve', () => {
  const categories = new Set(seed.categories.map(item => item.id));
  const brands = new Set(seed.brands.map(item => item.name));
  for (const product of seed.products) {
    assert.ok(categories.has(product.category), `${product.id}: missing category ${product.category}`);
    assert.ok(brands.has(product.brand), `${product.id}: missing brand ${product.brand}`);
    assert.ok(Number.isFinite(product.price) && product.price > 0, `${product.id}: invalid price`);
    assert.ok(Number.isSafeInteger(product.stock) && product.stock >= 0, `${product.id}: invalid stock`);
    assert.ok(Array.isArray(product.priceTiers) && product.priceTiers.length > 0, `${product.id}: missing sample price tiers`);
    let previousQuantity = 1;
    let previousPrice = product.price;
    for (const tier of product.priceTiers) {
      assert.ok(Number.isSafeInteger(tier.minQuantity) && tier.minQuantity > previousQuantity && tier.minQuantity <= MAX_PRODUCT_QUANTITY, `${product.id}: invalid tier quantity`);
      assert.ok(Number.isFinite(tier.unitPrice) && tier.unitPrice > 0 && tier.unitPrice < previousPrice, `${product.id}: invalid tier price`);
      previousQuantity = tier.minQuantity;
      previousPrice = tier.unitPrice;
    }
  }
});
check('sourced size groups contain distinct labeled variants of one product family', () => {
  const groups = new Map();
  for (const product of seed.products) {
    if (!product.sizeGroup) continue;
    assert.equal(product.sizeGroup.trim(), product.sizeGroup, `${product.id}: size group has outer whitespace`);
    assert.ok(product.capacity?.trim(), `${product.id}: grouped product has no size label`);
    const members = groups.get(product.sizeGroup) || [];
    members.push(product);
    groups.set(product.sizeGroup, members);
  }
  assert.ok(groups.size > 0, 'the catalog has no size choices');
  for (const [group, members] of groups) {
    assert.ok(members.length >= 2, `${group}: group has only one product`);
    assert.equal(new Set(members.map(item => item.brand)).size, 1, `${group}: mixed brands`);
    assert.equal(new Set(members.map(item => item.category)).size, 1, `${group}: mixed categories`);
    unique(members, item => item.id, `${group} IDs`);
    unique(members, item => item.sku, `${group} SKUs`);
    unique(members, item => item.capacity.trim().toLowerCase(), `${group} size labels`);
  }
});
check('orders reference valid customers and products with valid totals', () => {
  const customerIds = new Set(seed.customers.map(item => item.id));
  const productsById = new Map(seed.products.map(item => [item.id, item]));
  for (const order of seed.orders) {
    assert.ok(customerIds.has(order.customerId), `${order.id}: missing customer`);
    assert.ok(order.items.length > 0, `${order.id}: empty order`);
    assert.ok(Number.isFinite(Date.parse(order.date)), `${order.id}: invalid date`);
    for (const item of order.items) {
      const product = productsById.get(item.productId);
      assert.ok(product, `${order.id}: missing product ${item.productId}`);
      assert.ok(Number.isSafeInteger(item.quantity) && item.quantity > 0, `${order.id}: invalid quantity`);
      assert.ok(Number.isFinite(item.price) && item.price > 0, `${order.id}: invalid item price`);
      assert.equal(item.price, getUnitPrice(product, item.quantity), `${order.id}: item price does not snapshot its quantity tier`);
    }
    assert.equal(orderTotal(order), order.items.reduce((sum, item) => sum + item.price * item.quantity, order.delivery));
  }
});
check('historical order totals remain frozen after catalog pricing changes', () => {
  const order = structuredClone(seed.orders.find(item => item.items.some(product => product.quantity >= 6)));
  assert.ok(order, 'seed needs an order that reaches a price tier');
  const originalTotal = orderTotal(order);
  const item = order.items.find(product => product.quantity >= 6);
  const repricedProduct = { price: 999999, priceTiers: [] };
  assert.notEqual(getUnitPrice(repricedProduct, item.quantity), item.price);
  assert.equal(orderTotal(order), originalTotal);
});
check('all referenced images exist in the media library and local public assets', () => {
  const media = new Set(seed.media.map(item => item.src));
  const references = [
    ...seed.products.flatMap(productGallery), ...seed.categories.map(item => item.image),
    ...seed.brands.map(item => item.image), ...seed.content.map(item => item.image),
    ...seed.stores.flatMap(item => item.images), ...seed.orders.flatMap(order => order.items.map(item => item.image)),
  ].filter(Boolean);
  const missing = [...new Set(references.filter(src => !media.has(src)))];
  assert.deepEqual(missing, [], `Referenced images absent from media library: ${missing.join(', ')}`);
  for (const item of seed.media) {
    assert.ok(fs.existsSync(publicAssetFilename(item.src, item.id)), `Missing asset: ${item.src}`);
  }
});
check('every store has three distinct illustrations with localized media descriptions', () => {
  const paths = seed.stores.flatMap(store => {
    assert.equal(store.images.length, 3);
    assert.deepEqual(store.images, illustratedStoreGalleries[store.id].map(image => `/images/${image}`));
    for (const src of store.images) {
      const media = seed.media.find(item => item.src === src);
      assert.ok(media.alt.th.includes(store.name.th));
      assert.ok(media.alt.en.includes(store.name.en));
    }
    return store.images;
  });
  assert.equal(new Set(paths).size, 21);
});
check('original store sample galleries migrate immutably and only once', () => {
  const old = structuredClone(seed);
  old.stores.forEach(store => { store.images = legacyStoreGalleries[store.id].map(image => `/images/${image}`); });
  old.media = old.media.filter(item => !item.src.startsWith('/images/stores/'));
  const before = structuredClone(old);
  const migrated = normalizeCmsData(old);
  assert.ok(isCmsData(migrated));
  assert.deepEqual(migrated.stores, seed.stores);
  assert.deepEqual(old, before);
  assert.equal(migrated.media.filter(item => item.src.startsWith('/images/stores/')).length, 21);
  assert.strictEqual(normalizeCmsData(migrated), migrated);
});
check('store illustration migration preserves custom galleries and edited media', () => {
  const customized = structuredClone(seed);
  customized.stores[0].images = ['/images/custom-store.jpg'];
  customized.stores[1].images = legacyStoreGalleries.bangbon.map(image => `/images/${image}`).reverse();
  customized.media.find(item => item.src.startsWith('/images/stores/')).alt.en = 'My edited description';
  const before = structuredClone(customized);
  const normalized = normalizeCmsData(customized);
  assert.deepEqual(normalized, before);
  assert.strictEqual(normalized, customized);
});
check('media usage protects images referenced only by historical orders or stores', () => {
  const historical = structuredClone(seed);
  historical.orders[0].items[0].image = '/images/check-historical-only.jpg';
  historical.stores[0].images = ['/images/check-store-only.jpg'];
  assert.equal(mediaIsUsed(historical, '/images/check-historical-only.jpg'), true);
  assert.equal(mediaIsUsed(historical, '/images/check-store-only.jpg'), true);
  assert.equal(mediaIsUsed(historical, '/images/check-unused.jpg'), false);
});
check('media usage protects a non-cover product image in the catalog and trash', () => {
  const source = structuredClone(seed);
  const photo = '/images/check-gallery-reference.jpg';
  const product = source.products[0];
  product.images = [product.image, photo];
  source.media.push({ id: 'media-gallery-reference', name: 'Gallery photo', src: photo, alt: { th: 'ภาพสินค้า', en: 'Product photo' }, uploaded: true, created: '2026-09-26T09:00:00.000Z' });
  assert.equal(isCmsData(source), true);
  assert.equal(mediaIsUsed(source, photo), true, 'active product did not protect its alternate photo');
  assert.equal(moveToTrash(source, 'media', 'media-gallery-reference'), null, 'active product photo entered trash');
  const moved = moveToTrash(source, 'product', product.id, new Date('2026-09-26T09:00:00.000Z'));
  assert.ok(moved);
  assert.equal(mediaIsUsed(moved, photo), true, 'product in trash did not protect its alternate photo');
  assert.equal(moveToTrash(moved, 'media', 'media-gallery-reference'), null, 'restorable product photo entered trash');
});
check('fresh seeds do not share mutable data with previous demo sessions', () => {
  const first = createCmsSeed();
  const originalTierPrice = first.products[0].priceTiers[0].unitPrice;
  first.products[0].name.en = 'Changed product';
  first.products[0].priceTiers[0].unitPrice = 1;
  first.orders[0].items[0].name.en = 'Changed order';
  first.media[0].alt.en = 'Changed image';
  first.stores[0].images.push('/images/check-session-only.jpg');
  const second = createCmsSeed();
  assert.equal(second.products[0].priceTiers[0].unitPrice, originalTierPrice);
  assert.notStrictEqual(first.products[0].priceTiers, second.products[0].priceTiers);
  assert.deepEqual(second, seed);
});

check('stock receiving, removal and counts save atomically without changing prices or orders', () => {
  const before = structuredClone(seed);
  const changes = seed.products.slice(0, 3).map((product, i) => ({ id: product.id, previous: product.stock, mode: ['receive', 'remove', 'count'][i], amount: i === 1 ? String(product.stock || 1) : '12', reason: 'Presentation stock count' }));
  // Give the removal fixture stock independently of the catalog seed.
  before.products[1].stock = 5;
  changes[1].previous = 5;
  changes[1].amount = '5';
  const next = applyStockChanges(before, changes);
  assert.ok(next);
  assert.equal(next.products[0].stock, before.products[0].stock + 12);
  assert.equal(next.products[1].stock, 0);
  assert.equal(next.products[2].stock, 12);
  assert.equal(before.products[1].stock, 5);
  assert.deepEqual(next.orders, before.orders);
  assert.deepEqual(next.products.map(p => p.priceTiers), before.products.map(p => p.priceTiers));
  assert.equal(isCmsData(next), true);
});
check('invalid, negative, fractional, duplicate and stale stock batches make no partial changes', () => {
  const product = seed.products[0];
  const valid = { id: product.id, previous: product.stock, mode: 'receive', amount: '5', reason: 'Delivery' };
  for (const patch of [{ amount: '' }, { amount: '-1' }, { amount: '1.5' }, { amount: 'Infinity' }, { amount: '9007199254740992' }, { reason: '' }, { reason: ' '.repeat(3) }, { reason: 'x'.repeat(201) }, { previous: product.stock + 1 }, { id: 'missing' }, { mode: 'count', amount: String(product.stock) }]) {
    const other = { ...valid, id: seed.products[1].id, previous: seed.products[1].stock };
    assert.ok(applyStockChanges(seed, [other, { ...valid, ...patch }]) === null, `Accepted invalid batch: ${JSON.stringify(patch)}`);
  }
  assert.equal(applyStockChanges(seed, [valid, valid]), null);
  assert.equal(stockResult({ ...valid, mode: 'remove', amount: String(product.stock + 1) }), null);
  assert.equal(stockResult({ ...valid, mode: 'count', amount: '0' }), 0);
  assert.equal(applyStockChanges(seed, []), null);
});
check('stock filters distinguish sold-out, low stock, and published alerts at threshold', () => {
  const product = { ...seed.products[0], stock: 5, status: 'draft' };
  assert.equal(matchesStock(product, 'low', 5), true);
  assert.equal(matchesStock(product, 'attention', 5), false);
  assert.equal(matchesStock({ ...product, status: 'published' }, 'attention', 5), true);
  assert.equal(matchesStock({ ...product, stock: 0 }, 'low', 5), false);
  assert.equal(matchesStock({ ...product, stock: 0 }, 'out', 5), true);
  assert.equal(matchesStock({ ...product, stock: 6 }, 'healthy', 5), true);
});
check('CSV export preserves bilingual data, escapes quotes, and neutralizes spreadsheet formulas', () => {
  assert.equal(csvCell('=SUM(A1)'), '"\'=SUM(A1)"');
  assert.equal(csvCell('  @value'), '"\'  @value"');
  assert.equal(csvCell('glass,"blue"'), '"glass,""blue"""');
  const csv = productCsv([seed.products[0]], seed);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes(seed.products[0].name.th));
  assert.ok(csv.includes(seed.products[0].sku));
  assert.equal(csv.split('\r\n').length, 2);
});
check('stock workspace has canonical routes in both languages', () => {
  assert.equal(cmsRoutePath({ locale: 'th', view: 'inventory' }), '/cms/inventory');
  assert.equal(cmsRoutePath({ locale: 'en', view: 'inventory' }), '/cms/en/inventory');
  assert.equal(parseCmsRoute(['inventory']).view, 'inventory');
  assert.equal(parseCmsRoute(['en', 'inventory']).locale, 'en');
});

console.log(`\nCMS integrity: ${passed} passed, ${failed} failed.`);
if (failed) process.exitCode = 1;
