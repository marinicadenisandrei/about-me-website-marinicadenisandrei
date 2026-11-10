// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeBaseLinks from './scripts/rehype-base-links.mjs';

/**
 * Deployment target, GitHub Pages.
 *
 * Both values come from env vars so the same config works locally, on a
 * `<user>.github.io` root repo, on a `<user>.github.io/<repo>` sub-path and
 * on a custom domain. The GitHub Actions workflow derives them automatically
 * from the repository name (see .github/workflows/deploy.yml).
 *
 *   SITE_URL: absolute origin, e.g. https://denis.github.io or https://denismarinica.dev
 *   BASE_PATH: "/" for a root deployment, "/<repo>" for a project page
 *
 * Every internal link/asset in the codebase goes through `import.meta.env.BASE_URL`
 * (see src/lib/url.ts) and scripts/check-links.mjs fails the build otherwise.
 */
const SITE_URL = process.env.SITE_URL ?? 'https://TODO-github-username.github.io'; // TODO: set SITE_URL / custom domain
const BASE_PATH = normalizeBase(process.env.BASE_PATH ?? '/');

/** @param {string} b */
function normalizeBase(b) {
  if (!b || b === '/') return '/';
  return '/' + b.replace(/^\/+|\/+$/g, '');
}

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'ignore',
  output: 'static',
  build: {
    format: 'directory',
    inlineStylesheets: 'always', // no render-blocking CSS requests: keeps mobile LCP under budget
  },
  markdown: {
    // Keep straight quotes and plain dashes (no automatic curly quotes or en/em dashes).
    smartypants: false,
    // Content authors write "/projects/x"; this prefixes the base path on sub-path deployments.
    rehypePlugins: [[rehypeBaseLinks, { base: BASE_PATH }]],
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/styleguide'),
    }),
  ],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  image: {
    // All images are local and optimised through astro:assets at build time.
    responsiveStyles: true,
  },
  devToolbar: { enabled: true },
});
