import { postOg, postParams } from '@/components/blog-page';

export const alt = 'Article by Eduardo Santarosa, full-stack developer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = postParams('en');

export default async ({ params }: { params: Promise<{ slug: string }> }) => postOg('en', (await params).slug);
