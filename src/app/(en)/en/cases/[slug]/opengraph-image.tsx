import { caseOg, caseParams } from '@/components/case-page';

export const alt = 'Case study by Eduardo Santarosa, full-stack developer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = caseParams('en');

export default async ({ params }: { params: Promise<{ slug: string }> }) => caseOg('en', (await params).slug);
