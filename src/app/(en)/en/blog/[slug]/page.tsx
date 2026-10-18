import { setRequestLocale } from 'next-intl/server';
import { PostPage, postMetadata, postParams } from '@/components/blog-page';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = postParams('en');
export const generateMetadata = async ({ params }: Props) => postMetadata('en', (await params).slug);

export default async function Page({ params }: Props) {
  setRequestLocale('en');
  return <PostPage locale="en" slug={(await params).slug} />;
}
