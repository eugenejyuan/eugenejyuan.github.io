// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

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

  integrations: [sitemap()],

  markdown: {
    // Astro 7 swapped the default Markdown processor to the native
    // Sätteri pipeline, which knows nothing about remark/rehype. The maths
    // here is remark-math + rehype-katex, so opt back into unified() from
    // @astrojs/markdown-remark and hand the plugins to it directly —
    // passing them as `markdown.remarkPlugins` is deprecated and silently
    // does nothing under the new default.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, { output: 'html', throwOnError: false }]],
    }),
    shikiConfig: { theme: paper, wrap: false },
  },
});
