import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { allPosts } from '../lib/posts';
import { site } from '../site.config';
import { url } from '../lib/url';
import { plain, stripMarkdown } from '../lib/inline';

export async function GET(context: APIContext) {
  const posts = await allPosts();

  return rss({
    title: `${site.title} · ${site.author}`,
    description: site.description,
    // Always set — `site` is configured in astro.config.mjs.
    site: context.site!,
    trailingSlash: false,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      link: url(`/posts/${p.id}`),
      categories: [p.data.tag],
      description:
        plain(p.data.abstract ?? '') || stripMarkdown(p.body ?? '').slice(0, 300),
    })),
    /* No <language>: RSS 2.0 allows exactly one channel-level value, and
       this feed carries both 中文 and English posts. A single wrong tag
       is worse than none — readers that care fall back to the per-item
       content, and the rest ignore the field entirely. */
  });
}
