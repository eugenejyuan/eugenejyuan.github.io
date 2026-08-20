/**
 * Home page → "News". Newest first.
 * `text` accepts inline HTML; keep any links absolute (external), since this
 * string bypasses the base-aware `url()` helper.
 */
export type NewsItem = { date: string; text: string };

export const news: NewsItem[] = [
  {
    date: '2026-08-20',
    text:
      'Redesigned this site — rebuilt in Astro, warm paper and serif type.',
  },
  {
    date: '2026-01-20',
    text: 'New post — <em>Vibe coding notes</em>: what model-assisted coding actually bought me.',
  },
  {
    date: '2025-12-29',
    text:
      'Extended <a href="https://doi.org/10.64898/2025.12.29.696802">CryoFM preprint</a> on bioRxiv — a generative foundation model for cryo-EM densities.',
  },
];
