/**
 * The `.archive-meta` line above the post list.
 *
 * Rendered twice — once at build time, once by the archive's own filter
 * script as the reader narrows the list — so it lives here rather than as
 * two string literals that drift apart.
 *
 * The noun agrees with the count it sits next to, which is `total` in both
 * shapes: "1 entry", "12 entries", "1 of 12 entries".
 */
export function archiveMeta(shown: number, total: number, filtered = false): string {
  const count = filtered ? `${shown} of ${total}` : String(total);
  const noun = total === 1 ? 'entry' : 'entries';
  return `${count} ${noun} · sorted by date · 中 & EN`;
}
