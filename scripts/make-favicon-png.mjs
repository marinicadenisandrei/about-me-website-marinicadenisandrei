/**
 * PNG icons from public/favicon.svg (the "DM" monogram, dark variant):
 * favicon-64/128, apple-touch-icon (180, full-bleed square: iOS rounds it) and the app icons 192/512.
 * Run after scripts/make-favicon.py:  node scripts/make-favicon-png.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const svg = fs.readFileSync(path.join(ROOT, 'public/favicon.svg'), 'utf8').replace(/@media[^}]*\}\}/, ''); // rasterise the dark variant
// square, full-bleed version for Apple / app icons: same monogram on a graphite square, no ring
const square = svg
  .replace('<circle class="bg" cx="32" cy="32" r="31"/>', '<rect class="bg" width="64" height="64"/>')
  .replace('<circle class="ring" cx="32" cy="32" r="29.5"/>', '');

const out = [
  ['favicon-64.png', svg, 64],
  ['favicon-128.png', svg, 128],
  ['apple-touch-icon.png', square, 180],
  ['icon-192.png', square, 192],
  ['icon-512.png', square, 512],
];
for (const [name, src, size] of out) {
  await sharp(Buffer.from(src), { density: (72 * size) / 64 * 2 }).resize(size, size).png({ compressionLevel: 9 }).toFile(path.join(ROOT, 'public', name));
  console.log(`✔ public/${name}`);
}
