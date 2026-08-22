// @ts-check
import { execFileSync } from 'node:child_process';
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkSidenotes from './src/lib/remark-sidenotes.mjs';

/**
 * Shiki theme matching the design's code block:
 * warm paper background, muted comments, green keywords, blue numerals.
 */
const paper = {
  name: 'paper',
  type: /** @type {'light'} */ ('light'),
  colors: {
    'editor.background': '#f1eddf',
    'editor.foreground': '#332e26',
  },
  settings: [
    { scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#7e7a70', fontStyle: 'italic' } },
    { scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.expression'],
      settings: { foreground: '#4a6c3f' } },
    { scope: ['constant.numeric', 'constant.language', 'constant.character'],
      settings: { foreground: '#3a6ea8' } },
    { scope: ['string', 'string.quoted', 'punctuation.definition.string'],
      settings: { foreground: '#8a5a3b' } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call'],
      settings: { foreground: '#1a1814' } },
    { scope: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class'],
      settings: { foreground: '#6b4fa0' } },
    { scope: ['variable', 'variable.other', 'meta.definition.variable'],
      settings: { foreground: '#332e26' } },
    { scope: ['keyword.operator'], settings: { foreground: '#5a564c' } },
  ],
};

/**
 * When a page's source last actually changed, ISO-8601, for <lastmod>.
 *
 * Google reads lastmod to decide what to recrawl first — but only for as
 * long as it believes it. The tempting one-liner, `lastmod: new Date()`,
 * stamps every URL with the build time, so moving a margin in the CSS
 * announces that all four pages changed; do that a few times and the
 * field is discounted for good. Git already knows the answer per file, so
 * ask it rather than invent one.
 *
 * Needs real history: `actions/checkout` clones shallow by default and
 * would answer for one commit and shrug at everything else, hence
 * `fetch-depth: 0` in .github/workflows/deploy.yml. When git has nothing
 * to say — a post written but not yet committed — the URL ships with no
 * lastmod at all, which is the honest outcome and better than a guess.
 *
 * @param {string} file  Repo-relative path.
 * @returns {string | undefined}
 */
function lastCommitted(file) {
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return iso || undefined;
  } catch {
    return undefined; // no git, no history, no file — all the same answer here
  }
}

/**
 * Sitemap URL → the file that produces it. `build.format: 'directory'`
 * means every entry arrives with a trailing slash, the root included.
 *
 * @param {string} pathname
 * @returns {string | undefined}
 */
function sourceOf(pathname) {
  if (pathname === '/') return 'src/pages/index.astro';
  if (pathname === '/about/') return 'src/pages/about.astro';
  if (pathname === '/posts/') return 'src/pages/posts/index.astro';
  const post = pathname.match(/^\/posts\/(.+?)\/?$/);
  return post ? `src/content/posts/${post[1]}.md` : undefined;
}

export default defineConfig({
  // ── Deployment ────────────────────────────────────────────────
  // User site: repo eugenejyuan/eugenejyuan.github.io, served at the
  // domain root. If this ever moves to a project repo, set `base` to
  // '/<repo>' — every internal link goes through the `url()` helper in
  // src/lib/url.ts, which reads BASE_URL, so nothing else changes.
  site: 'https://eugenejyuan.github.io',

  trailingSlash: 'ignore',
  build: { format: 'directory' },

  // Astro 7 changed the default from `true` to `'jsx'`, which strips the
  // whitespace sitting between inline elements in the source. The home
  // page subline came out as "· about /github /rss" — the separators had
  // lost the space that follows them. This design leans on source
  // newlines for inter-element spacing in several places, so keep the
  // HTML whitespace rules rather than sprinkling {' '} to compensate.
  compressHTML: true,

  integrations: [
    sitemap({
      serialize(item) {
        const source = sourceOf(new URL(item.url).pathname);
        const lastmod = source && lastCommitted(source);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],

  markdown: {
    // Astro 7 swapped the default Markdown processor to the native
    // Sätteri pipeline, which knows nothing about remark/rehype. The maths
    // here is remark-math + rehype-katex, so opt back into unified() from
    // @astrojs/markdown-remark and hand the plugins to it directly —
    // passing them as `markdown.remarkPlugins` is deprecated and silently
    // does nothing under the new default.
    processor: unified({
      remarkPlugins: [remarkMath, remarkSidenotes],
      rehypePlugins: [[rehypeKatex, { output: 'html', throwOnError: false }]],
    }),
    shikiConfig: { theme: paper, wrap: false },
  },
});
