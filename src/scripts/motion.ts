/** Motion/material preferences: glass opacity mode (persisted) and Chromium lensing detection. */
export type GlassMode = 'clear' | 'tinted' | 'opaque';
const KEY = 'glass';
export const GLASS_MODES: GlassMode[] = ['clear', 'tinted', 'opaque'];

export function readGlass(): GlassMode {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'clear' || v === 'opaque' ? v : 'tinted';
  } catch {
    return 'tinted';
  }
}
export function applyGlass(mode: GlassMode): void {
  const root = document.documentElement;
  if (mode === 'tinted') root.removeAttribute('data-glass');
  else root.setAttribute('data-glass', mode);
}
export function setGlass(mode: GlassMode): void {
  try {
    if (mode === 'tinted') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, mode);
  } catch {
    /* storage unavailable */
  }
  applyGlass(mode);
  document.dispatchEvent(new CustomEvent('glass:change', { detail: { mode } }));
}

/** Lensing uses `backdrop-filter: url(#svg)`, which only Chromium renders. Gate on brand + support. */
export function detectLens(): void {
  type UAData = { brands?: { brand: string }[] };
  const ua = (navigator as Navigator & { userAgentData?: UAData }).userAgentData;
  const chromium = !!ua?.brands?.some((b) => /Chromium/i.test(b.brand));
  const supported = typeof CSS !== 'undefined' && CSS.supports('backdrop-filter', "url('#glass-lens')");
  const reduce = matchMedia('(prefers-reduced-transparency: reduce)').matches;
  document.documentElement.classList.toggle('has-lens', chromium && supported && !reduce);
}
