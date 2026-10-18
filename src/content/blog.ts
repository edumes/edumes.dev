import fs from 'node:fs';
import path from 'node:path';
import { localeConfig, type Locale } from '@/i18n/config';
import { devDrafts, draftsDir } from './cases';
import published from './blog.json';

type PostText = { slug: string; title: string; description: string };
// The body of each locale is an MDX file next to blog.json: blog/<id>.<locale>.mdx (drafts: in .private/drafts/).
// `case` links the post to the case study it comes from. Dates are civil dates (YYYY-MM-DD).
export type Post = { id: string; date: string; updated?: string; case?: string; tags: string[]; draft?: boolean } & Record<Locale, PostText>;

export const getPosts = (): Post[] =>
  [...(published as Post[]), ...devDrafts<Post>('blog.json')].sort((a, b) => b.date.localeCompare(a.date));

export const postHref = (locale: Locale, p: Post) => `${localeConfig[locale].blog}${p[locale].slug}/`;

// The blog only shows up in the nav and the sitemap once it has a post.
export const blogHref = (locale: Locale) => (getPosts().length ? localeConfig[locale].blog : undefined);

export const postSource = (p: Post, locale: Locale) =>
  fs.readFileSync(path.join(p.draft ? draftsDir : path.join(process.cwd(), 'src/content'), 'blog', `${p.id}.${locale}.mdx`), 'utf8');
