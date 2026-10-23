import { notFound } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { profile } from '@/content/site';
import { caseHref, getCases, type CaseStudy } from '@/content/cases';
import { blogHref, getPosts, postHref } from '@/content/blog';
import { localeConfig, type Locale } from '@/i18n/config';
import { Header } from './header';
import { visuals, type Visuals } from './visuals';
import { Footer, Letters, Stack, Words } from './home';
import { Icon, type IconName } from './icon';
import { Reveals, SineRibbons } from './effects';
import { JsonLd, author, pageMetadata } from './seo';
import { ogImage } from './og';

export const caseParams = (locale: Locale) => () => getCases().map((c) => ({ slug: c[locale].slug }));

// The stack goes into the description: it is what a recruiter searches for and the summary rarely names it.
const caseDescription = (text: CaseStudy[Locale], c: CaseStudy, stack: string) => `${text.summary} ${stack}: ${c.stack.join(', ')}.`;

export async function caseMetadata(locale: Locale, slug: string) {
  const c = getCases().find((x) => x[locale].slug === slug);
  if (!c) return {};
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata(locale, {
    title: `${c[locale].title} | ${profile.name}`,
    description: caseDescription(c[locale], c, t('stack')),
    href: (l) => caseHref(l, c),
    article: { tags: c.stack }
  });
}

export async function caseOg(locale: Locale, slug: string) {
  const c = getCases().find((x) => x[locale].slug === slug)!;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return ogImage(locale, { eyebrow: `${t('caseStudy')} · ${c[locale].category}`, title: c[locale].title, tags: c.stack });
}

