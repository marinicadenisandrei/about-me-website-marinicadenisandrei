#!/usr/bin/env node
/**
 * Udemy CSV → content collection importer.
 *
 *   npm run import:udemy                 # reads data/udemy_courses.csv
 *   node scripts/import-udemy.ts path/to/other.csv
 *
 * Reads the Udemy export (Romanian headers) and writes one JSON file per course to
 * src/content/courses/udemy/<slug>.json. The folder is wiped and regenerated on every
 * run, so never edit those files by hand — edit the CSV or the rules in
 * src/config/course-categories.ts instead. Hand-written courses go to
 * src/content/courses/*.json and are left untouched.
 *
 * Runs on plain Node ≥ 22.18 (type stripping) — no build step, no extra dependency.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORY_RULES, COURSE_STACK_RULES, type CourseCategory } from '../src/config/course-categories.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const INPUT = resolve(process.argv[2] ?? join(ROOT, 'data', 'udemy_courses.csv'));
const OUT_DIR = join(ROOT, 'src', 'content', 'courses', 'udemy');

/* ───────────── CSV column mapping (Romanian → English) ───────────── */
const COLUMNS = {
  titlu: 'title',
  link: 'url',
  instructori: 'instructors',
  progres: 'progress',
  terminat: 'completed',
  lectii: 'lectures',
  durata: 'duration',
  inscris: 'enrolledDate',
  arhivat: 'archived',
  certificat_id: 'certificateId',
  certificat_data: 'certificateDate',
  certificat: 'certificateUrl',
  certificat_pdf: 'certificatePdf',
} as const;

type RawRow = Record<string, string>;

interface Course {
  title: string;
  url: string;
  provider: 'udemy';
  instructors: string[];
  progress: number;
  completed: boolean;
  lectures: number;
  hours: number;
  enrolledDate: string | null;
  archived: boolean;
  certificate: { id: string; date: string | null; url?: string; pdf?: string } | null;
  category: CourseCategory;
  role: 'student';
  stack: string[];
  generated: true;
}

/* ───────────── tiny RFC 4180 CSV parser (handles quotes, commas, newlines) ───────────── */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ''));
}

/* ───────────── field parsers ───────────── */
const parseBool = (v: string): boolean => /^(true|1|yes|da)$/i.test(v.trim());
const parsePercent = (v: string): number => {
  const n = parseFloat(v.replace('%', '').trim());
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
};
/** "45.5 total hours" → 45.5, "1 total hour" → 1, "30 total mins" → 0.5, "" → 0 */
const parseHours = (v: string): number => {
  const m = v.trim().match(/([\d.,]+)\s*(?:total\s+)?(hour|hr|min)/i);
  if (!m) return 0;
  const n = parseFloat(m[1]!.replace(',', '.'));
  if (!Number.isFinite(n)) return 0;
  return m[2]!.toLowerCase().startsWith('min') ? Math.round((n / 60) * 100) / 100 : n;
};
const parseInt0 = (v: string): number => {
  const n = parseInt(v.trim(), 10);
  return Number.isFinite(n) ? n : 0;
};
const parseDate = (v: string): string | null => {
  const t = v.trim();
  if (!t) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : (new Date(t).toISOString().slice(0, 10) ?? null);
};
const parseInstructors = (v: string): string[] =>
  Array.from(
    new Set(
      v
        .split(',')
        .map((s) => s.replace(/\s*[•|].*$/, '').trim()) // drop "• 3 Million+ Enrollments…" suffixes
        .filter(Boolean),
    ),
  );

/** `https://www.udemy.com/course/modern-php/` → `modern-php`; `/course/draft/2758666/` → `draft-2758666` */
function slugFromUrl(url: string, title: string): string {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    const i = parts.indexOf('course');
    const tail = i >= 0 ? parts.slice(i + 1) : parts;
    if (tail.length) return tail.join('-').toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  } catch {
    /* fall through */
  }
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function categorize(title: string, slug: string): CourseCategory {
  const hay = ` ${title.toLowerCase()} ${slug.replace(/-/g, ' ')} `;
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((k) => hay.includes(k.toLowerCase()))) return rule.category;
  }
  return 'Other';
}

