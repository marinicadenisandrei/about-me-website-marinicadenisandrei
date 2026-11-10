/** LeetCode stats: parse the sheet CSV; at build time fall back to the committed snapshot if the sheet can't be reached. */
import { leetcodeCsvUrl } from '@config/leetcode';
import snapshot from '../data/leetcode-snapshot.json';

export interface LcLang { name: string; easy: number; medium: number; hard: number; total: number }
export interface LcStats { languages: LcLang[]; easy: number; medium: number; hard: number; total: number; live: boolean; fetchedAt: string }

/** Minimal CSV parser for the gviz output (quoted fields, no embedded newlines). */
export function parseCsv(text: string): string[][] {
  return text.trim().split(/\r?\n/).map((line) => {
    const out: string[] = []; let cur = ''; let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (q) { if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
      else if (ch === '"') q = true; else if (ch === ',') { out.push(cur); cur = ''; } else cur += ch;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  });
}

/** rows: a header row with language names, then rows starting with Hard / Medium / Easy. */
export function statsFromRows(rows: string[][]): Omit<LcStats, 'live' | 'fetchedAt'> | null {
  const find = (k: string) => rows.find((r) => r[0]?.toLowerCase().startsWith(k));
  const hard = find('hard'), medium = find('medium'), easy = find('easy');
  const header = rows.find((r) => r.slice(1).some((c) => /[a-z]/i.test(c)) && !/^(hard|medium|easy)/i.test(r[0] ?? ''));
  if (!hard || !medium || !easy || !header) return null;
  const n = (v?: string) => { const x = parseInt((v ?? '').replace(/[^\d]/g, ''), 10); return Number.isFinite(x) ? x : 0; };
  const languages: LcLang[] = [];
  header.forEach((name, i) => {
    if (i === 0 || !name) return;
    const l = { name, hard: n(hard[i]), medium: n(medium[i]), easy: n(easy[i]) };
    languages.push({ ...l, total: l.hard + l.medium + l.easy });
  });
  return summarise(languages);
}

export function summarise(langs: Omit<LcLang, 'total'>[]) {
  const languages = langs.map((l) => ({ ...l, total: l.easy + l.medium + l.hard })).filter((l) => l.total > 0).sort((a, b) => b.total - a.total);
  const sum = (k: 'easy' | 'medium' | 'hard') => languages.reduce((s, l) => s + l[k], 0);
  const easy = sum('easy'), medium = sum('medium'), hard = sum('hard');
  return { languages, easy, medium, hard, total: easy + medium + hard };
}

export async function getLeetcodeStats(): Promise<LcStats> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(leetcodeCsvUrl(), { signal: ctrl.signal });
    clearTimeout(t);
    if (res.ok) {
      const s = statsFromRows(parseCsv(await res.text()));
      if (s && s.total > 0) return { ...s, live: true, fetchedAt: new Date().toISOString().slice(0, 10) };
    }
  } catch { /* offline build: use the snapshot */ }
  return { ...summarise(snapshot.languages), live: false, fetchedAt: snapshot.fetchedAt };
}