export function CasePage({ slug }: { slug: string }) {
  const locale = useLocale();
  const t = useTranslations();
  const cases = getCases();
  const i = cases.findIndex((c) => c[locale].slug === slug);
  if (i < 0) notFound();
  const c = cases[i];
  const text = c[locale];
  const next = cases[(i + 1) % cases.length];
  const posts = getPosts().filter((p) => p.case === c.id);
  const chapters = text.story?.filter((section) => section.id);

  return (
    <>
      <JsonLd
        data={{
          '@type': 'Article',
          headline: text.title,
          description: caseDescription(text, c, t('meta.stack')),
          url: profile.url + caseHref(locale, c),
          inLanguage: localeConfig[locale].tag,
          articleSection: t('meta.caseStudy'),
          keywords: c.stack.join(', '),
          author,
          publisher: author
        }}
      />
      <Header
        altHref={caseHref(localeConfig[locale].alt, c)}
        section="cases"
        cases={cases.map((x) => ({ label: x[locale].title, href: caseHref(locale, x) }))}
        blog={blogHref(locale)}
      />
      <main id="main" className="mx-auto max-w-6xl px-(--gutter) pt-28 pb-20 sm:pt-36">
        <Reveals />
        <a href={`${localeConfig[locale].home}#cases`} className="type-meta inline-flex items-center gap-1.5 hover:text-foreground" data-cuelume-navigate="back">
          <Icon name="arrow-left" size={14} />
          {t('ui.backToCases')}
        </a>
        <p className="type-meta mt-10 flex items-center gap-2">
          {c.icon && <Icon name={c.icon as IconName} size={16} />}
          {text.category}
        </p>
        <h1 className="type-display mt-3 max-w-[18ch] text-[clamp(2.2rem,1.4rem+3.6vw,4.4rem)]!" data-reveal>
          <Letters text={text.title} />
        </h1>
        <p className="type-lead mt-6 max-w-[56ch] text-muted-foreground" data-reveal>
          <Words text={text.summary} />
        </p>
        <div className="mt-6 max-w-[60ch] border-s-2 border-border ps-4">
          <p className="text-[0.9375rem]">{text.role}</p>
          <p className="type-meta mt-1">{text.facts.join(' · ')}</p>
        </div>
        <div className="mt-8">
          <Stack items={c.stack} />
        </div>

        {!!chapters?.length && (
          <nav aria-labelledby="case-contents" className="mt-12 max-w-[80ch] border-y border-border py-6">
            <h2 id="case-contents" className="type-meta">{t('cases.contents')}</h2>
            <ol className="mt-4 grid list-decimal gap-x-10 gap-y-3 ps-5 text-[0.9375rem] marker:text-muted-foreground sm:grid-cols-2">
              {[
                { id: 'problem', title: t('cases.problem') },
                { id: 'how-it-works', title: t('cases.how') },
                ...chapters,
                { id: 'outcome', title: t('cases.results') },
                { id: 'technical-details', title: t('cases.details') }
              ].map((section) => (
                <li key={section.id} className="ps-1">
                  <a href={`#${section.id}`} className="text-muted-foreground underline decoration-transparent underline-offset-4 hover:text-foreground hover:decoration-border">
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <VisualStory text={text} v={visuals[c.id]} />

        {posts.length > 0 && (
          <ul className="mt-16 grid gap-4">
            {posts.map((p) => (
              <li key={p.id}>
                <a href={postHref(locale, p)} className="group block border-t border-border pt-5" data-cuelume-navigate data-icon-host>
                  <span className="type-meta flex items-center gap-1.5">
                    <Icon name="book-text" size={14} />
                    {t('blog.title')}
                  </span>
                  <span className="type-heading mt-2 block underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-border">
                    {p[locale].title}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}

        {next !== c && (
          <>
            <SineRibbons seed={i + 1} className="mt-16" />
            <a
              href={caseHref(locale, next)}
              className="group mt-4 block"
              data-cuelume-navigate
            >
              <span className="type-meta flex items-center gap-1.5">
                {t('ui.nextCase')}
                <Icon name="arrow-right" size={14} />
              </span>
              <span className="type-title mt-2 block max-w-[24ch] underline decoration-transparent underline-offset-[0.15em] transition-colors group-hover:decoration-border">
                {next[locale].title}
              </span>
            </a>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

const figure = 'rounded-lg border border-border bg-muted/50 p-4 sm:p-6';

function Part({ id, icon, title, children }: { id?: string; icon: IconName; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-20 sm:mt-28">
      <h2 id={id} tabIndex={id ? -1 : undefined} className="type-heading flex items-center gap-2.5" data-icon-host>
        <Icon name={icon} size={20} className="text-muted-foreground" />
        {title}
      </h2>
      {children}
    </section>
  );
}

// The case page: the hero visual, then the problem, how it works and the outcome, each told by a visual with a
// sentence or a few short cards around it. A case without visuals yet (a new draft) shows the text alone.
function VisualStory({ text, v }: { text: CaseStudy[Locale]; v?: Visuals }) {
  const t = useTranslations('cases');
  return (
    <>
      {v && (
        <figure className="mt-14 sm:mt-20">
          <div className={figure}>
            <v.hero />
          </div>
          <figcaption className="type-meta mt-3">{t('disclaimer')}</figcaption>
        </figure>
      )}

      <Part id="problem" icon="badge-alert" title={t('problem')}>
        <p className="type-lead mt-4 max-w-[62ch] text-muted-foreground" data-reveal>
          <Words text={text.problem} />
        </p>
        {v && (
          <div className="mt-8">
            <v.problem />
          </div>
        )}
      </Part>

      <Part id="how-it-works" icon="workflow" title={t('how')}>
        {v && (
          <div className={`${figure} mt-8`}>
            <v.how />
          </div>
        )}
        <ul className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {text.how.map((h) => (
            <li key={h.title} className="border-t border-border pt-4" data-icon-host>
              <p className="flex items-center gap-2 font-semibold font-stretch-104%">
                <Icon name={h.icon as IconName} size={16} className="text-muted-foreground" />
                {h.title}
              </p>
              <p className="mt-1.5 text-[0.9375rem] text-muted-foreground">{h.body}</p>
            </li>
          ))}
        </ul>
      </Part>

      {text.story?.map((section) => (
        <Part key={section.title} id={section.id} icon="book-text" title={section.title}>
          <div className="mt-4 grid max-w-[68ch] gap-4 text-muted-foreground">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Part>
      ))}

      <Part id="outcome" icon="trending-up" title={t('results')}>
        {v && (
          <div className={`${figure} mt-8`}>
            <v.result />
          </div>
        )}
        <p className="type-lead mt-8 max-w-[62ch]" data-reveal>
          <Words text={text.outcome} />
        </p>
      </Part>

      <Details d={text.details} />
    </>
  );
}

const cards = 'mt-4 grid gap-x-10 gap-y-8 sm:grid-cols-2';
const sub = 'type-meta mt-14 first:mt-8';

// The depth layer, closed by default so the page stays short: decisions, one real problem, limits and next steps.
function Details({ d }: { d: NonNullable<CaseStudy[Locale]['details']> }) {
  const t = useTranslations('cases');
  return (
    <details className="disclosure group mt-20 border-t border-border pt-6 sm:mt-28">
      <summary id="technical-details" className="flex cursor-pointer list-none items-center gap-2.5 [&::-webkit-details-marker]:hidden" data-icon-host>
        <h2 className="type-heading flex items-center gap-2.5">
          <Icon name="cog" size={20} className="text-muted-foreground" />
          {t('details')}
        </h2>
        <Icon name="arrow-down" size={18} still className="ms-auto text-muted-foreground transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <div className="pb-2">
        <h3 className={sub}>{t('decisions')}</h3>
        <ul className={cards}>
          {d.decisions.map((x) => (
            <li key={x.title} className="border-t border-border pt-4">
              <p className="font-semibold font-stretch-104%">{x.title}</p>
              <p className="mt-1.5 text-[0.9375rem] text-muted-foreground">{x.body}</p>
            </li>
          ))}
        </ul>
        <h3 className={sub}>{t('incident')}</h3>
        <div className="mt-4 max-w-[62ch] border-t border-border pt-4">
          <p className="font-semibold font-stretch-104%">{d.incident.title}</p>
          <p className="mt-1.5 text-[0.9375rem] text-muted-foreground">{d.incident.body}</p>
        </div>
        <h3 className={sub}>{t('limits')}</h3>
        <ul className="mt-4 grid max-w-[62ch] gap-3 text-[0.9375rem] text-muted-foreground">
          {d.limits.map((x) => (
            <li key={x} className="border-t border-border pt-3">
              {x}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
