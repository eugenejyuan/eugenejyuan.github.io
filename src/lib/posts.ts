import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/**
 * Every publishable post, newest first. Drafts are dropped in production
 * builds but kept while running `astro dev`, so you can preview them.
 */
export async function allPosts(): Promise<Post[]> {
  const posts = await getCollection(
    'posts',
    ({ data }) => import.meta.env.DEV || !data.draft,
  );
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Distinct tags across all posts, alphabetical. */
export function tagsOf(posts: Post[]): string[] {
  return [...new Set(posts.map((p) => p.data.tag).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
}

/**
 * Stable entry number, as in the design: newest is [n], oldest is [1].
 * Stays fixed when the archive is filtered.
 */
export const entryNumber = (index: number, total: number) => total - index;
