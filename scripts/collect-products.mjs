import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Read-only public source collection. Never writes to the storefront or a database.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://jjglass.com';
const dateArg = process.argv.find(arg => arg.startsWith('--date='))?.slice(7);
const snapshotDate = dateArg || new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(snapshotDate)) throw new Error('Use --date=YYYY-MM-DD');
const output = path.join(root, 'data', 'jjglass-source', snapshotDate);
const offline = process.argv.includes('--offline');
const resume = process.argv.includes('--resume');
const enrich = process.argv.includes('--enrich');
if (offline && enrich) throw new Error('--offline and --enrich are mutually exclusive');
const requests = [];
const failures = [];
const sourceWarnings = [];
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
await mkdir(path.join(output, 'raw'), { recursive: true });

async function save(name, value) {
  await writeFile(path.join(output, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function fetchSource(url) {
  if (new URL(url).origin !== origin) throw new Error(`Unexpected source: ${url}`);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'JJGLASS-Catalog-Source-Collector/1.0', Accept: 'application/json, text/html' },
        signal: AbortSignal.timeout(45000),
        redirect: 'error',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
      const body = await response.text();
      const evidence = {
        url, fetchedAt: new Date().toISOString(), status: response.status,
        sha256: createHash('sha256').update(body).digest('hex'),
        total: response.headers.get('x-wp-total'), totalPages: response.headers.get('x-wp-totalpages'),
      };
      requests.push(evidence);
      return { body, evidence };
    } catch (error) {
      if (attempt === 2) throw error;
      await pause(1500 * (attempt + 1));
    }
  }
}

