/**
 * Vendor every webfont the site uses out of node_modules into `public/fonts/`.
 *
 * Why self-host at all? The site used to pull its Latin faces from Google
 * Fonts and its CJK face from jsDelivr. Google Fonts is unreachable from
 * mainland China — and unreachable is worse than slow, because a
 * render-blocking <link> to a dead host holds up first paint until the
 * connection times out, so the readers of the 中文 posts got a blank page
 * before they got a fallback font. Self-hosting removes the third-party
 * request entirely: no cross-origin DNS, TLS or timeout, no IP address
 * handed to a third party, and nothing left to break in one region.
 *
 * There is no longer a cache argument for the CDN either. Browsers
 * partitioned the HTTP cache per top-level origin years ago, so a visitor
 * never arrives with a "shared" copy of a Google font already warmed.
 *
 * Why not commit the files? The CJK face alone is 194 subset chunks,
 * ~8 MB. Git keeps every version of a binary forever, so each font bump
 * would add another 8 MB to every clone, permanently. Pinning the npm
 * packages and copying at build time produces an identical `dist/` for
 * none of that cost.
 *
 * Every stylesheet written here refers to its woff2 files as `./files/…`,
 * i.e. relative to the stylesheet, so the tree keeps working under any
 * `base` path without a single URL being rewritten.
 *
 * Run by the `predev` / `prebuild` / `precheck` hooks in package.json.
 */
import { createRequire } from 'node:module';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

/**
 * 霞鹜文楷 Lite. Copied wholesale: the package splits each weight into 97
 * unicode-range chunks, which is exactly what we want — a page pulls only
 * the handful of chunks its glyphs fall in — and far too many to curate
 * by hand. Only the cuts Base.astro declares: a real 400 and a real 700.
 */
const CJK = {
  pkg: 'lxgw-wenkai-lite-webfont',
  sheets: ['lxgwwenkailite-regular.css', 'lxgwwenkailite-bold.css'],
  licence: 'OFL.txt',
  licenceAs: 'OFL-lxgw-wenkai-lite.txt',
};

/**
 * The Latin faces, rebuilt into one small stylesheet rather than copied.
 * Fontsource ships every subset it has (cyrillic, greek, vietnamese …) and
 * names its variable families `<Name> Variable`; we want two subsets and
 * the family names main.css already asks for, so each @font-face block is
 * filtered and renamed on the way through.
 *
 * `opsz` rather than `wght` for the serif: the design's original Google
 * request asked for `opsz@8..60`, and browsers apply `font-optical-sizing:
 * auto` by default, so the face is optically corrected across the 10.5px
 * captions and the 48px numerals. The italic is not optional — main.css
 * sets `font-synthesis-style: none`, so a missing italic renders upright
 * instead of sheared.
 */
const LATIN = [
  {
    pkg: '@fontsource-variable/source-serif-4',
    sheets: ['opsz.css', 'opsz-italic.css'],
    /** Fontsource's family name → the one main.css already uses. */
    rename: ['Source Serif 4 Variable', 'Source Serif 4'],
    licence: 'LICENSE',
    licenceAs: 'OFL-source-serif-4.txt',
  },
  {
    pkg: '@fontsource/ibm-plex-mono',
    /* Weights 400 and 500, upright only — main.css never sets italic on a
       mono element (`.search-empty` is italic but inherits the serif). */
    sheets: ['400.css', '500.css'],
    licence: 'LICENSE',
    licenceAs: 'OFL-ibm-plex-mono.txt',
  },
];

/** The only subsets this site can render: Latin plus its accented range. */
const SUBSETS = ['latin', 'latin-ext'];

/* Longest-first, so `latin-ext` is recognised before `latin` matches it. */
const ALL_SUBSETS = [
  'cyrillic-ext', 'cyrillic', 'greek-ext', 'greek',
  'latin-ext', 'latin', 'vietnamese',
];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dest = path.join(root, 'public', 'fonts');
const filesDir = path.join(dest, 'files');

function resolvePkg(name) {
  try {
    return path.dirname(require.resolve(`${name}/package.json`));
  } catch {
    console.error(`\n[fonts] ${name} is not installed. Run \`npm ci\` first.\n`);
    process.exit(1);
  }
}

function versionOf(dir) {
  return JSON.parse(require('node:fs').readFileSync(path.join(dir, 'package.json'), 'utf8')).version;
}

