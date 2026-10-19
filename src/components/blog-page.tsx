import { notFound } from 'next/navigation';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { evaluate } from '@mdx-js/mdx';
import rehypeShiki from '@shikijs/rehype';
import remarkGfm from 'remark-gfm';
import * as runtime from 'react/jsx-runtime';
import type { MDXComponents } from 'mdx/types';
import { profile } from '@/content/site';
import { blogHref, getPosts, postHref, postSource, type Post } from '@/content/blog';
import { caseHref, getCases } from '@/content/cases';
import { localeConfig, type Locale } from '@/i18n/config';
import { Header } from './header';
import { Footer } from './home';
import { Icon } from './icon';
import { JsonLd, author, pageMetadata } from './seo';
import { ogImage } from './og';

const findPost = (locale: Locale, slug: string) => getPosts().find((p) => p[locale].slug === slug);
const minutes = (source: string) => Math.max(1, Math.round(source.split(/\s+/).length / 200));

export const postParams = (locale: Locale) => () => getPosts().map((p) => ({ slug: p[locale].slug }));

export async function blogMetadata(locale: Locale) {
  const t = await getTranslations({ locale, namespace: 'blog' });
  return {
    ...pageMetadata(locale, { title: `${t('title')} | ${profile.name}`, description: t('description'), href: (l) => localeConfig[l].blog }),
    // An empty blog stays out of search until its first post.
    ...(!getPosts().length && { robots: { index: false } })
  };
}

export function postMetadata(locale: Locale, slug: string) {
  const p = findPost(locale, slug);
  if (!p) return {};
  return pageMetadata(locale, {
    title: `${p[locale].title} | ${profile.name}`,
    description: p[locale].description,
    href: (l) => postHref(l, p),
    article: { published: p.date, modified: p.updated ?? p.date, tags: p.tags }
  });
}

export async function postOg(locale: Locale, slug: string) {
  const p = findPost(locale, slug)!;
  const t = await getTranslations({ locale, namespace: 'blog' });
  return ogImage(locale, { eyebrow: t('title'), title: p[locale].title, tags: p.tags });
}

function PostDate({ post, source }: { post: Post; source?: string }) {
  const t = useTranslations();
  const format = useFormatter();
  return (
    <p className="type-meta flex flex-wrap items-center gap-x-3 gap-y-1">
      <time dateTime={post.date}>{format.dateTime(new Date(post.date), { dateStyle: 'long', timeZone: 'UTC' })}</time>
      {source && <span>{t('blog.minutes', { n: minutes(source) })}</span>}
      {post.draft && <span className="rounded-sm border border-dashed border-(--attention) px-2 py-0.5 text-xs text-foreground">{t('ui.draft')}</span>}
    </p>
  );
}

