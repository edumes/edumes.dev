import fs from 'node:fs';
import path from 'node:path';
import { localeConfig, type Locale } from '@/i18n/config';
import approved from './cases.json';

type CaseText = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  problem: string;
  how: { icon: string; title: string; body: string }[];
  story?: { id?: string; title: string; paragraphs: string[] }[];
  outcome: string;
  // The depth layer: the role line under the summary, and the closed "technical details" block at the end.
  // ponytail: optional while the cases are rolled out one by one; required once every case has it.
  role?: string;
  facts?: string[];
  details?: {
    decisions: { title: string; body: string }[];
    incident: { title: string; body: string };
    limits: string[];
  };
};
// `id` keys the case's visuals; each locale has its own slug.
export type CaseStudy = { id: string; featured?: boolean; icon?: string; stack: string[]; draft?: boolean } & Record<Locale, CaseText>;

// Unapproved drafts live in .private/ (git-ignored) and only appear in `next dev`, never in a build.
export const draftsDir = path.join(process.cwd(), '.private/drafts');
export function devDrafts<T>(name: string): (T & { draft: true })[] {
  const file = path.join(draftsDir, name);
  return process.env.NODE_ENV === 'development' && fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, 'utf8')).map((x: T) => ({ ...x, draft: true }))
    : [];
}

export const getCases = (): CaseStudy[] => [...(approved as CaseStudy[]), ...devDrafts<CaseStudy>('cases.json')];

export const caseHref = (locale: Locale, c: CaseStudy) => `${localeConfig[locale].cases}${c[locale].slug}/`;
