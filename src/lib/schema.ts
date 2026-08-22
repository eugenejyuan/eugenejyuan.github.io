/**
 * JSON-LD nodes for the <head>.
 *
 * The problem these solve is not ranking, it is identity. "Jing Yuan" is
 * one of the most contested names in search — a Honkai: Star Rail general,
 * a novelist, several unrelated academics — so a page that merely contains
 * the string competes with all of them and wins against none. `sameAs` is
 * the way out: it states that the person behind this site is the same one
 * behind that Scholar profile and that GitHub account, and lets a search
 * engine resolve the name to an entity instead of guessing.
 *
 * Every builder takes `Astro.site` and `Astro.url` and derives absolute
 * URLs itself, so a node is identical no matter which page emits it.
 * Base.astro wraps whatever it is given in a single `@graph`.
 */
import { site } from '../site.config';
import { plain } from './inline';
import { url } from './url';
import type { Post } from './posts';

/** Absolute URL for a site-relative path, base included. Mirrors Base.astro. */
const abs = (siteUrl: URL | undefined, path: string) => new URL(url(path), siteUrl).href;

/** The canonical URL of the page being rendered — the same one Base emits. */
const canonicalOf = (siteUrl: URL | undefined, pageUrl: URL) =>
  new URL(pageUrl.pathname, siteUrl).href;

/*
 * `@id`s are names, not addresses: nothing is served from `/#person`.
 * Their job is to be byte-identical across pages, so that the Person
 * defined on About and the `author` referenced from a post resolve to one
 * entity rather than to two people who happen to share a name — which is
 * the entire failure mode this file exists to avoid.
 */
const personId = (siteUrl: URL | undefined) => `${abs(siteUrl, '/')}#person`;
const webSiteId = (siteUrl: URL | undefined) => `${abs(siteUrl, '/')}#website`;

/** The Person node. Emitted on every page; referenced by @id from the rest. */
export function person(siteUrl: URL | undefined) {
  /* Only profiles that are unambiguously this person. A wrong entry here
     is worse than a missing one: sameAs is an assertion of sameness, so a
     bad URL welds a stranger's record onto this identity. */
  const sameAs = [
    `https://github.com/${site.github}`,
    site.twitter && `https://twitter.com/${site.twitter}`,
    site.scholarUrl,
  ].filter(Boolean);

  return {
    '@type': 'Person',
    '@id': personId(siteUrl),
    name: site.author,
    /* The Chinese name reaches search engines nowhere else — it appears in
       the About prose and in no title, description or meta tag on the site. */
    alternateName: site.authorCn,
    url: abs(siteUrl, '/'),
    description: site.bio,
    homeLocation: { '@type': 'Place', name: site.location },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'University of Science and Technology of China',
      sameAs: 'https://en.ustc.edu.cn/',
    },
    /* Topical association, not keywords: these are what the publications
       on the About page are actually about. */
    knowsAbout: [
      'Generative models',
      'Cryo-electron microscopy',
      'Machine learning',
      'Computer vision',
    ],
    sameAs,
    /* Deliberately absent: `email`. site.config keeps the address ROT13'd
       precisely so the plain form appears nowhere in the built HTML, and a
       JSON-LD block is built HTML like any other — putting it here would
       hand harvesters the one string that design goes out of its way to
       withhold, in a machine-readable field, no less. */
  };
}

/** The site itself. Ties the writing to its author. */
export function webSite(siteUrl: URL | undefined) {
  return {
    '@type': 'WebSite',
    '@id': webSiteId(siteUrl),
    name: site.title,
    url: abs(siteUrl, '/'),
    description: site.description,
    inLanguage: ['en', 'zh-Hans'],
    author: { '@id': personId(siteUrl) },
    publisher: { '@id': personId(siteUrl) },
  };
}

/**
 * The About page as a page *about someone* — the type Google documents for
 * exactly this. Without it the Person node is just markup that happens to
 * sit here; `mainEntity` is what says the page is of that person.
 */
export function profilePage(siteUrl: URL | undefined, pageUrl: URL) {
  const canonical = canonicalOf(siteUrl, pageUrl);
  return {
    '@type': 'ProfilePage',
    '@id': canonical,
    url: canonical,
    name: site.author,
    mainEntity: { '@id': personId(siteUrl) },
    isPartOf: { '@id': webSiteId(siteUrl) },
  };
}

/** A post. */
export function blogPosting(siteUrl: URL | undefined, pageUrl: URL, post: Post) {
  const { title, date, revised, lang, tag, abstract } = post.data;
  const canonical = canonicalOf(siteUrl, pageUrl);

  return {
    '@type': 'BlogPosting',
    '@id': `${canonical}#post`,
    url: canonical,
    mainEntityOfPage: canonical,
    /* Google truncates headline past ~110 characters and treats a longer
       one as a reason to ignore the whole node. */
    headline: title.slice(0, 110),
    description: abstract ? plain(abstract) : undefined,
    /* The dates the page itself does not expose. The post header prints
       "2026.01.20" as plain text — the design wants the dots, not a
       <time datetime> — so these two fields are where a crawler gets them. */
    datePublished: date.toISOString(),
    dateModified: (revised ?? date).toISOString(),
    inLanguage: lang === 'zh' ? 'zh-Hans' : 'en',
    keywords: tag,
    image: abs(siteUrl, '/og.png'),
    author: { '@id': personId(siteUrl) },
    publisher: { '@id': personId(siteUrl) },
    isPartOf: { '@id': webSiteId(siteUrl) },
  };
}
