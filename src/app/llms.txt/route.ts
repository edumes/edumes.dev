import { profile } from '@/content/site';
import { caseHref, getCases } from '@/content/cases';
import { getPosts, postHref } from '@/content/blog';
import { localeConfig } from '@/i18n/config';
import en from '@/i18n/messages/en.json';

export const dynamic = 'force-static';

// llmstxt.org: the profile in plain Markdown for AI assistants, built from the same content as the English pages.
export function GET() {
  const url = (href: string) => profile.url + href;
  const text = [
    `# ${profile.name}`,
    '',
    `> ${en.meta.description}`,
    '',
    ...en.about.body.flatMap((p) => [p, '']),
    '## Profile',
    '',
    `- Name: ${profile.fullName} (online: ${profile.handles.join(', ')})`,
    `- Role: ${en.meta.role}`,
    `- Based in: ${en.cv.place} (UTC−3)`,
    `- Languages: ${en.cv.languages}`,
    ...en.experience.jobs.map((j) => `- Experience: ${j.role}, ${j.org}, ${j.period}. ${j.body}`),
    ...en.experience.education.map((e) => `- Education: ${e.course}, ${e.org}, ${e.period}`),
    ...en.skills.groups.map((g) => `- ${g.name}: ${g.items.join(', ')}`),
    '',
    '## Case studies',
    '',
    ...getCases().map((c) => `- [${c.en.title}](${url(caseHref('en', c))}): ${c.en.summary} Stack: ${c.stack.join(', ')}.`),
    '',
    ...(getPosts().length ? ['## Articles', '', ...getPosts().map((p) => `- [${p.en.title}](${url(postHref('en', p))}) (${p.date}): ${p.en.description}`), ''] : []),
    '## Links',
    '',
    `- [Home (English)](${url(localeConfig.en.home)})`,
    `- [Home (Português)](${url(localeConfig.pt.home)})`,
    `- [Résumé (PDF, English)](${url(localeConfig.en.cvPdf)})`,
    `- [Currículo (PDF, Português)](${url(localeConfig.pt.cvPdf)})`,
    `- [GitHub](${profile.github})`,
    `- [LinkedIn](${profile.linkedin})`,
    `- E-mail: ${profile.email}`,
    ''
  ];
  return new Response(text.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
