/**
 * Generates one transparent "clipart" PNG logo per technology:
 *   public/tech/<slug>.png      128 px (cards, headers)
 *   public/tech/sm/<slug>.png    48 px (pills)
 * plus a light version for dark mode (public/tech/dark/, public/tech/sm/dark/) when a logo is mostly black or grey,
 * and src/config/tech-logos.json with the generated slugs and the ones that have a dark-mode version.
 *
 * Sources, in order of preference:
 *   1. devicon (MIT): full-colour brand artwork
 *   2. simple-icons (CC0): brand glyph in the brand colour
 *   3. Tabler icons (MIT): a neutral glyph for concepts (testing, networking, MLOps, ...)
 *   4. a monogram, so every technology has a logo
 *
 * Run after adding a technology to src/config/stack.ts or to a content `stack:` list:
 *   npm run logos
 * The PNGs are committed, so CI does not need to run this.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NM = path.join(ROOT, 'node_modules');
const OUT = path.join(ROOT, 'public', 'tech');
const DEVICON = path.join(NM, 'devicon', 'icons');
const SIMPLE = path.join(NM, 'simple-icons');
const TABLER = path.join(NM, '@tabler', 'icons', 'icons', 'outline');

const SIZE = 128;
const GLYPH = 116;
const CONCEPT_COLOR = '#4F46E5';
/** Concept icons: gradient stroke in the site's indigo, violet and cyan. */
const CONCEPT_GRADIENT = '<defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="2" y1="2" x2="22" y2="22"><stop offset="0" stop-color="#4F46E5"/><stop offset="0.55" stop-color="#9333EA"/><stop offset="1" stop-color="#0891B2"/></linearGradient></defs>';

/** Technology slug -> devicon folder name, when they differ. */
const DEVICON_MAP = {
  aws: 'amazonwebservices', ec2: 'amazonwebservices', s3: 'amazonwebservices', lambda: 'amazonwebservices',
  cloudfront: 'amazonwebservices', azure: 'azure', bicep: 'azure', 'azure-devops': 'azuredevops',
  gcp: 'googlecloud', 'github-actions': 'githubactions', cpp: 'cplusplus', 'raspberry-pi': 'raspberrypi',
  'scikit-learn': 'scikitlearn', 'tailwind-css': 'tailwindcss', kafka: 'apachekafka', windows: 'windows11',
  'windows-server': 'windows8', 'matlab-simulink': 'matlab', 'eclipse-capella': 'eclipse', awx: 'ansible',
  'argo-cd': 'argocd', vite: 'vitejs', loki: 'grafanaloki', sql: 'microsoftsqlserver', nodejs: 'nodejs', 'vs-code': 'vscode', vscode: 'vscode',
};
/** Technology slug -> simple-icons slug, when they differ (devicon has no artwork). */
const SIMPLE_MAP = { tensorrt: 'nvidia', triton: 'nvidia', opa: 'openpolicyagent', zephyr: 'zephyrproject' };
/** Concepts and tools without brand artwork -> Tabler glyph. */
const TABLER_MAP = {
  'private-cloud': 'cloud-lock', agile: 'refresh-dot', can: 'car', canoe: 'device-desktop-analytics', capl: 'code', catboost: 'binary-tree',
  lightgbm: 'binary-tree', xgboost: 'binary-tree', ccsds: 'satellite', 'computer-vision': 'eye',
  cybersecurity: 'shield-lock', 'design-patterns': 'components', dxl: 'code', embedded: 'cpu', fmea: 'alert-triangle',
  freertos: 'cpu-2', 'functional-safety': 'shield-check', gdb: 'bug', haptics: 'hand-finger', i2c: 'plug-connected',
  'ibm-doors': 'file-text', 'industrial-robotics': 'robot', kawasaki: 'robot', kustomize: 'adjustments',
  ldap: 'users-group', 'machine-learning': 'brain', mlops: 'infinity', networking: 'network', nftables: 'wall',
  nunit: 'test-pipe', oidc: 'key', oop: 'box', opa: 'gavel', 'opc-ua': 'building-factory-2', openocd: 'bug',
  openxr: 'cardboards', plc: 'building-factory', polarion: 'list-check', profinet: 'network',
  'requirements-management': 'checklist', rest: 'api', scada: 'gauge', selinux: 'lock', servicenow: 'ticket',
  'spatial-audio': 'headphones', spi: 'cpu', 'systems-engineering': 'hierarchy-3', 'test-automation': 'checkup-list',
  testing: 'test-pipe', 'universal-robots': 'robot', websocket: 'arrows-exchange', zephyr: 'wind',
  devops: 'repeat', devsecops: 'shield-code', gns3: 'router', iptables: 'wall', algorithms: 'binary-tree-2',
  'generative-ai': 'sparkles', 'virtual-reality': 'cardboards', 'audio-processing': 'wave-sine', electronics: 'circuit-resistor',
};

