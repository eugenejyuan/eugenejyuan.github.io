import type { APIRoute } from 'astro';
import { allPosts } from '../lib/posts';
import { url } from '../lib/url';
import { plain, stripMarkdown, langBadge, isoDate } from '../lib/inline';

/** Client-side search index, fetched lazily by the ⌘K dialog. */
export const GET: APIRoute = async () => {
  const posts = await allPosts();

  const docs = posts.map((p) => ({
    title: p.data.title,
    url: url(`/posts/${p.id}`),
    date: isoDate(p.data.date),
    tag: p.data.tag,
    lang: langBadge(p.data.lang),
    body: `${plain(p.data.abstract ?? '')} ${stripMarkdown(p.body ?? '')}`
      .trim()
      .slice(0, 1200),
  }));

  return new Response(JSON.stringify(docs), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
