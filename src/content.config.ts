import { defineCollection } from 'astro:content';
/* Astro 6 moved to Zod 4 and deprecated re-exporting `z` from
   astro:content. `astro/zod` is the same instance Astro validates with,
   so schemas can never drift from a separately-installed zod. */
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    /** Post title. Shown centred on the post page and in every listing. */
    title: z.string(),
    /** Publication date — drives ordering, the breadcrumb, and the feed. */
    date: z.coerce.date(),
    /** Drives the [EN] / [中] badge, the CJK weight, and <html lang>. */
    lang: z.enum(['en', 'zh']).default('en'),
    /** Single word; becomes a filter on /posts. */
    tag: z.string(),
    /** e.g. "12 min". Set by hand — word counting is unreliable for CJK. */
    read: z.string().optional(),
    /** Optional "revised YYYY-MM-DD" note under the title. */
    revised: z.coerce.date().optional(),
    /** Loads KaTeX styling for this post. Body math works either way. */
    math: z.boolean().default(false),
    /** Italic ABSTRACT block. Supports *em*, `code`, and $math$. */
    abstract: z.string().optional(),
    /** Numbered reference list rendered after the body. */
    refs: z.array(z.string()).default([]),
    /** Hidden from listings, feed, sitemap and search. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
