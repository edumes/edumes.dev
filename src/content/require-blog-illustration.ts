import type { Root } from 'mdast';

// Check parsed MDX so a code sample, comment or conditional cannot stand in for the illustration.
export function requireBlogIllustration({ id, locale }: { id: string; locale: string }) {
  return (tree: Root) => {
    const illustration = tree.children.some((node) => node.type === 'mdxJsxFlowElement' && node.name === 'Illustration');
    if (!illustration) {
      throw new Error(`Blog post "${id}.${locale}.mdx" must include a standalone <Illustration /> in its body.`);
    }
  };
}
