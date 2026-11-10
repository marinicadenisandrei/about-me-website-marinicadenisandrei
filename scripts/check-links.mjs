#!/usr/bin/env node
/**
 * Post-build link checker (runs automatically after `astro build`).
 *
 * Fails the build when a page in dist/ contains:
 *   1. an internal absolute URL that does NOT start with the configured base path
 *      (i.e. someone wrote href="/projects" instead of going through withBase()), or
 *   2. an internal link/asset that points to a file that doesn't exist in dist/.
 *
 * Reads BASE_PATH from the environment, exactly like astro.config.mjs.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const BASE = normalizeBase(process.env.BASE_PATH ?? '/');

function normalizeBase(b) {
  if (!b || b === '/') return '';
  return '/' + b.replace(/^\/+|\/+$/g, '');
}

if (!existsSync(DIST)) {
  console.error('✖ dist/ not found, run `astro build` first.');
  process.exit(1);
}

/** Recursively list .html files. */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

/** Does a site-relative path (already base-stripped) resolve to something in dist/? */
function existsInDist(pathname) {
  const clean = decodeURIComponent(pathname.split(/[?#]/)[0] ?? '');
  if (clean === '' || clean === '/') return existsSync(join(DIST, 'index.html'));
  const candidates = [
    join(DIST, clean),
    join(DIST, clean, 'index.html'),
    join(DIST, clean.replace(/\/$/, '') + '.html'),
  ];
  return candidates.some((c) => existsSync(c));
}

const ATTR_RE = /\b(?:href|src|srcset|content|action|poster|data-src)\s*=\s*"([^"]*)"/gi;
const ALLOWED_EXTERNAL = /^(https?:)?\/\/|^mailto:|^tel:|^#|^data:|^javascript:|^blob:/i;

const pages = walk(DIST);
const baseErrors = [];
const brokenLinks = [];
let checked = 0;

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const rel = file.slice(DIST.length);
  for (const m of html.matchAll(ATTR_RE)) {
    // srcset may hold several candidates
    const values = m[0].startsWith('srcset') ? m[1].split(',').map((s) => s.trim().split(/\s+/)[0]) : [m[1]];
    for (const raw of values) {
      const v = raw.trim();
      if (!v || ALLOWED_EXTERNAL.test(v)) continue;
      // <meta content="..."> only matters when it's a URL
      if (m[0].startsWith('content') && !v.startsWith('/')) continue;
      if (!v.startsWith('/')) continue; // relative links are resolved by the browser; ignore
      checked++;
      if (BASE && !(v === BASE || v.startsWith(BASE + '/'))) {
        baseErrors.push(`${rel}: "${v}" is missing base path "${BASE}"`);
        continue;
      }
      const siteRel = BASE ? v.slice(BASE.length) || '/' : v;
      if (!existsInDist(siteRel)) brokenLinks.push(`${rel}: "${v}" -> not found in dist/`);
    }
  }
}

const unique = (a) => [...new Set(a)];
const be = unique(baseErrors);
const bl = unique(brokenLinks);

console.log(`Link check: ${pages.length} pages, ${checked} internal URLs, base "${BASE || '/'}"`);
if (be.length) {
  console.error(`\n✖ ${be.length} internal URL(s) bypass the base path (use withBase() / <Link>):`);
  be.slice(0, 50).forEach((e) => console.error('  ' + e));
}
if (bl.length) {
  console.error(`\n✖ ${bl.length} broken internal link(s):`);
  bl.slice(0, 50).forEach((e) => console.error('  ' + e));
}
if (be.length || bl.length) process.exit(1);
console.log('✔ All internal links carry the base path and resolve.');
