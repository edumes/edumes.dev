import { setRequestLocale } from 'next-intl/server';
import { CasePage, caseMetadata, caseParams } from '@/components/case-page';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = caseParams('pt');
export const generateMetadata = async ({ params }: Props) => caseMetadata('pt', (await params).slug);

export default async function Page({ params }: Props) {
  setRequestLocale('pt');
  return <CasePage slug={(await params).slug} />;
}
