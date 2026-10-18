import type { Metadata } from 'next';
import {
  Barlow_Condensed,
  Bricolage_Grotesque,
  Cormorant_Garamond,
  Fraunces,
  Geist,
  Geist_Mono,
  IBM_Plex_Sans,
  JetBrains_Mono,
  Manrope,
  Mona_Sans,
  Montserrat,
  Nunito,
  Plus_Jakarta_Sans,
  Source_Serif_4,
  Space_Grotesk,
  VT323
} from 'next/font/google';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Analytics } from '@vercel/analytics/next';
import { profile } from '@/content/site';
import { localeConfig, type Locale } from '@/i18n/config';
import { ThemeHead } from '@/themes/theme';
import '@/app/globals.css';

const mona = Mona_Sans({ subsets: ['latin'], axes: ['wdth'], variable: '--font-mona', display: 'swap' });
// Heading fonts of the theme presets (src/themes/overrides.mjs). Not preloaded: the browser only fetches the one the
// active preset uses, or all of them while the theme menu shows its previews. next/font wants literal options per call.
const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap', preload: false });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap', preload: false });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap', preload: false });
const vt323 = VT323({ subsets: ['latin'], weight: '400', variable: '--font-vt323', display: 'swap', preload: false });
const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-space', display: 'swap', preload: false });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap', preload: false });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap', preload: false });
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-barlow', display: 'swap', preload: false });
const sourceSerif = Source_Serif_4({ subsets: ['latin'], variable: '--font-source-serif', display: 'swap', preload: false });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-cormorant', display: 'swap', preload: false });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap', preload: false });
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', display: 'swap', preload: false });
const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito', display: 'swap', preload: false });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap', preload: false });
const plex = IBM_Plex_Sans({ subsets: ['latin'], variable: '--font-plex', display: 'swap', preload: false });
const fontVars = [mona, geist, geistMono, jetbrains, vt323, space, jakarta, montserrat, barlow, sourceSerif, cormorant, fraunces, bricolage, nunito, manrope, plex].map((f) => f.variable).join(' ');

// Defaults for every page in the locale; each page sets its own title, canonical and share data (components/seo.tsx).
export async function metadataFor(locale: Locale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('title'),
    description: t('description'),
    metadataBase: new URL(profile.url),
    authors: [{ name: profile.name, url: profile.url }],
    creator: profile.name
  };
}

export function RootLayout({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  setRequestLocale(locale);
  // Client components only read these namespaces; the rest stays on the server instead of in every page's payload.
  const { ui, nav, hero, trace, cases } = useMessages();
  return (
    <html lang={localeConfig[locale].tag} className={fontVars} suppressHydrationWarning>
      <head>
        <ThemeHead />
        {/* First visit to the PT home from a non-Portuguese browser goes to /en/. A saved choice wins; crawlers stay. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(location.pathname==='${localeConfig.pt.home}'&&!localStorage.getItem('edumes:lang')&&!/^pt/i.test(navigator.language)&&!/bot|crawl|spider|slurp/i.test(navigator.userAgent))location.replace('${localeConfig.en.home}'+location.hash)}catch(e){}`
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={{ ui, nav, hero, trace, cases }}>{children}</NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
