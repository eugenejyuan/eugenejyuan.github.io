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
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')  // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → text
    .replace(/^#{1,6}\s+/gm, '')            // heading markers
    .replace(/^\s{0,3}>\s?/gm, '')          // blockquotes
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, ' ')               // stray HTML
    .replace(/\s+/g, ' ')
    .trim();
}
