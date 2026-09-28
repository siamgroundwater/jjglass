import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destination = process.argv[2] && path.resolve(process.argv[2]);
const verifyOnly = process.argv.includes('--verify');
if (!destination || !path.isAbsolute(process.argv[2])) {
  throw new Error('Usage: node scripts/backup-product-source.mjs ABSOLUTE_DESTINATION [--verify]');
}

const sourceDate = '2026-09-28';
const sourceDirectory = path.join(projectRoot, 'data', 'jjglass-source', sourceDate);
const images = JSON.parse(await fs.readFile(path.join(sourceDirectory, 'images.json'), 'utf8'));
const products = JSON.parse(await fs.readFile(path.join(sourceDirectory, 'products.json'), 'utf8'));
const categories = JSON.parse(await fs.readFile(path.join(sourceDirectory, 'categories.json'), 'utf8'));
const report = JSON.parse(await fs.readFile(path.join(sourceDirectory, 'report.json'), 'utf8'));
if (products.length !== report.productCount || images.length !== report.uniqueOriginalImageUrls) {
  throw new Error('Source data no longer matches its collection report');
}

const urls = new Map();
function addImage(url, role, productIds = [], categoryIds = []) {
  if (!url) return;
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'jjglass.com' ||
      !parsed.pathname.startsWith('/wp-content/uploads/') || !/\.jpe?g$/i.test(parsed.pathname)) {
    throw new Error(`Unexpected image URL: ${url}`);
  }
  const key = parsed.href;
  if (!urls.has(key)) {
    const id = createHash('sha256').update(key).digest('hex');
    urls.set(key, {
      url: key,
      path: `downloaded-images/${id.slice(0, 2)}/${id}.jpg`,
      roles: new Set(), productIds: new Set(), categoryIds: new Set(),
    });
  }
  const item = urls.get(key);
  item.roles.add(role);
  for (const id of productIds) item.productIds.add(String(id));
  for (const id of categoryIds) item.categoryIds.add(String(id));
}
for (const image of images) {
  addImage(image.source, 'product-original', image.productIds);
  addImage(image.thumbnail, 'product-thumbnail', image.productIds);
}
for (const category of categories) {
  addImage(category.image?.src, 'category-original', [], [category.id]);
  addImage(category.image?.thumbnail, 'category-thumbnail', [], [category.id]);
}
const imageJobs = [...urls.values()].sort((a, b) => a.url.localeCompare(b.url));

async function sha256(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}
async function validJpeg(file) {
  try {
    const stat = await fs.stat(file);
    if (stat.size < 1024) return false;
    const handle = await fs.open(file, 'r');
    try {
      const start = Buffer.alloc(2);
      const end = Buffer.alloc(2);
      await handle.read(start, 0, 2, 0);
      await handle.read(end, 0, 2, stat.size - 2);
      return start[0] === 0xff && start[1] === 0xd8 && end[0] === 0xff && end[1] === 0xd9;
    } finally {
      await handle.close();
    }
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}
async function download(item) {
  const output = path.join(destination, item.path);
  if (await validJpeg(output)) return 'existing';
  if (verifyOnly) throw new Error('Missing or invalid image');
  await fs.mkdir(path.dirname(output), { recursive: true });
  const partial = `${output}.part`;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      await fs.rm(partial, { force: true });
      const response = await fetch(item.url, {
        headers: { 'user-agent': 'JJGLASS product backup (catalog archival)' },
        signal: AbortSignal.timeout(60000),
      });
      if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);
      await pipeline(Readable.fromWeb(response.body), createWriteStream(partial, { flags: 'wx' }));
      if (!await validJpeg(partial)) throw new Error('Incomplete or non-JPEG response');
      await fs.rename(partial, output);
      return 'downloaded';
    } catch (error) {
      await fs.rm(partial, { force: true });
      if (attempt === 4) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

const copies = [
  ['data/jjglass-source/2026-09-28', `source/${sourceDate}`],
  ['public/images', 'local-assets/images'],
  ['src/lib/source-products-data.json', 'storefront/source-products-data.json'],
  ['src/lib/catalog.ts', 'storefront/catalog.ts'],
  ['src/lib/legacy-products.ts', 'storefront/legacy-products.ts'],
  ['src/lib/legacy-products-data.json', 'storefront/legacy-products-data.json'],
  ['src/lib/existing-product-photos.json', 'storefront/existing-product-photos.json'],
  ['src/lib/new-product-photos.json', 'storefront/new-product-photos.json'],
  ['scripts/collect-products.mjs', 'reproduction/collect-products.mjs'],
  ['scripts/check-product-source.mjs', 'reproduction/check-product-source.mjs'],
  ['scripts/build-source-catalog.mjs', 'reproduction/build-source-catalog.mjs'],
  ['scripts/source-product-language.mjs', 'reproduction/source-product-language.mjs'],
];
async function listFiles(root) {
  const result = [];
  async function walk(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile()) result.push(full);
    }
  }
  await walk(root);
  return result;
}
async function copyAndVerify(sourceRelative, targetRelative) {
  const source = path.join(projectRoot, sourceRelative);
  const target = path.join(destination, targetRelative);
  if (!verifyOnly) {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.cp(source, target, { recursive: true, force: true });
  }
  const sourceFiles = (await fs.stat(source)).isDirectory() ? await listFiles(source) : [source];
  for (const file of sourceFiles) {
    const relative = path.relative(source, file);
    const saved = relative ? path.join(target, relative) : target;
    if (await sha256(file) !== await sha256(saved)) throw new Error(`Local copy differs: ${saved}`);
  }
  return sourceFiles.length;
}

