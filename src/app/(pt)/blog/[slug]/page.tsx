import { setRequestLocale } from 'next-intl/server';
import { PostPage, postMetadata, postParams } from '@/components/blog-page';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = postParams('pt');
export const generateMetadata = async ({ params }: Props) => postMetadata('pt', (await params).slug);

export default async function Page({ params }: Props) {
  setRequestLocale('pt');
  return <PostPage locale="pt" slug={(await params).slug} />;
}
