import { setRequestLocale } from 'next-intl/server';
import { CvPage, cvMetadata } from '@/components/cv-page';

export const generateMetadata = () => cvMetadata('en');

export default function Page() {
  setRequestLocale('en');
  return <CvPage />;
}
