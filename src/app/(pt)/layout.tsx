import { RootLayout, metadataFor } from '@/components/root';

export const generateMetadata = () => metadataFor('pt');

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout locale="pt">{children}</RootLayout>;
}