function inferStack(title: string, slug: string): string[] {
  const hay = ` ${title.toLowerCase()} ${slug.replace(/-/g, ' ')} `;
  return COURSE_STACK_RULES.filter((r) => r.keywords.some((k) => hay.includes(k.toLowerCase()))).map((r) => r.slug);
}

/* ───────────── main ───────────── */
function main(): void {
  if (!existsSync(INPUT)) {
    console.error(`✖ CSV not found: ${INPUT}`);
    process.exit(1);
  }
  const rows = parseCsv(readFileSync(INPUT, 'utf8'));
  const header = rows.shift();
  if (!header) {
    console.error('✖ Empty CSV');
    process.exit(1);
  }
  const idx = new Map(header.map((h, i) => [h.trim().toLowerCase(), i] as const));
  const missing = Object.keys(COLUMNS).filter((c) => !idx.has(c));
  if (missing.length) {
    console.error(`✖ Missing CSV columns: ${missing.join(', ')}`);
    process.exit(1);
  }
  const get = (r: string[], col: keyof typeof COLUMNS): string => r[idx.get(col)!] ?? '';

  // Wipe + recreate the generated folder.
  if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const seen = new Map<string, number>();
  const stats = { total: 0, completed: 0, certificates: 0, archived: 0, hours: 0, byCategory: {} as Record<string, number> };

  for (const r of rows) {
    const raw: RawRow = Object.fromEntries((Object.keys(COLUMNS) as (keyof typeof COLUMNS)[]).map((c) => [c, get(r, c)]));
    const title = raw.titlu!.trim();
    if (!title) continue;
    const url = raw.link!.trim();
    let slug = slugFromUrl(url, title);
    const n = (seen.get(slug) ?? 0) + 1;
    seen.set(slug, n);
    if (n > 1) slug = `${slug}-${n}`;

    const certId = raw.certificat_id!.trim();
    const category = categorize(title, slug);
    const course: Course = {
      title,
      url,
      provider: 'udemy',
      instructors: parseInstructors(raw.instructori!),
      progress: parsePercent(raw.progres!),
      completed: parseBool(raw.terminat!),
      lectures: parseInt0(raw.lectii!),
      hours: parseHours(raw.durata!),
      enrolledDate: parseDate(raw.inscris!),
      archived: parseBool(raw.arhivat!),
      certificate: certId
        ? {
            id: certId,
            date: parseDate(raw.certificat_data!),
            ...(raw.certificat!.trim() ? { url: raw.certificat!.trim() } : {}),
            ...(raw.certificat_pdf!.trim() ? { pdf: raw.certificat_pdf!.trim() } : {}),
          }
        : null,
      category,
      role: 'student',
      stack: inferStack(title, slug),
      generated: true,
    };

    writeFileSync(join(OUT_DIR, `${slug}.json`), JSON.stringify(course, null, 2) + '\n');

    stats.total++;
    if (course.completed) stats.completed++;
    if (course.certificate) stats.certificates++;
    if (course.archived) stats.archived++;
    stats.hours += course.hours;
    stats.byCategory[category] = (stats.byCategory[category] ?? 0) + 1;
  }

  const written = readdirSync(OUT_DIR).length;
  console.log(`✔ Imported ${written} courses → ${OUT_DIR.replace(ROOT + '/', '')}`);
  console.log(
    `  completed: ${stats.completed} · certificates: ${stats.certificates} · archived: ${stats.archived} · total hours: ${stats.hours.toFixed(1)}`,
  );
  console.log('  by category:');
  for (const [c, k] of Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])) console.log(`    ${String(k).padStart(3)}  ${c}`);
}

main();
