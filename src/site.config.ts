/** Single source of truth for site-wide copy and profile links. */
export const site = {
  title: 'Working Notes',
  author: 'Jing Yuan',
  authorCn: '袁璟',
  location: 'Shanghai, CN',
  /**
   * Contact address, ROT13'd — deliberately, not for secrecy.
   *
   * This repo is public and so is the built HTML, and address harvesters
   * regex both for `name@host.tld`. Storing the rotated form means the plain
   * address exists in neither; SocialRow decodes it in the browser, on the
   * first hover or focus of the email link. Set '' to drop the link entirely.
   *
   * To re-encode after changing it — ROT13 is its own inverse, so the same
   * command also decodes what is here:
   *
   *   node -p "'you@example.com'.replace(/[a-z]/gi, c => String.fromCharCode(
   *     (c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26))"
   */
  emailRot13: 'rhtrarwlhna@tznvy.pbz',
  description:
    "A slow-burning notebook. I write here whenever something I've been thinking " +
    'about feels worth writing down. Drafts in 中文 / English, revised in public.',
  /**
   * One line about the person, as opposed to the site. Used as the About
   * page's meta description and as `description` on the Person node in
   * src/lib/schema.ts — the two have to agree, so they come from here.
   */
  bio: 'Jing Yuan (袁璟) — most recently a Research Scientist at ByteDance Seed (AI for Science), working on generative modeling and cryo-EM.',
  /**
   * The interests note. Rendered verbatim on both the home page and About,
   * label included — this is the only place it needs changing.
   */
  interests:
    'currently interested in: continual adaptation, generative models, ' +
    'and whatever eventually makes AGI.dev compile',
  github: 'eugenejyuan',
  /** This site's own repository. The footer links its LICENSE from here. */
  repoUrl: 'https://github.com/eugenejyuan/eugenejyuan.github.io',
  /** Handle only — SocialRow builds the URL. Set '' to hide the link. */
  twitter: 'eugenejyuan',
  /** Full profile URL. Set '' to hide the link. */
  scholarUrl: 'https://scholar.google.com/citations?user=ECegJ0EAAAAJ',
  /** Optional portrait on the About page, e.g. '/portrait.jpg' in public/. */
  portrait: '' as string,
};
