import { RootLayout, metadataFor } from '@/components/root';

export const generateMetadata = () => metadataFor('en');

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout locale="en">{children}</RootLayout>;
}
