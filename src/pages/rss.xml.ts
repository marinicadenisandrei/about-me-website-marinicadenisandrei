/** RSS feed for the optional blog (posts collection). Empty until posts exist / features.blog is on. */
import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '@config/site';
import { withBase } from '@lib/url';

export const GET: APIRoute = async (context) => {
  const posts = site.features.blog ? (await getCollection('posts')).filter((p) => !p.data.draft) : [];
  return rss({
    title: `${site.shortName} | Notes`,
    description: site.description,
    site: context.site ?? 'http://localhost:4321',
    items: posts
      .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
      .map((p) => ({ title: p.data.title, description: p.data.description, pubDate: p.data.pubDate, link: withBase(`/posts/${p.id}`) })),
  });
};
