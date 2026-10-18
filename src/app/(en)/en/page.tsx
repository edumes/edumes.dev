import { setRequestLocale } from 'next-intl/server';
import { Home, homeMetadata } from '@/components/home';

export const generateMetadata = () => homeMetadata('en');

export default function Page() {
  setRequestLocale('en');
  return <Home />;
}
