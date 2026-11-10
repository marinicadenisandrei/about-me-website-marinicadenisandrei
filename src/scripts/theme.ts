/** Manual theme override stored in localStorage (wrapped in try/catch); default follows prefers-color-scheme. */
export type Theme = 'light' | 'dark' | 'auto';
const KEY = 'theme';

export function readStoredTheme(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'auto';
  } catch {
    return 'auto';
  }
}
export function applyTheme(t: Theme): void {
  const root = document.documentElement;
  if (t === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', t);
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = currentIsLight() ? '#F4F5F7' : '#0F1115';
}
export function currentIsLight(): boolean {
  const t = document.documentElement.getAttribute('data-theme');
  if (t) return t === 'light';
  return matchMedia('(prefers-color-scheme: light)').matches;
}
export function toggleTheme(): Theme {
  const next: Theme = currentIsLight() ? 'dark' : 'light';
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* storage unavailable, theme still applies for this page */
  }
  applyTheme(next);
  return next;
}
