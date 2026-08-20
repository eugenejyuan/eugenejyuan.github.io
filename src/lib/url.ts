/**
 * Base-aware URL builder.
 *
 * `astro.config.mjs` leaves `base` at its default '/', since the site is
 * served from the root of eugenejyuan.github.io. Astro does not rewrite
 * `href`s for you, so every internal link still goes through here — that
 * way moving the site under a sub-path stays a one-line config change.
 */
const BASE = import.meta.env.BASE_URL; // '/' — or '/<repo>/' under a sub-path

export function url(path = '/'): string {
  const root = BASE.replace(/\/+$/, '');
  const rest = String(path).replace(/^\/+/, '');
  return `${root}/${rest}`.replace(/\/{2,}/g, '/');
}
