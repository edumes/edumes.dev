import { setRequestLocale } from 'next-intl/server';
import { CvPage, cvMetadata } from '@/components/cv-page';

export const generateMetadata = () => cvMetadata('pt');

export default function Page() {
  setRequestLocale('pt');
  return <CvPage />;
}