// ---------- read the registry and every slug used in content ----------
const stackSrc = fs.readFileSync(path.join(ROOT, 'src/config/stack.ts'), 'utf8');
const registry = {};
for (const m of stackSrc.matchAll(/^\s+'?([a-z0-9.+-]+)'?: \{ label: '([^']+)'(?:, icon: '([^']+)')?/gm)) registry[m[1]] = { label: m[2], icon: m[3] };
const synonyms = {};
const synBlock = stackSrc.split('STACK_SYNONYMS')[1]?.split('};')[0] ?? '';
for (const m of synBlock.matchAll(/'?([a-z0-9.+-]+)'?: '([a-z0-9.+-]+)'/g)) synonyms[m[1]] = m[2];

const used = new Set(Object.keys(registry));
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (/\.(md|mdx|json)$/.test(f.name)) {
      for (const m of fs.readFileSync(p, 'utf8').matchAll(/"?stack"?\s*:\s*\[([^\]]*)\]/g)) {
        m[1].split(',').map((s) => s.trim().replace(/["']/g, '')).filter(Boolean).forEach((s) => used.add(synonyms[s] ?? s));
      }
    }
  }
})(path.join(ROOT, 'src/content'));

// ---------- helpers ----------
const luminance = (hex) => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const darken = (hex, f) => '#' + [0, 2, 4].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * f).toString(16).padStart(2, '0')).join('');

function deviconSvg(name) {
  const dir = path.join(DEVICON, name);
  if (!fs.existsSync(dir)) return null;
  for (const v of ['original', 'plain', 'line']) {
    const f = path.join(dir, `${name}-${v}.svg`);
    if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8');
  }
  return null;
}
let simpleData;
function simpleSvg(name) {
  simpleData ??= JSON.parse(fs.readFileSync(path.join(SIMPLE, 'data', 'simple-icons.json'), 'utf8'));
  const f = path.join(SIMPLE, 'icons', `${name}.svg`);
  if (!fs.existsSync(f)) return null;
  const list = Array.isArray(simpleData) ? simpleData : simpleData.icons;
  const meta = list.find((i) => (i.slug ?? '') === name) ?? list.find((i) => i.title.toLowerCase().replace(/[^a-z0-9]/g, '') === name);
  let hex = (meta?.hex ?? '334155').replace('#', '');
  if (luminance(hex) > 0.5) hex = darken(hex, 0.62).slice(1);
  return fs.readFileSync(f, 'utf8').replace('<svg ', `<svg fill="#${hex}" `);
}
function tablerSvg(name) {
  const f = path.join(TABLER, `${name}.svg`);
  if (!fs.existsSync(f)) return null;
  return fs.readFileSync(f, 'utf8')
    .replace(/(<svg[^>]*>)/, `$1${CONCEPT_GRADIENT}`)
    .replaceAll('stroke="currentColor"', 'stroke="url(#g)"')
    .replace(/stroke-width="2"/, 'stroke-width="1.75"');
}
function monogramSvg(label) {
  const letters = label.replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="66" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${letters.length > 1 ? 44 : 54}" font-weight="700" fill="${CONCEPT_COLOR}">${letters}</text></svg>`;
}

/** Renders a glyph SVG to GLYPH px; returns null if it is (almost) invisible on white. */
async function renderGlyph(svg) {
  const png = await sharp(Buffer.from(svg), { density: 600 }).resize(GLYPH * 2, GLYPH * 2, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  let ink = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const a = data[i + 3] / 255;
    const l = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
    if (a > 0.2 && l < 0.88) ink++;
  }
  return ink > 160 ? png : null;
}

