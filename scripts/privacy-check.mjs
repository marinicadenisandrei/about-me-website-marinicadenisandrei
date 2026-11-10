#!/usr/bin/env node
/**
 * Fails when the repo or dist/ contains personal-data shapes that must never be published:
 * Romanian mobile numbers, +40 prefixes, street-address tokens, postal codes next to "Bucharest",
 * birth dates, "date of birth". Patterns are generic on purpose, no real values live in this file.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const SKIP = new Set(['node_modules', 'dist', '.git', '.astro', '_dev']);
const PATTERNS = [
  /\b07\d{8}\b/, /\+40\s?\d{2}/, /\bdate of birth\b/i, /\bSector\s?[1-6]\b/i,
  /\b(?:strada|bl\.\s?[A-Z]\d|sc\.\s?[A-Z]\b|et\.\s?\d|ap(?:t)?\.\s?\d)/i, /\b0[0-9]{5}\b(?=.*Bucharest)/i, /\b(?:19[6-9]\d|200\d)-(?:0\d|1[0-2])-(?:[0-2]\d|3[01])\b/,
];
const ALLOW = /TODO\.md|README\.md|privacy-check\.mjs|business\.ts|cv\.astro|udemy\/.*\.json$|\.lock$|package-lock\.json|enrolledDate|certificat|"date"/;
let hits = 0;
function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (SKIP.has(n)) continue;
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!/\.(md|mdx|astro|ts|mjs|js|json|html|css|xml|txt|yml|yaml|csv|webmanifest)$/.test(n)) continue;
    const lines = readFileSync(p, 'utf8').split('\n');
    lines.forEach((l, i) => {
      if (ALLOW.test(p) || ALLOW.test(l)) return;
      for (const re of PATTERNS) if (re.test(l)) { hits++; console.error(`✖ ${p}:${i + 1}: ${l.trim().slice(0, 100)}`); break; }
    });
  }
}
walk(process.argv[2] ?? '.');
if (process.argv.includes('--dist')) walk('dist');
console.log(hits ? `✖ ${hits} possible personal-data line(s)` : '✔ privacy check: no personal-data patterns found');
process.exit(hits ? 1 : 0);
