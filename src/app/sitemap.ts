import type { MetadataRoute } from 'next';
import { profile } from '@/content/site';
import { caseHref, getCases } from '@/content/cases';
import { getPosts, postHref } from '@/content/blog';
import { alternates, localeConfig, locales, type Locale } from '@/i18n/config';

export const dynamic = 'force-static';

// One entry per page and locale, each listing its translations, like the hreflang links in the page head.
const page = (href: (l: Locale) => string, lastModified?: string) =>
  locales.map((l) => ({
    url: profile.url + href(l),
    lastModified,
    alternates: { languages: Object.fromEntries(Object.entries(alternates(l, href).languages).map(([k, v]) => [k, profile.url + v])) }
  }));

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts();
  return [
    ...page((l) => localeConfig[l].home),
    ...getCases().flatMap((c) => page((l) => caseHref(l, c))),
    ...(posts.length ? page((l) => localeConfig[l].blog, posts[0].updated ?? posts[0].date) : []),
    ...posts.flatMap((p) => page((l) => postHref(l, p), p.updated ?? p.date)),
    ...page((l) => localeConfig[l].cv)
  ];
}
