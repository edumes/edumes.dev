import { setRequestLocale } from 'next-intl/server';
import { BlogIndex, blogMetadata } from '@/components/blog-page';

export const generateMetadata = () => blogMetadata('en');

export default function Page() {
  setRequestLocale('en');
  return <BlogIndex />;
}
