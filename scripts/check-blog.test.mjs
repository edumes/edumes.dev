import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { compile } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';
import { requireBlogIllustration } from '../src/content/require-blog-illustration.ts';

const validate = (source, id = 'fixture', locale = 'pt') => compile(source, {
  remarkPlugins: [remarkGfm, [requireBlogIllustration, { id, locale }]]
});

test('a standalone illustration can appear after the explanation it supports', async () => {
  await validate('# Example\n\nSome context.\n\n<Illustration />\n\nMore context.');
});

for (const [name, source] of Object.entries({
  missing: '# Example\n\nText only.',
  'code fence': '```mdx\n<Illustration />\n```',
  'inline code': 'Use `<Illustration />` here.',
  comment: '{/* <Illustration /> */}',
  'JavaScript string': '{"<Illustration />"}',
  'conditional element': '{false && <Illustration />}',
  'different component': '<Source path="examples/tiny-outbox" />'
})) {
  test(`rejects ${name} without a rendered illustration and identifies the source`, async () => {
    await assert.rejects(validate(source), /fixture\.pt\.mdx.*standalone <Illustration \/>/);
  });
}

const posts = JSON.parse(await readFile(new URL('../src/content/blog.json', import.meta.url), 'utf8'));
for (const post of posts) {
  for (const locale of ['pt', 'en']) {
    test(`${post.id}.${locale}.mdx includes an illustration`, async () => {
      const source = await readFile(new URL(`../src/content/blog/${post.id}.${locale}.mdx`, import.meta.url), 'utf8');
      await validate(source, post.id, locale);
    });
  }
}
