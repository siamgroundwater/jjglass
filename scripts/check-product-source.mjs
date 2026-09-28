import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const date = process.argv[2] || new Date().toISOString().slice(0, 10);
assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
const directory = path.join(root, 'data/jjglass-source', date);
const read = async name => JSON.parse(await readFile(path.join(directory, name), 'utf8'));
const [snapshot, products, report, images, shop] = await Promise.all([
  read('snapshot.json'), read('products.json'), read('report.json'), read('images.json'), read('shop-pages.json'),
]);
const ids = products.map(product => product.id);
assert.equal(new Set(ids).size, ids.length, 'Duplicate product IDs');
assert.equal(ids.length, report.productCount);
const shopIds = shop.pages.flatMap(page => page.products.map(product => String(product.id)));
assert.equal(shop.pages.length, shop.expectedPages, 'Missing shop pages');
assert.deepEqual(shop.pages.map(page => page.page).sort((a, b) => a - b), Array.from({ length: shop.expectedPages }, (_, i) => i + 1));
assert.equal(new Set(shopIds).size, shopIds.length, 'Repeated products across shop pages');
assert.deepEqual([...shopIds].sort(), [...ids].sort(), 'Shop/API catalog mismatch');
const originals = new Map(snapshot.products.map(product => [String(product.id), product]));
const categoryIds = new Set(snapshot.categories.map(category => category.id));
for (const product of products) {
  const source = originals.get(product.id);
  assert.ok(source, `Missing raw record ${product.id}`);
  assert.equal(product.sku, source.sku || null);
  assert.equal(product.sourceProduct, source.permalink);
  assert.equal(new URL(product.sourceProduct).origin, 'https://jjglass.com');
  assert.equal(product.shortDescriptionHtml, source.short_description);
  assert.equal(product.descriptionHtml, source.description);
  assert.deepEqual(product.images, source.images);
  assert.deepEqual(product.categories, source.categories);
  assert.deepEqual(product.attributes, source.attributes);
  assert.deepEqual(product.variations, source.variations);
  assert.equal(product.price, Number(source.prices.price) / 10 ** source.prices.currency_minor_unit);
  assert.ok(Number.isFinite(product.price) && product.price >= 0);
  for (const category of product.categories) assert.ok(categoryIds.has(category.id), `Missing category ${category.id}`);
  for (const page of shop.pages) {
    const card = page.products.find(card => String(card.id) === product.id);
    if (card?.sku) assert.equal(card.sku, product.sku, `Shop/API SKU mismatch for ${product.id}`);
  }
  for (const variation of product.variations) {
    const detail = product.variationDetails.find(record => record.id === variation.id);
    assert.ok(detail, `Missing variation ${variation.id}`);
    assert.equal(detail.parent, source.id);
  }
}
const imageUrls = new Set(products.flatMap(product => product.images.map(image => image.src)));
assert.equal(images.length, imageUrls.size);
assert.deepEqual(new Set(images.map(image => image.source)), imageUrls);
for (const image of images) {
  assert.equal(new URL(image.source).origin, 'https://jjglass.com');
  for (const id of image.productIds) assert.ok(originals.get(id)?.images.some(source => source.src === image.source));
}
const rawPages = (await readdir(path.join(directory, 'raw'))).filter(name => /^products-\d+\.json$/.test(name));
const rawRecords = [];
for (const name of rawPages) {
  const page = await read(`raw/${name}`);
  assert.equal(Number(page.source.total), products.length);
  rawRecords.push(...page.records);
}
assert.equal(rawRecords.length, products.length);
assert.deepEqual(rawRecords.sort((a, b) => a.id - b.id), [...snapshot.products].sort((a, b) => a.id - b.id));
assert.equal(report.failures.length, 0);
console.log(`Verified ${products.length} products across ${shop.pages.length} shop pages, ${images.length} distinct image URLs, and ${report.variationsWithDetails} complete variations.`);
console.log(`Source issues preserved: ${report.missingSkuIds.length} missing SKUs, ${report.duplicateSkus.length} duplicated SKUs, ${report.sourceWarnings.length} taxonomy count warning.`);
