import type { Metadata } from 'next';
import { useMessages, useTranslations } from 'next-intl';
import { profile } from '@/content/site';
import { alternates, localeConfig, type Locale } from '@/i18n/config';

type Page = {
  title: string;
  description: string;
  href: (l: Locale) => string;
  // Home is the profile; case studies and posts are articles (posts carry dates and tags).
  article?: { published?: string; modified?: string; tags?: string[] };
  profile?: boolean;
};

// Child metadata replaces its parent's openGraph whole, so every page builds the full set here. Share images come from
// the opengraph-image file next to each page.
export function pageMetadata(locale: Locale, { title, description, href, article, profile: isProfile }: Page): Metadata {
  const og = {
    siteName: profile.name,
    locale: localeConfig[locale].og,
    alternateLocale: localeConfig[localeConfig[locale].alt].og,
    url: href(locale),
    title,
    description
  };
  return {
    title,
    description,
    alternates: alternates(locale, href),
    openGraph: article
      ? { ...og, type: 'article', publishedTime: article.published, modifiedTime: article.modified, authors: [profile.url], tags: article.tags }
      : isProfile
        ? { ...og, type: 'profile', firstName: profile.name.split(' ')[0], lastName: profile.name.split(' ').at(-1), username: profile.handles[0] }
        : { ...og, type: 'website' },
    twitter: { card: 'summary_large_image', title, description }
  };
}

export const PERSON_ID = `${profile.url}/#person`;
export const author = { '@type': 'Person', '@id': PERSON_ID, name: profile.name, url: profile.url };

// schema.org data for search engines and AI assistants. `<` is escaped so text can never close the script tag.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c') }}
    />
  );
}

// The person behind the site, from the same messages the page shows, so the structured data never drifts from it.
export function usePerson() {
  const t = useTranslations('meta');
  const m = useMessages();
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: profile.name,
    alternateName: [profile.fullName, ...profile.handles],
    givenName: profile.fullName.split(' ')[0],
    familyName: profile.fullName.split(' ').slice(1).join(' '),
    jobTitle: t('role'),
    description: t('description'),
    url: profile.url,
    email: `mailto:${profile.email}`,
    sameAs: [profile.github, profile.linkedin],
    address: { '@type': 'PostalAddress', ...profile.address },
    knowsLanguage: ['pt-BR', 'en'],
    knowsAbout: m.skills.groups.flatMap((g) => g.items),
    worksFor: m.experience.jobs.map((j) => ({ '@type': 'Organization', name: j.org })),
    alumniOf: m.experience.education.map((e) => ({ '@type': 'EducationalOrganization', name: e.org }))
  };
}