await fs.mkdir(destination, { recursive: true });
let localFileCount = 0;
for (const [source, target] of copies) {
  localFileCount += await copyAndVerify(source, target);
  console.log(`Verified local copy: ${target}`);
}

let cursor = 0;
let existing = 0;
let downloaded = 0;
const failures = [];
async function worker() {
  while (cursor < imageJobs.length) {
    const index = cursor++;
    const item = imageJobs[index];
    try {
      const result = await download(item);
      if (result === 'existing') existing += 1;
      else downloaded += 1;
    } catch (error) {
      failures.push({ url: item.url, error: String(error?.message ?? error) });
    }
    if ((index + 1) % 100 === 0 || index + 1 === imageJobs.length) {
      console.log(`Images processed ${index + 1}/${imageJobs.length}; saved ${downloaded}; existing ${existing}; failed ${failures.length}`);
    }
  }
}
await Promise.all(Array.from({ length: verifyOnly ? 12 : 6 }, worker));

const manifest = [];
for (const item of imageJobs) {
  const file = path.join(destination, item.path);
  if (!await validJpeg(file)) continue;
  const stat = await fs.stat(file);
  manifest.push({
    url: item.url,
    path: item.path,
    bytes: stat.size,
    sha256: await sha256(file),
    roles: [...item.roles].sort(),
    productIds: [...item.productIds].sort(),
    categoryIds: [...item.categoryIds].sort(),
  });
}
const relativePath = url => url ? urls.get(new URL(url).href)?.path ?? null : null;
const productImages = products.map(product => ({
  id: product.id,
  sku: product.sku,
  sourceProduct: product.sourceProduct,
  images: product.images.map(image => ({
    original: relativePath(image.src),
    thumbnail: relativePath(image.thumbnail),
  })),
}));
const summary = {
  sourceDate,
  createdAt: new Date().toISOString(),
  productCount: products.length,
  originalProductImageCount: images.length,
  expectedImageFiles: imageJobs.length,
  verifiedImageFiles: manifest.length,
  downloadedThisRun: downloaded,
  alreadyPresent: existing,
  copiedLocalFileCount: localFileCount,
  totalImageBytes: manifest.reduce((sum, item) => sum + item.bytes, 0),
  complete: failures.length === 0 && manifest.length === imageJobs.length,
  failures,
};
await fs.writeFile(path.join(destination, 'image-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
await fs.writeFile(path.join(destination, 'product-image-map.json'), `${JSON.stringify(productImages, null, 2)}\n`);
await fs.writeFile(path.join(destination, 'backup-status.json'), `${JSON.stringify(summary, null, 2)}\n`);
await fs.writeFile(path.join(destination, 'README.md'), `# JJGLASS product backup\n\nSource snapshot: ${sourceDate}. Products: ${products.length}. Original product photos: ${images.length}. This backup also includes distinct product thumbnails and category photos; automatic responsive srcset resizes beyond the original and thumbnail are referenced in the source data but not separately downloaded.\n\n- \`source/${sourceDate}/\`: full collected product and source API data, including raw responses and provenance.\n- \`downloaded-images/\`: downloaded original photos and thumbnails. \`image-manifest.json\` maps each source URL to a local file and SHA-256 checksum.\n- \`product-image-map.json\`: product IDs, SKUs, and paths to their local images.\n- \`local-assets/images/\`: the project's existing local imagery for the original 84 presentation products and other site assets.\n- \`storefront/\`: the generated additional storefront records and the code/data defining the original presentation catalog.\n- \`reproduction/\`: source collection and catalog generation scripts from the project.\n- \`backup-status.json\`: counts, total bytes, and any failed image URLs.\n\nThis is a dated archive, not a live stock or price feed. Re-run the project script with the same destination to resume missing downloads and verify all files.\n`);
console.log(JSON.stringify(summary, null, 2));
if (!summary.complete) process.exitCode = 1;
