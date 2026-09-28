import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { localizeSourceProduct } from './source-product-language.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'data/jjglass-source/2026-09-28');
const [sourceProducts, sourceCategories, legacy, catalog] = await Promise.all([
  readFile(path.join(sourceDir, 'products.json'), 'utf8').then(JSON.parse),
  readFile(path.join(sourceDir, 'categories.json'), 'utf8').then(JSON.parse),
  readFile(path.join(root, 'src/lib/legacy-products-data.json'), 'utf8').then(JSON.parse),
  readFile(path.join(root, 'src/lib/catalog.ts'), 'utf8'),
]);

const existingIds = new Set([...catalog.matchAll(/"id": "(\d+)"/g)].map(match => match[1]).concat(legacy.map(product => product.id)));
assert.equal(existingIds.size, 84, 'Expected 84 existing storefront products');
const byCategoryId = new Map(sourceCategories.map(category => [category.id, category]));
const storefrontCategories = new Set(['drinkware', 'stemware', 'vase', 'jar', 'tableware', 'base', 'cover', 'bottle', 'candle-stand']);

function rootCategory(id) {
  let category = byCategoryId.get(id);
  const visited = new Set();
  while (category?.parent) {
    if (visited.has(category.id)) throw new Error(`Category loop at ${id}`);
    visited.add(category.id);
    category = byCategoryId.get(category.parent);
  }
  return category?.slug || '';
}

function storefrontCategory(product) {
  const roots = product.categories.map(category => rootCategory(category.id));
  return roots.find(root => storefrontCategories.has(root)) || 'others';
}

const generated = sourceProducts.filter(product => !existingIds.has(product.id)).map(product => {
  const category = storefrontCategory(product);
  const firstImage = product.images[0];
  assert.ok(firstImage, `Missing image for ${product.id}`);
  const { name, description } = localizeSourceProduct(product, category);
  assert.ok(name.th && name.en && description.th && description.en, `Missing localized text for ${product.id}`);
  const brand = product.brandCategories[0]?.name || product.tags.find(tag => ['LYNX', 'LUCE', 'AMORN', 'OCEAN', 'LUCKY GLASS'].includes(tag.name.toUpperCase()))?.name || '';
  const match = product.sourceName.match(/(\d[\d,.]*)\s*(ml\.?|มล\.?|oz\.?|l\b)/i);
  return {
    id: product.id,
    slug: `source-${product.id}`,
    sku: product.sku || '',
    name,
    description,
    category,
    brand: brand.toUpperCase() === 'OCEAN' ? 'Ocean' : brand,
    price: product.price,
    image: firstImage.src,
    thumbnail: firstImage.thumbnail || firstImage.src,
    images: [...new Set(product.images.map(image => image.src))],
    ...(match ? { capacity: `${match[1]} ${match[2].replace(/\.$/, '')}` } : {}),
    available: product.availability.inStock,
    hasOptions: product.hasOptions,
    ...(product.hasOptions ? { sourceProduct: product.sourceProduct } : {}),
  };
});

assert.equal(sourceProducts.length, 1464);
assert.equal(generated.length, 1380);
assert.equal(new Set(generated.map(product => product.id)).size, generated.length);
assert.equal(new Set(generated.map(product => product.slug)).size, generated.length);
assert.ok(generated.every(product => Number.isFinite(product.price) && product.price > 0));
assert.ok(generated.every(product => product.images.length > 0));
await writeFile(path.join(root, 'src/lib/source-products-data.json'), `${JSON.stringify(generated)}\n`, 'utf8');
console.log(`Built ${generated.length} storefront products from the dated source; preserved ${existingIds.size} existing product IDs.`);
