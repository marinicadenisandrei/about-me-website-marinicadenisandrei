/** Web app manifest, generated so icon paths honour the base path. */
import type { APIRoute } from 'astro';
import { site } from '@config/site';
import { withBase } from '@lib/url';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        name: site.name,
        short_name: site.initials,
        description: site.description,
        start_url: withBase('/'),
        scope: withBase('/'),
        display: 'standalone',
        background_color: '#0F1115',
        theme_color: '#0F1115',
        icons: [
          { src: withBase('/icon-192.png'), sizes: '192x192', type: 'image/png' },
          { src: withBase('/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: withBase('/favicon.svg'), sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
