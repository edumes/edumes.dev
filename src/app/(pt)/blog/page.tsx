import { setRequestLocale } from 'next-intl/server';
import { BlogIndex, blogMetadata } from '@/components/blog-page';

export const generateMetadata = () => blogMetadata('pt');

export default function Page() {
  setRequestLocale('pt');
  return <BlogIndex />;
}
