import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { access, copyFile, mkdir, readFile, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const archive = process.argv[2] && path.resolve(process.argv[2]);
const verifyOnly = process.argv.includes('--verify');
if (!archive || !path.isAbsolute(process.argv[2])) {
  throw new Error('Usage: node scripts/import-backed-up-images.mjs ABSOLUTE_BACKUP_DIRECTORY [--verify]');
}

const status = JSON.parse(await readFile(path.join(archive, 'backup-status.json'), 'utf8'));
const manifest = JSON.parse(await readFile(path.join(archive, 'image-manifest.json'), 'utf8'));
assert.equal(status.complete, true, 'Backup is not marked complete');
assert.equal(status.expectedImageFiles, manifest.length, 'Backup image count differs from its manifest');
const imageRoot = path.join(projectRoot, 'public', 'images', 'source');

async function sha256(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}

function checkedPaths(item) {
  const url = new URL(item.url);
  assert.equal(url.protocol, 'https:');
  assert.equal(url.hostname, 'jjglass.com');
  assert.match(url.pathname, /^\/wp-content\/uploads\/.*\.jpe?g$/i);
  const id = createHash('sha256').update(url.href).digest('hex');
  assert.equal(item.path, `downloaded-images/${id.slice(0, 2)}/${id}.jpg`);
  assert.match(item.sha256, /^[a-f0-9]{64}$/);
  return {
    from: path.join(archive, item.path),
    to: path.join(imageRoot, id.slice(0, 2), `${id}.jpg`),
  };
}

let cursor = 0;
let processed = 0;
let copied = 0;
let existing = 0;
let checkedBytes = 0;
async function worker() {
  while (cursor < manifest.length) {
    const item = manifest[cursor++];
    const { from, to } = checkedPaths(item);
    const source = await stat(from);
    assert.equal(source.size, item.bytes, `Backup size mismatch: ${item.path}`);
    assert.equal(await sha256(from), item.sha256, `Backup checksum mismatch: ${item.path}`);
    let targetExists = true;
    try { await access(to); } catch { targetExists = false; }
    if (targetExists) {
      assert.equal(await sha256(to), item.sha256, `Project image differs from backup: ${to}`);
      existing += 1;
    } else if (verifyOnly) {
      throw new Error(`Project image missing: ${to}`);
    } else {
      await mkdir(path.dirname(to), { recursive: true });
      const partial = `${to}.${process.pid}.part`;
      try {
        await copyFile(from, partial);
        assert.equal(await sha256(partial), item.sha256, `Copied image differs: ${to}`);
        await rename(partial, to);
      } finally {
        await rm(partial, { force: true });
      }
      copied += 1;
    }
    checkedBytes += item.bytes;
    processed += 1;
    if (processed % 500 === 0 || processed === manifest.length) {
      console.log(`Verified ${processed}/${manifest.length} images; copied ${copied}; already present ${existing}`);
    }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));

const dataDir = path.join(projectRoot, 'data', 'jjglass-source', status.sourceDate);
for (const name of ['image-manifest.json', 'product-image-map.json']) {
  const source = path.join(archive, name);
  const target = path.join(dataDir, name);
  if (!verifyOnly) await copyFile(source, target);
  assert.equal(await sha256(source), await sha256(target), `Copied manifest differs: ${name}`);
}
console.log(JSON.stringify({ products: status.productCount, imageFiles: manifest.length, copied, existing, bytes: checkedBytes, verified: true }));