export function BlogIndex() {
  const locale = useLocale();
  const t = useTranslations('blog');
  const posts = getPosts();
  return (
    <>
      <Header altHref={localeConfig[localeConfig[locale].alt].blog} blog={blogHref(locale)} />
      <main id="main" className="mx-auto max-w-6xl px-(--gutter) pt-28 pb-20 sm:pt-36">
        <h1 className="type-display text-[clamp(2.2rem,1.4rem+3.6vw,4.4rem)]!">{t('title')}</h1>
        <p className="type-lead mt-6 max-w-[56ch] text-muted-foreground">{t('intro')}</p>
        {posts.length === 0 && <p className="mt-14 text-muted-foreground">{t('empty')}</p>}
        <ul className="mt-14 grid max-w-3xl">
          {posts.map((p) => (
            <li key={p.id} className="border-t border-border">
              <a href={postHref(locale, p)} className="group block py-8" data-cuelume-navigate>
                <PostDate post={p} />
                <h2 className="type-title mt-2 underline decoration-transparent underline-offset-[0.15em] transition-colors group-hover:decoration-border">
                  {p[locale].title}
                </h2>
                <p className="mt-3 text-muted-foreground">{p[locale].description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-link" data-icon-host>
                  {t('read')}
                  <Icon name="arrow-right" size={16} />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}

// MDX elements in the site's type scale. Shiki colors the code at build time; globals.css picks its light or dark set.
const mdx: MDXComponents = {
  h2: (props) => <h2 className="type-heading mt-14 mb-4" {...props} />,
  h3: (props) => <h3 className="mt-10 mb-3 font-semibold font-stretch-104%" {...props} />,
  p: (props) => <p className="my-5" {...props} />,
  a: (props) => <a className="text-link underline underline-offset-4" {...(/^https?:/.test(props.href ?? '') && { target: '_blank', rel: 'noopener noreferrer' })} {...props} />,
  ul: (props) => <ul className="my-5 list-disc space-y-2 pl-6 marker:text-muted-foreground" {...props} />,
  ol: (props) => <ol className="my-5 list-decimal space-y-2 pl-6 marker:text-muted-foreground" {...props} />,
  blockquote: (props) => <blockquote className="my-6 border-l-2 border-border pl-5 text-muted-foreground" {...props} />,
  table: (props) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full text-left text-[0.9375rem] [&_td]:border-t [&_td]:border-border [&_td]:py-2 [&_td]:pr-4 [&_th]:pr-4 [&_th]:pb-2 [&_th]:font-semibold" {...props} />
    </div>
  )
};

// <Source path="examples/tiny-outbox" /> in a post: a card linking to that folder or file in the site's repository.
function Source({ path, label }: { path: string; label: string }) {
  return (
    <a
      href={`${profile.repo}/tree/main/${path}`}
      target="_blank" rel="noopener noreferrer"
      className="pressable my-6 flex items-center gap-3 rounded-lg border border-border px-4 py-3 hover:bg-muted"
      data-cuelume-tap
      data-icon-host
    >
      <Icon name="github" size={18} />
      <span className="grid">
        <span className="text-[0.9375rem] font-medium">{label}</span>
        <span className="type-meta font-mono">{path}</span>
      </span>
      <Icon name="arrow-right" size={16} className="ml-auto text-muted-foreground" />
    </a>
  );
}

export async function PostPage({ locale, slug }: { locale: Locale; slug: string }) {
  const p = findPost(locale, slug);
  if (!p) notFound();
  const source = postSource(p, locale);
  const { default: Body } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [[rehypeShiki, { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false }]]
  });
  const t = await getTranslations({ locale, namespace: 'blog' });
  const code = (await getTranslations({ locale, namespace: 'projects' }))('code');
  const related = getCases().find((c) => c.id === p.case);
  const { alt, blog, tag } = localeConfig[locale];

  return (
    <>
      <JsonLd
        data={{
          '@type': 'BlogPosting',
          headline: p[locale].title,
          description: p[locale].description,
          url: profile.url + postHref(locale, p),
          mainEntityOfPage: profile.url + postHref(locale, p),
          inLanguage: tag,
          datePublished: p.date,
          dateModified: p.updated ?? p.date,
          keywords: p.tags.join(', '),
          author,
          publisher: author
        }}
      />
      <Header altHref={postHref(alt, p)} blog={blog} />
      <main id="main" className="mx-auto max-w-6xl px-(--gutter) pt-28 pb-20 sm:pt-36">
        <a href={blog} className="type-meta inline-flex items-center gap-1.5 hover:text-foreground" data-cuelume-navigate="back" data-icon-host>
          <Icon name="arrow-left" size={14} />
          {t('back')}
        </a>
        <article className="mt-10 max-w-[68ch]">
          <PostDate post={p} source={source} />
          <h1 className="type-display mt-3 text-[clamp(2.1rem,1.4rem+3vw,3.8rem)]!">{p[locale].title}</h1>
          <p className="type-lead mt-6 text-muted-foreground">{p[locale].description}</p>
          <div className="mt-10">
            <Body components={{ ...mdx, Source: (props: { path: string }) => <Source label={code} {...props} /> }} />
          </div>
          <ul className="mt-12 flex flex-wrap gap-2" aria-label="Tags">
            {p.tags.map((s) => (
              <li key={s} className="rounded-sm bg-secondary px-2.5 py-1 text-[0.8125rem] text-secondary-foreground">
                {s}
              </li>
            ))}
          </ul>
          {related && (
            <a href={caseHref(locale, related)} className="group mt-12 block border-t border-border pt-6" data-cuelume-navigate data-icon-host>
              <span className="type-meta flex items-center gap-1.5">
                {t('relatedCase')}
                <Icon name="arrow-right" size={14} />
              </span>
              <span className="type-heading mt-2 block underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-border">
                {related[locale].title}
              </span>
            </a>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}
