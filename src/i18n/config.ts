export const locales = ['pt', 'en'] as const;
export type Locale = (typeof locales)[number];

// What changes per locale besides text: the html lang tag, the locale the switcher goes to, URLs and the résumé file.
export const localeConfig = {
  pt: { tag: 'pt-BR', og: 'pt_BR', alt: 'en', home: '/', cases: '/casos/', blog: '/blog/', cv: '/curriculo/', cvPdf: '/eduardo-santarosa-curriculo.pdf' },
  en: { tag: 'en', og: 'en_US', alt: 'pt', home: '/en/', cases: '/en/cases/', blog: '/en/blog/', cv: '/en/resume/', cvPdf: '/eduardo-santarosa-resume.pdf' }
} as const satisfies Record<Locale, { tag: string; og: string; alt: Locale; home: string; cases: string; blog: string; cv: string; cvPdf: string }>;

// Canonical URL plus hreflang links for a page whose URL in each locale is href(locale). Searchers in any other
// language get the English page.
export const alternates = (locale: Locale, href: (l: Locale) => string) => ({
  canonical: href(locale),
  languages: { ...Object.fromEntries(locales.map((l) => [localeConfig[l].tag, href(l)])), 'x-default': href('en') }
});
