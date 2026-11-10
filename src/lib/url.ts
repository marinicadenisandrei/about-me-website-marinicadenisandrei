/**
 * Every internal link and asset goes through `withBase()` so the site works
 * unchanged on `https://user.github.io/`, `https://user.github.io/repo/`
 * and on a custom domain. scripts/check-links.mjs fails the build if a page
 * contains an internal absolute URL that bypassed this.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, ''); // "" or "/repo"

/** `withBase('/projects/hria')` -> `/repo/projects/hria` (or `/projects/hria` at root). */
export function withBase(path: string): string {
  if (/^(https?:)?\/\//.test(path) || path.startsWith('mailto:') || path.startsWith('tel:') || path.startsWith('#')) {
    return path;
  }
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${clean}` || '/';
}

const ORIGIN = (site: URL | string | undefined) => (site ? String(site) : 'http://localhost:4321').replace(/\/+$/, '');

/** Absolute URL for a SITE-RELATIVE path (base is added), e.g. OG images: absoluteUrl('/og.png', Astro.site). */
export function absoluteUrl(path: string, site: URL | string | undefined): string {
  return `${ORIGIN(site)}${withBase(path)}`;
}

/** Canonical URL of the current page. `Astro.url.pathname` ALREADY contains the base, so it is not added again. */
export function canonicalUrl(astroUrl: URL, site: URL | string | undefined): string {
  const p = astroUrl.pathname.replace(/\/+$/, '');
  return `${ORIGIN(site)}${p}/`.replace(/\/\/$/, '/');
}

/** True when `current` is `href` or lives under it (for nav active states). */
export function isActivePath(current: string, href: string): boolean {
  const a = withBase(href).replace(/\/+$/, '') || '/';
  const b = current.replace(/\/+$/, '') || '/';
  return a === '/' ? b === '/' : b === a || b.startsWith(a + '/');
}
