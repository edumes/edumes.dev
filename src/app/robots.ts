import type { MetadataRoute } from 'next';
import { profile } from '@/content/site';

export const dynamic = 'force-static';

// Everything is public, AI crawlers included: assistants that recruiters ask should be able to read and cite the site.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${profile.url}/sitemap.xml` };
}
