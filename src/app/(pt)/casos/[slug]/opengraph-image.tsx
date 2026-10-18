import { caseOg, caseParams } from '@/components/case-page';

export const alt = 'Estudo de caso de Eduardo Santarosa, desenvolvedor full stack';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const generateStaticParams = caseParams('pt');

export default async ({ params }: { params: Promise<{ slug: string }> }) => caseOg('pt', (await params).slug);
