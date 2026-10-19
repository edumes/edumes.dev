import { Fragment } from 'react';
import {
  siAndroid, siDocker, siExpo, siExpress, siFastapi, siFastify, siFfmpeg, siGit, siGo, siJest, siKnexdotjs, siLaravel,
  siMui, siMysql, siNestjs, siNextdotjs, siNodedotjs, siPhp, siPostgresql, siPrisma, siPuppeteer, siPython, siQt, siReact,
  siRedis, siShadcnui, siSqlalchemy, siTailwindcss, siTypeorm, siTypescript, siVite
} from 'simple-icons';
import { useLocale, useMessages, useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { bareUrl, profile, sectionIcons } from '@/content/site';
import { caseHref, getCases } from '@/content/cases';
import { blogHref } from '@/content/blog';
import { localeConfig, type Locale } from '@/i18n/config';
import { Header } from './header';
import { StackTrace } from './stack-trace';
import { CopyEmail } from './copy-email';
import { HeroGradient } from './hero-gradient';
import { HeroTitle } from './hero-title';
import { DownloadCv, Reveals, RippleGrid, Scramble, SineRibbons } from './effects';
import { Icon, type IconName } from './icon';
import { visuals } from './visuals';
import { ProjectScene } from './visuals/projects';
import { JsonLd, PERSON_ID, pageMetadata, usePerson } from './seo';

export const button = 'pressable inline-flex items-center gap-2 rounded-md px-5 py-3 text-[0.9375rem] font-medium';

// Text for a [data-reveal] block, split so globals.css can stagger it in once <Reveals /> sees it. Words stay real
// text; Letters hides its split copy from screen readers behind the plain one.
export function Words({ text }: { text: string }) {
  return text.split(' ').map((w, i) => (
    <Fragment key={i}>
      {i > 0 && ' '}
      <span className="word" style={{ '--i': i } as React.CSSProperties}>
        {w}
      </span>
    </Fragment>
  ));
}

export function Letters({ text }: { text: string }) {
  let n = 0;
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.split(' ').map((w, i) => (
          <Fragment key={i}>
            {i > 0 && ' '}
            <span className="inline-block whitespace-nowrap">
              {[...w].map((c) => (
                <span key={n} className="char" style={{ '--i': n++ } as React.CSSProperties}>
                  {c}
                </span>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </>
  );
}

function Section({ id, title, children }: { id: keyof typeof sectionIcons; title: string; children: React.ReactNode }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="mx-auto max-w-6xl px-(--gutter) py-20 sm:py-28 lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-16"
    >
      <h2 id={`${id}-title`} className="type-heading flex items-start gap-2.5 lg:sticky lg:top-24 lg:self-start" data-icon-host>
        <Icon name={sectionIcons[id]} size={20} className="mt-[0.15em] text-muted-foreground" />
        {title}
      </h2>
      <div className="mt-8 lg:mt-0">{children}</div>
    </section>
  );
}

export function SubHeading({ icon, className = '', children }: { icon: IconName; className?: string; children: React.ReactNode }) {
  return (
    <h3 className={`type-heading flex items-center gap-2.5 ${className}`} data-icon-host>
      <Icon name={icon} size={18} className="text-muted-foreground" />
      {children}
    </h3>
  );
}

export async function homeMetadata(locale: Locale) {
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata(locale, { title: t('title'), description: t('description'), href: (l) => localeConfig[l].home, profile: true });
}

export function Home() {
  const locale = useLocale();
  const t = useTranslations();
  const m = useMessages();
  const person = usePerson();
  const cases = getCases();
  const featured = cases.filter((c) => c.featured || c.draft);
  const more = cases.filter((c) => !c.featured && !c.draft);
  const { home, tag } = localeConfig[locale];

  return (
    <>
      <JsonLd
        data={{
          '@graph': [
            { '@type': 'ProfilePage', url: profile.url + home, name: t('meta.title'), inLanguage: tag, mainEntity: { '@id': PERSON_ID } },
            { '@type': 'WebSite', '@id': `${profile.url}/#website`, url: profile.url, name: profile.name, inLanguage: ['pt-BR', 'en'], publisher: { '@id': PERSON_ID } },
            person
          ]
        }}
      />
      <Header
        altHref={localeConfig[localeConfig[locale].alt].home}
        cases={cases.map((c) => ({ label: c[locale].title, href: caseHref(locale, c) }))}
        blog={blogHref(locale)}
      />
      <main id="main">
        <HeroGradient />
        <RippleGrid />
        <Reveals />
        <section id="top" className="mx-auto max-w-6xl px-(--gutter) pt-24 pb-8 sm:pt-28">
          <HeroTitle heading={`${profile.name}, ${t('meta.role')}`} />
          {/* Each load starts on the phrase after the last one shown (random on a first visit), swapped in before paint
              from the hidden sizers so it never flashes phrase 0. HeroTitle picks the index up when it hydrates. */}
          <script
            dangerouslySetInnerHTML={{
              __html: `try{var g=document.currentScript.previousElementSibling.lastElementChild,s=g.querySelectorAll('.invisible'),n=s.length,i=Math.floor(Math.random()*n);try{var l=localStorage.getItem('edumes:hero');if(l!==null)i=(+l+1)%n||0;localStorage.setItem('edumes:hero',i)}catch(e){}g.lastElementChild.textContent=s[i].textContent;window.__heroStart=i}catch(e){}`
            }}
          />
          <p className="type-lead mt-8 max-w-[54ch] text-muted-foreground" data-reveal>
            <Words text={t('hero.lead')} />
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#cases" className={`${button} shimmer bg-primary text-primary-foreground hover:opacity-90`} data-cuelume-navigate>
              {t('hero.primary')}
              <Icon name="arrow-down" size={16} loop={5000} />
            </a>
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className={`${button} border border-border hover:bg-muted`} data-cuelume-tap>
              <Icon name="github" size={16} />
              GitHub
            </a>
            <DownloadCv className={`${button} border border-border hover:bg-muted`} />
          </div>
          <StackTrace />
        </section>
        <SineRibbons seed={1} className="-mb-12 sm:-mb-16" />
        <Section id="cases" title={t('cases.title')}>
          <p className="type-lead max-w-[60ch] text-muted-foreground" data-reveal>
            <Words text={t('cases.intro')} />
          </p>
          {cases.length === 0 && <p className="mt-10 text-muted-foreground">{t('cases.empty')}</p>}
          <div className="mt-14 grid gap-16">
            {/* Each case is a wide row: its visual on one side and the short text on the other, alternating. */}
            {featured.map((c, i) => {
              const text = c[locale];
              const v = visuals[c.id];
              return (
                <article
                  key={c.id}
                  className={`group relative grid items-center gap-8 border-t border-border pt-8 lg:gap-10 ${
                    !v ? '' : i % 2 ? 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]' : 'lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]'
                  }`}
                  data-icon-host
                >
                  {v && (
                    <div className={`rounded-lg border border-border bg-muted/50 p-3 sm:p-5 ${i % 2 ? 'lg:order-2' : ''}`}>
                      <v.hero />
                    </div>
                  )}
                  <div>
                    <p className="type-meta flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2">
                        {c.icon && <Icon name={c.icon as IconName} size={16} />}
                        {text.category}
                      </span>
                      {c.draft && (
                        <span className="rounded-sm border border-dashed border-(--attention) px-2 py-0.5 text-xs text-foreground">{t('ui.draft')}</span>
                      )}
                    </p>
                    <h3 className="type-title mt-3">
                      <a href={caseHref(locale, c)} className="after:absolute after:inset-0" data-cuelume-navigate>
                        {text.title}
                      </a>
                    </h3>
                    <p className="mt-4 text-muted-foreground" data-reveal>
                      <Words text={text.summary} />
                    </p>
                    <div className="mt-6">
                      <Stack items={c.stack} />
                    </div>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-link underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-current">
                      {t('ui.readCase')}
                      <Icon name="arrow-right" size={16} />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
          {more.length > 0 && (
            <>
              <SubHeading icon="file-stack" className="mt-24">
                {t('cases.more')}
              </SubHeading>
              <ul className="mt-6 grid gap-x-10 md:grid-cols-2">
                {more.map((c) => {
                  const v = visuals[c.id];
                  return (
                    <li key={c.id} className="border-t border-border">
                      <a href={caseHref(locale, c)} className="group block py-5" data-cuelume-navigate>
                        {v && (
                          <div className="mb-4 rounded-lg border border-border bg-muted/50 p-3">
                            <v.hero />
                          </div>
                        )}
                        <p className="type-meta flex items-center gap-2">
                          {c.icon && <Icon name={c.icon as IconName} size={14} />}
                          {c[locale].category}
                        </p>
                        <p className="mt-1 font-semibold font-stretch-104% underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-border">
                          {c[locale].title}
                        </p>
                        <p className="mt-1.5 text-[0.9375rem] text-muted-foreground">{c[locale].summary}</p>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </Section>

        <Section id="projects" title={t('projects.title')}>
          <p className="type-lead max-w-[60ch] text-muted-foreground" data-reveal>
            <Words text={t('projects.intro')} />
          </p>
          <ul className="mt-12 grid gap-10 md:grid-cols-2">
            {m.projects.items.map((p) => (
              <li key={p.name} className="border-t border-border pt-5" data-icon-host>
                <ProjectScene name={p.name} />
                <h3 className="type-heading flex items-center gap-2.5">
                  <Icon name={p.icon as IconName} size={20} className="text-muted-foreground" />
                  {p.name}
                </h3>
                <p className="mt-2 max-w-[52ch] text-[0.9375rem] text-muted-foreground">{p.body}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                  <Stack items={p.stack} />
                  {p.href && (
                    <a href={p.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-link underline-offset-4 hover:underline" data-cuelume-tap>
                      <Icon name="github" size={16} />
                      {t('projects.code')}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Section>
        <SineRibbons seed={2} className="-my-12 sm:-my-16" />
        <Section id="about" title={t('about.title')}>
          <div className="type-lead grid max-w-[62ch] gap-5">
            {m.about.body.map((p) => (
              <p key={p} data-reveal>
                <Words text={p} />
              </p>
            ))}
          </div>
          <SubHeading icon="hammer" className="mt-16">
            {t('skills.title')}
          </SubHeading>
          <dl className="mt-6 grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {m.skills.groups.map((g) => (
              <div key={g.name} className="border-t border-border pt-4" data-icon-host>
                <dt className="type-meta flex items-center gap-2">
                  <Icon name={g.icon as IconName} size={16} />
                  {g.name}
                </dt>
                <dd className="mt-3">
                  <Stack items={g.items} />
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="experience" title={t('experience.title')}>
          <ol className="grid gap-12">
            {m.experience.jobs.map((j) => (
              <li key={j.org} className="grid gap-2 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8" data-icon-host>
                <p className="type-meta flex items-center gap-2 self-start pt-1">
                  <Icon name="calendar-days" size={14} />
                  {j.period}
                </p>
                <div>
                  <h3 className="type-heading">
                    {j.role}, {j.org}
                  </h3>
                  <p className="type-meta mt-1 flex items-center gap-1.5">
                    <Icon name="map-pin" size={14} />
                    {j.place}
                  </p>
                  <p className="mt-4 max-w-[62ch]">{j.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <SubHeading icon="folder-kanban" className="mt-20">
            {t('experience.domainsTitle')}
          </SubHeading>
          <ul className="mt-6 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {m.experience.domains.map((d) => (
              <li key={d.name} className="border-t border-border py-4" data-icon-host>
                <p className="flex items-center gap-2 font-medium">
                  <Icon name={d.icon as IconName} size={16} className="text-muted-foreground" />
                  {d.name}
                </p>
                <p className="mt-0.5 pl-6 text-sm text-muted-foreground">{d.note}</p>
              </li>
            ))}
          </ul>
          <SubHeading icon="graduation-cap" className="mt-20">
            {t('experience.educationTitle')}
          </SubHeading>
          <ol className="mt-6 grid gap-6">
            {m.experience.education.map((e) => (
              <li key={e.org} className="grid gap-1 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8">
                <p className="type-meta pt-0.5">{e.period}</p>
                <p>
                  {e.course}
                  <span className="text-muted-foreground">, {e.org}</span>
                </p>
              </li>
            ))}
          </ol>
        </Section>
        <SineRibbons seed={3} className="-my-12 sm:-my-16" />
        <Section id="contact" title={t('contact.title')}>
          <p className="type-lead max-w-[48ch]" data-reveal>
            <Words text={t('contact.body')} />
          </p>
          <a
            href={`mailto:${profile.email}`}
            className="type-title mt-8 inline-block break-all normal-case underline decoration-border decoration-2 underline-offset-[0.2em] transition-colors hover:decoration-link"
            data-cuelume-tap
          >
            <Scramble text={profile.email} />
          </a>
          <div className="mt-8 flex flex-wrap gap-3">
            <CopyEmail className={`${button} border border-border hover:bg-muted`} />
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={`${button} border border-border hover:bg-muted`} data-cuelume-tap>
              <Icon name="linkedin" size={16} />
              LinkedIn
            </a>
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className={`${button} border border-border hover:bg-muted`} data-cuelume-tap>
              <Icon name="github" size={16} />
              GitHub
            </a>
            <DownloadCv className={`${button} chrome-ring`} />
            <a href="/eduardo-santarosa.vcf" className={`${button} border border-border hover:bg-muted`} download data-cuelume-tap>
              <Icon name="user-plus" size={16} />
              {t('ui.saveContact')}
            </a>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}

// Brand marks from Simple Icons (CC0), drawn in the text color so they hold up in every theme. Tools without a mark
// get a still lucide glyph instead, so every chip carries one.
const logos: Record<string, { path: string }> = {
  'Node.js': siNodedotjs, TypeScript: siTypescript, Fastify: siFastify, Express: siExpress, NestJS: siNestjs, Python: siPython,
  FastAPI: siFastapi, PHP: siPhp, Laravel: siLaravel, React: siReact, 'React Native': siReact, 'Next.js': siNextdotjs,
  Vite: siVite, 'Tailwind CSS': siTailwindcss, 'shadcn/ui': siShadcnui, 'Material UI': siMui, Expo: siExpo,
  PostgreSQL: siPostgresql, MySQL: siMysql, Redis: siRedis, TypeORM: siTypeorm, Prisma: siPrisma, Knex: siKnexdotjs,
  SQLAlchemy: siSqlalchemy, Puppeteer: siPuppeteer, Docker: siDocker, Git: siGit, Jest: siJest, Android: siAndroid,
  Go: siGo, ffmpeg: siFfmpeg, PyQt6: siQt
};
const glyphs: Record<string, IconName> = {
  Playwright: 'cursor-click', pywinauto: 'bot', 'PDF e Excel': 'file-chart-line', 'PDF and Excel': 'file-chart-line',
  GitFlow: 'git-branch', 'AWS S3': 'cloud-upload', WebSocket: 'plug-zap', WebSockets: 'plug-zap', Webhooks: 'webhook',
  XML: 'file-text', pdfplumber: 'file-text', 'Omie API': 'connect', GnuCOBOL: 'terminal', 'Tesseract.js': 'scan-text'
};

export function Stack({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Stack">
      {items.map((s) => (
        <li key={s} className="inline-flex items-center gap-1.5 rounded-sm bg-secondary px-2.5 py-1 text-[0.8125rem] text-secondary-foreground">
          {logos[s] ? (
            <svg viewBox="0 0 24 24" className="size-3.5 shrink-0 fill-current" aria-hidden>
              <path d={logos[s].path} />
            </svg>
          ) : (
            glyphs[s] && <Icon name={glyphs[s]} size={14} still />
          )}
          {s}
        </li>
      ))}
    </ul>
  );
}

// The handles are spelled out so a search for them lands here too.
export function Footer() {
  const locale = useLocale();
  const t = useTranslations('nav');
  const blog = blogHref(locale);
  return (
    <footer className="type-meta mx-auto flex max-w-6xl flex-wrap justify-between gap-x-8 gap-y-3 px-(--gutter) pt-8 pb-28 md:pb-16">
      <p>© 2026 {profile.fullName}</p>
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {blog && (
          <li>
            <a href={blog} className="hover:text-foreground">
              {t('blog')}
            </a>
          </li>
        )}
        {[profile.github, profile.linkedin].map((url) => (
          <li key={url}>
            <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              {bareUrl(url)}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
