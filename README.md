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
src/styles/main.css   the whole design system, one file
drafts/               local-only, git-ignored
```

Writing a post means dropping a `.md` file into `src/content/posts/` with the
frontmatter that `src/content.config.ts` documents. Set `draft: true` to keep
it out of the build, the feed, the sitemap and search while still previewing
it under `npm run dev`.

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
