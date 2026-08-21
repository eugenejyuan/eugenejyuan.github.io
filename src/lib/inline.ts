import katex from 'katex';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Renders the small slice of Markdown used inside front-matter strings
 * (abstracts, reference entries): `$math$`, `**strong**`, `*em*`, `` `code` ``.
 *
 * Math is pulled out before escaping so TeX backslashes and braces survive,
 * then re-inserted as KaTeX HTML.
 */
export function inline(src = ''): string {
  const math: string[] = [];

  let out = src.replace(/\$([^$]+)\$/g, (_m, tex: string) => {
    math.push(katex.renderToString(tex, { throwOnError: false, output: 'html' }));
    return `@@M${math.length - 1}@@`;
  });

  out = escapeHtml(out)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/@@M(\d+)@@/g, (_m, i: string) => math[Number(i)] ?? '');

  return out;
}

/** Plain-text version — used for meta descriptions and the search index. */
export function plain(src = ''): string {
  return src
    .replace(/\$[^$]+\$/g, '')
    .replace(/[*`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** [EN] / [中] badge text. */
export const langBadge = (lang: string) => (lang === 'zh' ? '中' : 'EN');

/** YYYY-MM-DD, always in the site's own timezone rather than the builder's. */
export const isoDate = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);

/** YYYY.MM.DD, for the post breadcrumb. */
export const dottedDate = (d: Date) => isoDate(d).replace(/-/g, '.');

/**
 * Crude Markdown → text, for the search index and feed summaries.
 * Good enough for matching; never rendered as HTML.
 */
export function stripMarkdown(src = ''): string {
  return src
    .replace(/<!--[\s\S]*?-->/g, '')        // HTML comments (draft notes)
    .replace(/```[\s\S]*?```/g, ' ')        // fenced code
    .replace(/`([^`]+)`/g, '$1')            // inline code
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')      // display math
    .replace(/\$[^$\n]+\$/g, ' ')           // inline math
    /* `[^\][]*`, not `[^\]]*`: the text class excludes the opening
       bracket too. A link nested inside a margin note gives a `[` before
       the `]`, and a class that allows it lets the match start at the
       note's own bracket and run straight through the link. */
    .replace(/!\[[^\][]*\]\([^)]*\)/g, ' ')  // images
    .replace(/\[([^\][]*)\]\([^)]*\)/g, '$1') // links → text
    /* Margin notes (`^[…]`, src/lib/remark-sidenotes.mjs): the brackets
       go, the text stays. A note is still the author's prose, and a
       reader searching for a phrase should find it wherever it was
       written. After the link rule, not before — a link inside a note
       still has its own `]`, and matching first would stop there and
       leave the rest of the note dangling. Newline excluded for the
       same reason: an unclosed `^[` must not swallow the paragraphs
       under it. The spaces matter: without them the note's first word
       fuses to the word it was hung on, and a phrase search across that
       seam finds nothing. */
    .replace(/\^\[([^\]\n]*)\]/g, ' $1 ')
    .replace(/^#{1,6}\s+/gm, '')            // heading markers
    .replace(/^\s{0,3}>\s?/gm, '')          // blockquotes
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, ' ')               // stray HTML
    .replace(/\s+/g, ' ')
    .trim();
}
