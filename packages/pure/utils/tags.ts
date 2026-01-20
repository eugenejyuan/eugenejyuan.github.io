export type TagInfo = {
  /** Canonical form used in URLs and matching */
  slug: string
  /** Original label used for display */
  label: string
}

export function tagToSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Deduplicate tags by slug, keeping first-seen label. */
export function dedupeTagsBySlug(tags: string[]): TagInfo[] {
  const map = new Map<string, string>()
  for (const raw of tags) {
    const label = raw.trim()
    if (!label) continue
    const slug = tagToSlug(label)
    if (!slug) continue
    if (!map.has(slug)) map.set(slug, label)
  }
  return [...map.entries()].map(([slug, label]) => ({ slug, label }))
}

