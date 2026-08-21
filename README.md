# Working Notes

Personal site of [Jing Yuan](https://eugenejyuan.github.io) — a bilingual
(中 / EN) research notebook. Built with [Astro](https://astro.build), deployed
to GitHub Pages by GitHub Actions on every push to `main`.

## Development

```bash
npm ci          # install; `npm install` is fine for day-to-day work
npm run dev     # http://localhost:4321 — drafts are visible here
npm run check   # astro check, the same gate CI runs
npm run build   # static output into dist/
npm run preview # serve dist/ as it will be served in production
```

`predev` / `prebuild` / `precheck` run `scripts/sync-fonts.mjs`, which vendors
every webfont out of `node_modules` into `public/fonts/`: Source Serif 4,
IBM Plex Mono and 霞鹜文楷 Lite. That directory is generated and git-ignored —
see the script's header for why the fonts are self-hosted rather than pulled
from a CDN. The built site makes no third-party requests at all.

## Layout

```
src/site.config.ts    profile links and site-wide copy — start here
src/content.config.ts frontmatter schema for posts
src/content/posts/    published posts (.md)
src/data/             publications, news, "currently" list
src/layouts/          Base (<head>, shell), Page, PostLayout
src/components/       search dialog, contents rail, margin-note layout
src/lib/              formatting helpers, and the margin-note plugin
src/styles/main.css   the whole design system, one file
drafts/               local-only, git-ignored
```

Writing a post means dropping a `.md` file into `src/content/posts/` with the
frontmatter that `src/content.config.ts` documents. Set `draft: true` to keep
it out of the build, the feed, the sitemap and search while still previewing
it under `npm run dev`.

## The margins

The reading column is 760px and stays 760px — that is the measure the type
was set for. But a desktop window is not 760px, so on screens wider than
1240px a post page puts the space either side to work: the table of contents
on the left, the post's own notes on the right.

The contents rail builds itself from the `##` and `###` headings, sticks
beside the article as you scroll, and marks the section you are in. A post
with only one section heading doesn't get one.

Notes are written inline, with `^[…]`, at the point they belong to:

```markdown
The measurement is noisy^[σ ≈ 0.4 on the held-out split], so the
ranking is not stable.
```

They come out in the right margin, aligned with the line that produced them,
and numbered in order. Ordinary inline Markdown works inside the brackets —
emphasis, `code`, links, `$maths$`. A note that wants block content can be
written as raw HTML between two paragraphs instead, and gets the same
treatment minus the number:

```html
<aside class="note">Anything that will not fit on one line.</aside>
```

Narrower than 1240px, neither rail has anywhere to live: the contents fold
into a `CONTENTS` disclosure above the article and each note folds behind its
reference number, opening in place when tapped. Both of those are checkboxes,
not scripts, so they work with JavaScript off — the only script involved is
the pass that stops two notes written a line apart from landing on top of
each other. See the header of `src/lib/remark-sidenotes.mjs` for the syntax's
one limitation, and the rails section of `src/styles/main.css` for the
layout.

## Licence

Two licences, because this repository holds two different things:

- **Code** — components, layouts, styles, configuration, build scripts —
  under the [MIT Licence](LICENSE). Take it, adapt it, build your own site
  with it.
- **Writing** — the posts, page copy and figures under `src/content/`,
  `src/pages/` and `src/data/` — under
  [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
  See [LICENSE-CONTENT](LICENSE-CONTENT).

Every page carries the split in its footer, so a reader meets the terms
without having to come here.

Source Serif 4, IBM Plex Mono and 霞鹜文楷 Lite are redistributed in the built
site under the [SIL Open Font License 1.1](https://openfontlicense.org/); each
licence ships beside the fonts it covers, under `/fonts/`.
