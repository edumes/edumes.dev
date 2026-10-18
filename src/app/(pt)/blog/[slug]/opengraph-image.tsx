import { postOg, postParams } from '@/components/blog-page';

export const alt = 'Artigo de Eduardo Santarosa, desenvolvedor full stack';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = postParams('pt');

export default async ({ params }: { params: Promise<{ slug: string }> }) => postOg('pt', (await params).slug);