async function collection(endpoint, name) {
  const rows = [];
  let pages = 1;
  let total;
  for (let page = 1; page <= pages; page++) {
    const ordering = endpoint === 'products' ? '&orderby=id&order=asc' : endpoint.endsWith('/terms') ? '&hide_empty=false' : '';
    const url = `${origin}/wp-json/wc/store/v1/${endpoint}?per_page=100&page=${page}${ordering}`;
    let cached;
    if (resume) {
      try { cached = JSON.parse(await readFile(path.join(output, `raw/${name}-${page}.json`), 'utf8')); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    let records, evidence;
    if (cached?.source.url === url) {
      ({ records, source: evidence } = cached);
      requests.push(evidence);
    } else {
      const result = await fetchSource(url);
      records = JSON.parse(result.body);
      evidence = result.evidence;
    }
    if (!Array.isArray(records)) throw new Error(`Non-array response: ${url}`);
    if (page === 1) {
      pages = Number(evidence.totalPages || 1);
      total = evidence.total === null ? null : Number(evidence.total);
    } else if (Number(evidence.total) !== total) {
      throw new Error(`Catalog changed during pagination: ${url}; run collection again`);
    }
    rows.push(...records);
    await save(`raw/${name}-${page}.json`, { source: evidence, records });
    console.log(`${name}: page ${page}/${pages}, ${rows.length}/${total ?? '?'} records`);
    await pause(200);
  }
  if (total !== null && rows.length !== total) {
    if (endpoint === 'products' || rows.length < total) throw new Error(`${name}: incomplete pagination`);
    sourceWarnings.push(`${name}: API header reports ${total}, but complete pagination returns ${rows.length} unique records; all returned records retained.`);
  }
  if (new Set(rows.map(row => row.id)).size !== rows.length) throw new Error(`${name}: duplicate IDs`);
  return rows;
}

function parseShop(body, evidence, page) {
  const cards = [...body.matchAll(/<li\b[^>]*class="([^"]*\btype-product\b[^"]*)"[^>]*>([\s\S]*?)<\/li>/g)];
  const products = cards.map(([, classes, html]) => ({
    id: Number(classes.match(/\bpost-(\d+)\b/)?.[1]),
    sku: html.match(/data-product_sku="([^"]*)"/)?.[1] ?? null,
    classes: classes.split(/\s+/),
  }));
  if (!products.length || products.some(product => !product.id)) throw new Error(`No valid product cards on shop page ${page}`);
  return { page, ...evidence, products };
}

async function collectShop() {
  const first = await fetchSource(`${origin}/shop/`);
  const last = Math.max(1, ...[...first.body.matchAll(/\/shop\/page\/(\d+)\//g)].map(match => Number(match[1])));
  const pages = [parseShop(first.body, first.evidence, 1)];
  // Two requests at a time keep load modest while covering the complete archive.
  for (let page = 2; page <= last; page += 2) {
    const results = await Promise.allSettled(Array.from({ length: Math.min(2, last - page + 1) }, async (_, offset) => {
      const number = page + offset;
      const result = await fetchSource(`${origin}/shop/page/${number}/`);
      return parseShop(result.body, result.evidence, number);
    }));
    for (const result of results) {
      if (result.status === 'fulfilled') pages.push(result.value);
      else failures.push(String(result.reason));
    }
    console.log(`Shop: checked through page ${Math.min(page + 1, last)}/${last}`);
    await pause(200);
  }
  return { expectedPages: last, pages };
}

// Plain-text convenience fields; the exact HTML remains in raw and normalized data.
function plain(value = '') {
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', times: '×', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' };
  return value.replace(/<\/(?:p|div|li|tr|h[1-6])\s*>|<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&#(x[\da-f]+|\d+);|&([a-z]+);/gi, (full, number, name) => {
      if (!number) return entities[name.toLowerCase()] ?? full;
      const code = number[0].toLowerCase() === 'x' ? parseInt(number.slice(1), 16) : Number(number);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : full;
    }).replace(/[\t \u00a0]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function amount(value, minorUnit) {
  return typeof value === 'string' && /^\d+$/.test(value) && Number.isInteger(minorUnit)
    ? Number(value) / 10 ** minorUnit : null;
}

let products, categories, attributes, shop, attributeTerms = {}, variationDetails = [];
if (offline || enrich) {
  ({ products, categories, attributes, shop, attributeTerms = {}, variationDetails = [] } = JSON.parse(await readFile(path.join(output, 'snapshot.json'), 'utf8')));
} else {
  products = await collection('products', 'products');
  categories = await collection('products/categories', 'categories');
  try { attributes = await collection('products/attributes', 'attributes'); }
  catch (error) { attributes = []; failures.push(String(error)); }
  shop = await collectShop();
  await save('snapshot.json', { products, categories, attributes, shop });
  await save('requests.json', { requests, failures, sourceWarnings });
}

if (!offline) {
  const prior = JSON.parse(await readFile(path.join(output, 'requests.json'), 'utf8'));
  const requestStart = requests.length;
  const failureStart = failures.length;
  for (const attribute of attributes) {
    try { attributeTerms[attribute.taxonomy] = await collection(`products/attributes/${attribute.id}/terms`, `attribute-${attribute.id}-terms`); }
    catch (error) { failures.push(String(error)); }
  }
  variationDetails = [];
  for (const product of products) for (const variation of product.variations || []) {
    try {
      const result = await fetchSource(`${origin}/wp-json/wc/store/v1/products/${variation.id}`);
      const record = JSON.parse(result.body);
      if (record.id !== variation.id) throw new Error(`Variation ID mismatch: ${variation.id}`);
      variationDetails.push({ parentId: product.id, source: result.evidence, record });
      await save(`raw/variation-${variation.id}.json`, { source: result.evidence, record });
    } catch (error) { failures.push(String(error)); }
    await pause(200);
  }
  await save('snapshot.json', { products, categories, attributes, shop, attributeTerms, variationDetails });
  await save('requests.json', {
    requests: [...prior.requests, ...requests.slice(requestStart)],
    failures: [...prior.failures, ...failures.slice(failureStart)], sourceWarnings: prior.sourceWarnings,
  });
}

const savedEvidence = JSON.parse(await readFile(path.join(output, 'requests.json'), 'utf8'));
const shopIds = new Set(shop.pages.flatMap(page => page.products.map(product => product.id)));
const apiIds = new Set(products.map(product => product.id));
const shopOnly = [...shopIds].filter(id => !apiIds.has(id));
const apiOnly = [...apiIds].filter(id => !shopIds.has(id));
const normalized = products.map(product => {
  const descriptions = [plain(product.short_description), plain(product.description)].filter(Boolean);
  const lines = [...new Set(descriptions.flatMap(description => description.split('\n')))];
  return {
    id: String(product.id), sourceProduct: product.permalink, sourceSlug: product.slug,
    sourceName: plain(product.name), sku: product.sku || null, type: product.type,
    parentId: product.parent || null,
    shortDescription: plain(product.short_description), description: plain(product.description),
    shortDescriptionHtml: product.short_description, descriptionHtml: product.description,
    specificationLines: lines.filter(line => /(?:diameter|height|width|length|base|capacity|volume|weight|ขนาด|สูง|กว้าง|ยาว|ความจุ|น้ำหนัก|เส้นผ่านศูนย์กลาง|\b\d+(?:[.,]\d+)?\s*(?:cm|mm|ml|oz|kg)\b)/i.test(line)),
    price: amount(product.prices.price, product.prices.currency_minor_unit),
    regularPrice: amount(product.prices.regular_price, product.prices.currency_minor_unit),
    salePrice: amount(product.prices.sale_price, product.prices.currency_minor_unit),
    currency: product.prices.currency_code, sourcePrices: product.prices, onSale: product.on_sale,
    categories: product.categories, tags: product.tags, brands: product.brands,
    // Exact brand taxonomy evidence is retained, without guessing from image names.
    brandCategories: product.categories.filter(category => /\/product-category\/brands\/[^/]+\//.test(category.link)),
    images: product.images, attributes: product.attributes, variations: product.variations,
    variationDetails: variationDetails.filter(variation => variation.parentId === product.id).map(variation => variation.record),
    groupedProducts: product.grouped_products,
    availability: {
      inStock: product.is_in_stock, purchasable: product.is_purchasable,
      onBackorder: product.is_on_backorder, lowStockRemaining: product.low_stock_remaining,
      source: product.stock_availability,
    },
    averageRating: product.average_rating, reviewCount: product.review_count,
    soldIndividually: product.sold_individually, hasOptions: product.has_options,
    purchaseLimits: { minimum: product.add_to_cart?.minimum ?? null, maximum: product.add_to_cart?.maximum ?? null, multipleOf: product.add_to_cart?.multiple_of ?? null },
    shopPages: shop.pages.filter(page => page.products.some(row => row.id === product.id)).map(page => page.url),
  };
});

const catalogText = await readFile(path.join(root, 'src/lib/catalog.ts'), 'utf8');
const legacy = JSON.parse(await readFile(path.join(root, 'src/lib/legacy-products-data.json'), 'utf8'));
const existingIds = new Set([...catalogText.matchAll(/"id": "(\d+)"/g)].map(match => match[1]).concat(legacy.map(product => product.id)));
const skus = new Map();
for (const product of normalized) if (product.sku) skus.set(product.sku, [...(skus.get(product.sku) || []), product.id]);
const report = {
  source: origin, collectedFrom: savedEvidence.requests[0]?.fetchedAt,
  collectedThrough: savedEvidence.requests.at(-1)?.fetchedAt,
  productCount: products.length, categoryCount: categories.length, attributeCount: attributes.length,
  attributeTermCount: Object.values(attributeTerms).reduce((count, terms) => count + terms.length, 0),
  variationCount: products.reduce((count, product) => count + product.variations.length, 0),
  variationsWithDetails: variationDetails.length,
  shopPagesExpected: shop.expectedPages, shopPagesCollected: shop.pages.length,
  shopUniqueProducts: shopIds.size, shopOnly, apiOnly,
  shopCardCount: shop.pages.reduce((count, page) => count + page.products.length, 0),
  existingProjectProducts: existingIds.size,
  additionalProducts: normalized.filter(product => !existingIds.has(product.id)).length,
  existingProductsAbsentFromSource: [...existingIds].filter(id => !apiIds.has(Number(id))),
  productsWithDescription: normalized.filter(product => product.description || product.shortDescription).length,
  productsWithSpecificationLines: normalized.filter(product => product.specificationLines.length).length,
  productsWithImages: normalized.filter(product => product.images.length).length,
  imageReferences: normalized.reduce((count, product) => count + product.images.length, 0),
  uniqueOriginalImageUrls: new Set(normalized.flatMap(product => product.images.map(image => image.src))).size,
  missingSkuIds: normalized.filter(product => !product.sku).map(product => product.id),
  missingPriceIds: normalized.filter(product => product.price === null).map(product => product.id),
  missingImageIds: normalized.filter(product => !product.images.length).map(product => product.id),
  duplicateSkus: [...skus].filter(([, ids]) => ids.length > 1).map(([sku, ids]) => ({ sku, ids })),
  types: Object.fromEntries([...new Set(products.map(product => product.type))].map(type => [type, products.filter(product => product.type === type).length])),
  failures: savedEvidence.failures,
  sourceWarnings: savedEvidence.sourceWarnings || [],
};
await save('products.json', normalized);
await save('categories.json', categories);
await save('attributes.json', attributes);
await save('attribute-terms.json', attributeTerms);
await save('variations.json', variationDetails);
await save('shop-pages.json', shop);
await save('report.json', report);
const images = new Map();
for (const product of normalized) for (const image of product.images) {
  const row = images.get(image.src) || { source: image.src, attachmentId: image.id, thumbnail: image.thumbnail, srcset: image.srcset, name: image.name, alt: image.alt, productIds: [] };
  row.productIds.push(product.id);
  images.set(image.src, row);
}
await save('images.json', [...images.values()]);
const cell = value => String(value ?? '').replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ');
const index = [
  '# JJGLASS source product index', '',
  `Collected ${snapshotDate}. ${normalized.length} products; source names, source SKUs, and snapshot prices.`, '',
  'Complete descriptions, specifications, galleries, category assignments, and variants are in products.json. Missing source SKUs remain blank. Prices and availability are snapshots, not a live feed.', '',
  '| Source ID | SKU | Product | Price | Brand category | Gallery images |',
  '| --- | --- | --- | ---: | --- | ---: |',
  ...normalized.map(product => `| ${product.id} | ${cell(product.sku)} | [${cell(product.sourceName).replace(/\[/g, '\\[').replace(/\]/g, '\\]')}](${product.sourceProduct}) | ${product.price} ${product.currency} | ${cell(product.brandCategories.map(category => category.name).join(', '))} | ${product.images.length} |`),
  '',
];
await writeFile(path.join(output, 'PRODUCT_INDEX.md'), index.join('\n'), 'utf8');
console.log(JSON.stringify(report, null, 2));
if (shopOnly.length || apiOnly.length || shop.pages.length !== shop.expectedPages || savedEvidence.failures.length) process.exitCode = 1;