/* One stamp covering every package, so bumping any of them forces a
   re-copy, and wiping public/fonts/ takes the stamp with it — the two can
   never disagree about what is on disk. */
const sources = [CJK, ...LATIN].map((f) => ({ ...f, dir: resolvePkg(f.pkg) }));
const stampValue = sources.map((s) => `${s.pkg}@${versionOf(s.dir)}`).join(' ');
const stampFile = path.join(dest, '.version');

if ((await readFile(stampFile, 'utf8').catch(() => null)) === stampValue) {
  console.log('[fonts] public/fonts/ is already up to date');
  process.exit(0);
}

await rm(dest, { recursive: true, force: true });
await mkdir(filesDir, { recursive: true });

/** Every woff2 filename the emitted CSS ends up pointing at. */
const wanted = new Set();

/* ── CJK: stylesheets copied verbatim ─────────────────────────────── */
const cjk = sources[0];
for (const sheet of cjk.sheets) {
  const css = await readFile(path.join(cjk.dir, sheet), 'utf8');
  for (const m of css.matchAll(/url\(['"]?\.\/files\/([^'")]+)['"]?\)/g)) wanted.add(m[1]);
  await cp(path.join(cjk.dir, sheet), path.join(dest, sheet));
}

/* ── Latin: filtered, renamed, concatenated into one stylesheet ───── */
const subsetOf = (id) => ALL_SUBSETS.find((s) => id.includes(`-${s}-`));
const blocks = [];

for (const font of sources.slice(1)) {
  for (const sheet of font.sheets) {
    const css = await readFile(path.join(font.dir, sheet), 'utf8');
    /* Fontsource labels each @font-face with the id of the file it loads,
       e.g. `/* source-serif-4-latin-ext-opsz-normal *\/`. */
    for (const [, id, block] of css.matchAll(
      /\/\*\s*([a-z0-9-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g,
    )) {
      if (!SUBSETS.includes(subsetOf(id) ?? '')) continue;

      let out = block;
      if (font.rename) out = out.split(font.rename[0]).join(font.rename[1]);

      /* Drop the legacy .woff fallback: woff2 has been universal since
         2017, and keeping it would double what we copy for nothing. */
      out = out.replace(
        /src:[^;]+;/,
        (src) => src.replace(/,\s*url\([^)]*\.woff\)\s*format\(['"]woff['"]\)/g, ''),
      );

      for (const m of out.matchAll(/url\(['"]?\.\/files\/([^'")]+)['"]?\)/g)) wanted.add(m[1]);
      blocks.push(`/* ${id} */\n${out}`);
    }
  }
}

if (!blocks.length) {
  console.error('\n[fonts] matched no Latin @font-face blocks — the upstream ' +
    'CSS format has changed. Refusing to ship a site with no Latin font.\n');
  process.exit(1);
}

await writeFile(
  path.join(dest, 'latin.css'),
  '/* Generated by scripts/sync-fonts.mjs — do not edit. */\n' +
    `/* ${SUBSETS.join(' + ')} subsets of: ${LATIN.map((f) => f.pkg).join(', ')} */\n\n` +
    blocks.join('\n\n') + '\n',
);

/* ── Copy every referenced woff2, and the licences ────────────────── */
for (const font of sources) {
  const available = new Set(await readdir(path.join(font.dir, 'files')));
  const mine = [...wanted].filter((f) => available.has(f));
  await Promise.all(
    mine.map((f) => cp(path.join(font.dir, 'files', f), path.join(filesDir, f))),
  );
  /* SIL OFL 1.1 §2: the licence travels with any redistribution of the
     font, and `dist/` is a redistribution. */
  await cp(path.join(font.dir, font.licence), path.join(dest, font.licenceAs));
}

const copied = new Set(await readdir(filesDir));
const missing = [...wanted].filter((f) => !copied.has(f));
if (missing.length) {
  console.error(`\n[fonts] ${missing.length} referenced file(s) were not found, ` +
    `starting with ${missing[0]}. Refusing to ship a half-copied font.\n`);
  process.exit(1);
}

await writeFile(stampFile, stampValue);
console.log(`[fonts] vendored ${copied.size} woff2 files — ` +
  `${cjk.sheets.length} CJK stylesheets + latin.css (${blocks.length} faces)`);