const SMALL = 48;
const DIRS = { lg: OUT, sm: path.join(OUT, 'sm'), lgDark: path.join(OUT, 'dark'), smDark: path.join(OUT, 'sm', 'dark') };
for (const dir of Object.values(DIRS)) {
  fs.mkdirSync(dir, { recursive: true });
  for (const f of fs.readdirSync(dir)) if (f.endsWith('.png')) fs.unlinkSync(path.join(dir, f));
}

/** Pads the glyph onto a transparent square canvas. */
async function canvas(glyph, size) {
  const inner = Math.round(size * (GLYPH / SIZE));
  const g = await sharp(glyph).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const off = Math.round((size - inner) / 2);
  return sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: g, left: off, top: off }]).png();
}

const rgbToHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
};
const hslToRgb = (h, s, l) => {
  if (!s) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
};

/**
 * Dark-mode version for logos with a lot of dark ink (GitHub, Next.js, Ansible, AWS, Django, Helm, ...):
 * greys are inverted (black <-> white) and dark colours are lightened with the same hue. Returns null when not needed.
 */
async function darkVersion(png) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let ink = 0, dark = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 60) continue;
    ink++;
    if (rgbToHsl(data[i], data[i + 1], data[i + 2])[2] < 0.3) dark++;
  }
  if (!ink || dark / ink < 0.12) return null;
  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += 4) {
    if (!out[i + 3]) continue;
    const [h, s, l] = rgbToHsl(out[i], out[i + 1], out[i + 2]);
    let rgb = null;
    if (s < 0.18) rgb = hslToRgb(h, s, 1 - l * 0.92);
    else if (l < 0.4) rgb = hslToRgb(h, Math.min(1, s * 0.85), 0.78 - l * 0.5);
    if (rgb) [out[i], out[i + 1], out[i + 2]] = rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))));
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

const report = { devicon: 0, simple: 0, concept: 0, monogram: 0 };
const generated = [];
const withDark = [];
for (const slug of [...used].sort()) {
  const label = registry[slug]?.label ?? slug;
  const candidates = [
    ['devicon', () => deviconSvg(DEVICON_MAP[slug] ?? slug) ?? deviconSvg(slug.replace(/[-.]/g, ''))],
    ['simple', () => simpleSvg(SIMPLE_MAP[slug] ?? registry[slug]?.icon ?? slug) ?? simpleSvg(slug.replace(/[-.]/g, ''))],
    ['concept', () => (TABLER_MAP[slug] ? tablerSvg(TABLER_MAP[slug]) : null)],
    ['monogram', () => monogramSvg(label)],
  ];
  // concepts with an explicit Tabler mapping skip brand look-ups (e.g. "testing" is not a brand)
  if (TABLER_MAP[slug] && !DEVICON_MAP[slug] && !SIMPLE_MAP[slug]) candidates.unshift(candidates.splice(2, 1)[0]);
  let glyph = null;
  let source = '';
  for (const [name, get] of candidates) {
    const svg = get();
    if (!svg) continue;
    try { glyph = await renderGlyph(svg); } catch { glyph = null; }
    if (glyph) { source = name; break; }
  }
  const png = { compressionLevel: 9, palette: true, quality: 92 };
  const lg = await (await canvas(glyph, SIZE)).toBuffer();
  const sm = await (await canvas(glyph, SMALL)).toBuffer();
  await sharp(lg).png(png).toFile(path.join(DIRS.lg, `${slug}.png`));
  await sharp(sm).png(png).toFile(path.join(DIRS.sm, `${slug}.png`));
  const lgDark = await darkVersion(lg);
  if (lgDark) {
    await sharp(lgDark).png(png).toFile(path.join(DIRS.lgDark, `${slug}.png`));
    await sharp(await darkVersion(sm) ?? sm).png(png).toFile(path.join(DIRS.smDark, `${slug}.png`));
    withDark.push(slug);
  }
  report[source]++;
  generated.push(slug);
}
fs.writeFileSync(path.join(ROOT, 'src/config/tech-logos.json'), JSON.stringify({ logos: generated, dark: withDark }, null, 2) + '\n');
console.log(`✔ ${generated.length} logos in public/tech/ (${withDark.length} with a dark-mode version)`, report);
