import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { profile } from '@/content/site';
import type { Locale } from '@/i18n/config';
import presets from '@/themes/presets.json';

// The share image (Open Graph) every page renders at build time: the default theme, dark, in Mona Sans like the site.
// Route files declare size/contentType/alt themselves, since Next reads those exports statically.
const c = presets['midnight-glass'].dark;
const font = (file: string) => readFile(path.join(process.cwd(), 'src/assets', file));
const homeStack = ['Node.js', 'TypeScript', 'React', 'Next.js', 'Python', 'PostgreSQL'];

export async function ogImage(locale: Locale, { eyebrow, title, tags = homeStack }: { eyebrow?: string; title?: string; tags?: string[] } = {}) {
  const t = await getTranslations({ locale, namespace: 'meta' });
  const heading = title ?? profile.name;
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: 72,
          fontFamily: 'Mona Sans',
          color: c.foreground,
          backgroundColor: c.background,
          backgroundImage: `radial-gradient(70% 90% at 100% 0%, ${c['glow-1']}55, transparent 70%), radial-gradient(50% 70% at 85% 10%, ${c['glow-2']}33, transparent 70%)`
        }}
      >
        <div style={{ display: 'flex', fontSize: 30, color: c['muted-foreground'] }}>{eyebrow ?? t('role')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          <div style={{ display: 'flex', maxWidth: 1000, fontSize: heading.length > 48 ? 64 : 84, fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.025em' }}>
            {heading}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {tags.slice(0, 6).map((s) => (
              <div key={s} style={{ display: 'flex', padding: '8px 18px', borderRadius: 10, fontSize: 24, color: c['secondary-foreground'], backgroundColor: c.secondary }}>
                {s}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 28, fontSize: 28, borderTop: `2px solid ${c.border}` }}>
          <span>{title ? `${profile.name} · ${t('role')}` : profile.fullName}</span>
          <span style={{ color: c.primary }}>{profile.url.replace('https://', '')}</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Mona Sans', data: await font('MonaSans-Regular.ttf'), weight: 400 },
        { name: 'Mona Sans', data: await font('MonaSans-SemiBold.ttf'), weight: 600 }
      ]
    }
  );
}

// Favicon and touch icon: a lowercase "e" on the theme's glow gradient. Google wants a square, multiple of 48px.
export async function iconImage(size: number) {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          borderRadius: size * 0.22,
          paddingBottom: size * 0.08,
          fontFamily: 'Mona Sans',
          fontSize: size * 0.8,
          fontWeight: 600,
          color: c.background,
          backgroundImage: `linear-gradient(135deg, ${c['glow-1']}, ${c['glow-2']})`
        }}
      >
        e
      </div>
    ),
    { width: size, height: size, fonts: [{ name: 'Mona Sans', data: await font('MonaSans-SemiBold.ttf'), weight: 600 }] }
  );
}
