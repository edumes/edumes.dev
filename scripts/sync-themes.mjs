// Builds src/themes/presets.json from the AuthSales boilerplate presets plus the site's own overrides
// (src/themes/overrides.mjs). Run with Node 23+ (native TypeScript stripping): npm run sync:themes
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import overrides from '../src/themes/overrides.mjs';

const root = process.env.BOILERPLATE_ROOT ?? path.resolve(import.meta.dirname, '../../boilerplate');
const presetDir = path.join(root, 'frontend/src/utils/theme-presets');
const out = path.resolve(import.meta.dirname, '../src/themes/presets.json');

// Menu order, grouped by feel. First entry is the site default.
const CURATED = [
  'midnight-glass', 'tiesen', 'vercel', 'black', 'mono', 'graphite', 'nordic-dragon-wiki', 'platinum-ui',
  'blue', 'clean-slate', 'modern-minimal', 'tokyo-night', 'sector-command', 'advanced-circuit-wiki', 'medical-clean', 'twitter', 'vs-code',
  'violet-bloom', 'bold-tech', 'catppuccin', 'slack', 'vescrow',
  'northern-lights', 'nature', 'light-green', 'designbyte', 'rewaff', 'spotify', 'terminal',
  'tangerine', 'amber-minimal', 'claude', 'factory-wiki', 'oil-refining-wiki', 'elegant-luxury', 'corporate-boringcore'
];
// Only what the site reads: every key is inlined into each page by the theme script.
const KEYS = [
  'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
  'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
  'destructive', 'border', 'ring', 'radius'
];
// Site-only tokens. Every preset carries all of them, so switching presets never leaves a stale inline var behind.
const DEFAULTS = {
  'font-display': 'var(--font-mona)',
  'display-weight': '640',
  stretch: '1',
  tracking: '1',
  'display-case': 'none',
  'glow-opacity': '0.75'
};

const pick = (styles) => Object.fromEntries(KEYS.filter((k) => styles[k]).map((k) => [k, styles[k]]));
const shadow = (s) =>
  s['shadow-color']
    ? `${s['shadow-offset-x'] ?? '0px'} ${s['shadow-offset-y'] ?? '8px'} ${s['shadow-blur'] ?? '24px'} ${s['shadow-spread'] ?? '0px'} ` +
      `color-mix(in srgb, ${s['shadow-color']} ${Math.round(parseFloat(s['shadow-opacity'] ?? '0.1') * 100)}%, transparent)`
    : '0 12px 32px -12px rgb(0 0 0 / 0.18)';

function build(styles, o = {}) {
  const t = { ...pick(styles), shadow: shadow(styles), ...DEFAULTS, ...o };
  // Unless the override set them: links follow the final primary; the glow keeps the preset's own (often brighter)
  // colors, so darkening primary for contrast doesn't dull the hero.
  t.link ??= t.primary;
  t['glow-1'] ??= styles.primary;
  t['glow-2'] ??= styles['chart-2'];
  return t;
}

const presets = {};
for (const name of CURATED) {
  const mod = await import(pathToFileURL(path.join(presetDir, `${name}.ts`)).href);
  const preset = Object.values(mod)[0];
  const o = overrides[name] ?? {};
  // Same inheritance as the boilerplate: dark falls back to light.
  presets[name] = {
    label: o.label ?? preset.label,
    light: build(preset.styles.light, { ...o.all, ...o.light }),
    dark: build({ ...preset.styles.light, ...preset.styles.dark }, { ...o.all, ...o.dark })
  };
}

await fs.mkdir(path.dirname(out), { recursive: true });
await fs.writeFile(out, JSON.stringify(presets, null, 2) + '\n');
console.log(`Synced ${CURATED.length} presets → ${path.relative(process.cwd(), out)}`);
