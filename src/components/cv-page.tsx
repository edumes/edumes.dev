import { useLocale, useMessages, useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { bareUrl, profile } from '@/content/site';
import { caseHref, getCases } from '@/content/cases';
import { localeConfig, type Locale } from '@/i18n/config';
import { Words } from './home';
import { Reveals } from './effects';
import { pageMetadata } from './seo';

// Printed to PDF by scripts/build-cv.mjs. Fixed neutral colors so the active theme never leaks into the PDF.
export async function cvMetadata(locale: Locale) {
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata(locale, { title: t('cvTitle'), description: t('cvDescription'), href: (l) => localeConfig[l].cv });
}

const H = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mt-4 border-b border-neutral-300 pb-1 text-[0.8rem] font-semibold tracking-wide text-[#3446b8] font-stretch-110%">
    {children}
  </h2>
);

export function CvPage() {
  const locale = useLocale();
  const t = useTranslations();
  const m = useMessages();
  const job = m.experience.jobs[0];

  return (
    <main className="mx-auto min-h-screen max-w-[210mm] bg-white px-[16mm] py-[14mm] text-[0.78rem] leading-[1.45] text-neutral-800 print:p-0">
      <style>{`@page{size:A4;margin:14mm 16mm}@media print{html,body{background:#fff!important}}`}</style>
      <header>
        <h1 className="text-[1.9rem] leading-none font-semibold tracking-[-0.02em] text-neutral-950 font-stretch-115%">{profile.fullName}</h1>
        <p className="mt-2 text-[1rem] text-neutral-700">{t('meta.role')}</p>
        <ul className="mt-3 flex flex-wrap gap-x-3.5 gap-y-1 text-neutral-600">
          <li>{t('cv.place')}</li>
          <li>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </li>
          <li>
            <a href={profile.linkedin}>{bareUrl(profile.linkedin)}</a>
          </li>
          <li>
            <a href={profile.github}>{bareUrl(profile.github)}</a>
          </li>
          <li>
            <a href={profile.url}>{bareUrl(profile.url)}</a>
          </li>
        </ul>
      </header>

      <H>{t('cv.summaryTitle')}</H>
      {/* Screen-only reveal: globals.css never hides it in print, so the PDF from build-cv.mjs keeps the text. */}
      <Reveals />
      <p className="mt-2" data-reveal>
        <Words text={t('cv.summary')} />
      </p>

      <H>{t('experience.title')}</H>
      <div className="mt-2 flex items-baseline justify-between gap-4">
        <p className="font-semibold text-neutral-950">
          {job.role}, {job.org}
        </p>
        <p className="shrink-0 text-neutral-600">{job.period}</p>
      </div>
      <ul className="mt-1.5 list-disc space-y-0.5 pl-4 marker:text-neutral-400">
        {m.cv.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>

      <H>{t('cv.highlightsTitle')}</H>
      <ul className="mt-2 space-y-1.5">
        {getCases()
          .filter((c) => c.featured)
          .map((c) => (
          <li key={c.id} className="break-inside-avoid">
            <a href={profile.url + caseHref(locale, c)} className="font-semibold text-neutral-950">
              {c[locale].title}
            </a>
            <p className="text-neutral-700">{c[locale].summary}</p>
          </li>
        ))}
      </ul>

      <H>{t('skills.title')}</H>
      <dl className="mt-2 grid grid-cols-[6.5rem_1fr] gap-x-4 gap-y-0.5">
        {m.skills.groups.map((g) => (
          <div key={g.name} className="contents">
            <dt className="text-neutral-500">{g.name}</dt>
            <dd>{g.items.join(', ')}</dd>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-[1fr_12rem] gap-x-8">
        <section>
          <H>{t('experience.educationTitle')}</H>
          <ul className="mt-2 space-y-1">
            {m.experience.education.map((e) => (
              <li key={e.org}>
                <span className="font-semibold text-neutral-950">{e.course}</span>, {e.org}
                <span className="text-neutral-600">. {e.period}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <H>{t('cv.languagesTitle')}</H>
          <p className="mt-2">{t('cv.languages')}</p>
        </section>
      </div>
    </main>
  );
}
