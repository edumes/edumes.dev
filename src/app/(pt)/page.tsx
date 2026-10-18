import { setRequestLocale } from 'next-intl/server';
import { Home, homeMetadata } from '@/components/home';

export const generateMetadata = () => homeMetadata('pt');

export default function Page() {
  setRequestLocale('pt');
  return <Home />;
}
