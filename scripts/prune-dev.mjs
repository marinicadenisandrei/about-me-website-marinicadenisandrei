#!/usr/bin/env node
/** Removes dev-only assets (public/_dev -> dist/_dev) from production builds unless STYLEGUIDE=1. */
import { rmSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'dist', '_dev');
if (process.env.STYLEGUIDE !== '1' && existsSync(dir)) {
  rmSync(dir, { recursive: true, force: true });
  console.log('✔ pruned dist/_dev (dev-only assets)');
}
