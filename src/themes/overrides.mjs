// The site's own take on each boilerplate preset, merged by scripts/sync-themes.mjs (the boilerplate stays untouched).
// `all` applies to both modes, then `light`/`dark`. Besides the shadcn tokens, a preset can set:
//   font-display    heading font (a next/font variable from src/components/root.tsx)
//   display-weight  weight of .type-display; titles and headings step down 20 each
//   stretch         multiplier on the width axis (Mona Sans only): <1 condenses
//   tracking        multiplier on the headings' negative letter-spacing (0 = none)
//   display-case    text-transform for headings
//   link            text color for links (defaults to primary; set it when primary is too light to read)
//   glow-1, glow-2, glow-opacity   hero gradient colors and strength (default primary, chart-2, 0.75)
//   shadow          box-shadow for raised surfaces (default comes from the preset's shadow-* fields)
// After editing: npm run sync:themes && npm run check:themes

const mona = 'var(--font-mona)';
const geist = 'var(--font-geist)';
const geistMono = 'var(--font-geist-mono)';
const jetbrains = 'var(--font-jetbrains)';
const vt323 = 'var(--font-vt323)';
const space = 'var(--font-space)';
const jakarta = 'var(--font-jakarta)';
const montserrat = 'var(--font-montserrat)';
const barlow = 'var(--font-barlow)';
const sourceSerif = 'var(--font-source-serif)';
const cormorant = 'var(--font-cormorant)';
const fraunces = 'var(--font-fraunces)';
const bricolage = 'var(--font-bricolage)';
const nunito = 'var(--font-nunito)';
const manrope = 'var(--font-manrope)';
const plex = 'var(--font-plex)';

export default {
  // Default. The boilerplate's "light" is also dark, so light mode is a daylight version of the same glass.
  'midnight-glass': {
    all: { 'font-display': mona, radius: '1rem' },
    light: {
      background: '#f3f6fb', foreground: '#0b1526', card: '#ffffff', 'card-foreground': '#0b1526',
      popover: '#ffffff', 'popover-foreground': '#0b1526', primary: '#1f6fd6', 'primary-foreground': '#ffffff',
      secondary: '#e4ebf5', 'secondary-foreground': '#1b2a44', muted: '#e9eef6', 'muted-foreground': '#4d5d75',
      destructive: '#d63a5a', border: '#d3dce9', ring: '#3b8cf0', 'glow-2': '#7dd3fc', 'glow-opacity': '0.7',
      shadow: '0px 14px 24px -10px color-mix(in srgb, hsl(213 90% 45%) 14%, transparent)'
    }
  },
  tiesen: {},
  vercel: {
    label: 'Ink',
    all: { 'font-display': geist, 'display-weight': '600', tracking: '1.15', 'glow-opacity': '0.45' },
    light: { 'glow-1': '#2d62ef', 'glow-2': '#d946ef' },
    dark: { 'glow-1': '#2671f4', 'glow-2': '#c026d3' }
  },
  black: {
    all: { 'font-display': nunito, 'display-weight': '800', tracking: '0.8', 'glow-1': '#3a58f6', 'glow-2': '#8b9cf8', 'glow-opacity': '0.4' },
    dark: { border: '#222222' }
  },
  mono: {
    all: { 'font-display': geistMono, 'display-weight': '500', tracking: '0.4', 'glow-opacity': '0.3' },
    dark: { link: '#8c8c8c' }
  },
  graphite: {
    all: { 'font-display': montserrat, 'display-weight': '700', tracking: '0.7', 'glow-opacity': '0.45' },
    dark: { 'muted-foreground': '#969696' }
  },
  'nordic-dragon-wiki': {
    label: 'Nordic',
    all: { 'font-display': mona, stretch: '0.68', 'display-weight': '620', tracking: '0.4', 'glow-opacity': '0.55' },
    light: { 'muted-foreground': '#55616a' }
  },
  'platinum-ui': {
    all: { 'font-display': jakarta, 'display-weight': '700', tracking: '0.9' },
    light: { 'muted-foreground': '#5c6b7d' }
  },
  blue: {
    all: { 'glow-2': '#38bdf8' }
  },
  'clean-slate': {
    light: { primary: '#5a5ce6' }
  },
  'modern-minimal': {
    light: { primary: '#2a6fe0' },
    dark: { primary: '#2a6fe0', link: '#4f93ff' }
  },
  'tokyo-night': {
    all: { 'font-display': plex, 'display-weight': '600', tracking: '0.8' },
    light: { primary: '#3c66da' },
    dark: { 'muted-foreground': '#8891b1' }
  },
  'sector-command': {
    all: { 'font-display': space, 'display-weight': '600', tracking: '0.8' },
    light: { primary: '#00749e', 'muted-foreground': '#566882' }
  },
  'advanced-circuit-wiki': {
    label: 'Circuit',
    all: { 'font-display': barlow, 'display-weight': '600', tracking: '0.2', 'display-case': 'uppercase', 'glow-2': '#f08a18' },
    light: { link: '#0068a6' },
    dark: { primary: '#0074b8', link: '#3194d9' }
  },
  'medical-clean': {
    all: { 'font-display': manrope, 'display-weight': '700', tracking: '0.9' }
  },
  twitter: {
    label: 'Cerulean',
    all: { 'font-display': geist, 'display-weight': '700', tracking: '1' },
    light: { primary: '#0072c2' },
    dark: { primary: '#0076c7', link: '#1c9cf0', 'muted-foreground': '#82868b' }
  },
  'vs-code': {
    label: 'Editor',
    all: { 'font-display': jetbrains, 'display-weight': '600', tracking: '0.3' },
    light: { primary: '#006aad' },
    dark: { 'primary-foreground': '#04121c', 'muted-foreground': '#8c93a7' }
  },
  'violet-bloom': {
    all: { 'font-display': jakarta, 'display-weight': '700', tracking: '0.9', 'glow-2': '#f472b6' },
    dark: { primary: '#7c4cf0', link: '#a37eff' }
  },
  'bold-tech': {
    all: { 'font-display': mona, 'display-weight': '800', tracking: '1', primary: '#7d4de8' },
    dark: { link: '#a280ff' }
  },
  catppuccin: {
    all: { 'font-display': montserrat, 'display-weight': '700', tracking: '0.7' },
    light: { 'muted-foreground': '#5b5e73' }
  },
  slack: {
    label: 'Aubergine',
    all: { 'font-display': bricolage, 'display-weight': '700', tracking: '0.8', 'glow-2': '#36c5f0' },
    dark: { link: '#c67fc6' }
  },
  vescrow: {
    all: { 'font-display': bricolage, 'display-weight': '700', tracking: '0.8' },
    // The boilerplate's dark primary is navy on near-black: the main button disappeared.
    dark: { primary: '#3b5bdb', link: '#7290f5', 'glow-1': '#3b5bdb' }
  },
  'northern-lights': {
    all: { 'font-display': jakarta, 'display-weight': '700', tracking: '0.9' },
    // Secondary was a saturated blue under white text (the stack chips); now a quiet tint.
    light: { primary: '#00853a', secondary: '#e7eefb', 'secondary-foreground': '#24427a' },
    dark: { 'primary-foreground': '#07170d', link: '#47ba6a', secondary: '#2b3a52', 'secondary-foreground': '#d3dff3' }
  },
  nature: {
    all: { 'font-display': fraunces, 'display-weight': '600', tracking: '0.5' },
    dark: { link: '#5fbd62' }
  },
  'light-green': {
    // Lime stays the fill (with dark text); links get a readable green.
    light: { link: '#457e00', 'glow-2': '#38bdf8' }
  },
  designbyte: {
    all: { 'font-display': jakarta, 'display-weight': '800', tracking: '0.9' },
    light: { link: '#008344', border: '#e0e3e6' }
  },
  rewaff: {
    all: { 'font-display': space, 'display-weight': '700', tracking: '0.8' },
    light: { primary: '#008219' }
  },
  spotify: {
    label: 'Vinyl',
    all: { 'font-display': manrope, 'display-weight': '800', tracking: '1' },
    light: { primary: '#008236' }
  },
  // The boilerplate's "light" is also black, so light mode is green ink on phosphor paper.
  terminal: {
    all: { 'font-display': vt323, 'display-weight': '400', tracking: '0', 'glow-opacity': '0.45' },
    light: {
      background: '#f1f5ec', foreground: '#0b3315', card: '#f8fbf5', 'card-foreground': '#0b3315',
      popover: '#f8fbf5', 'popover-foreground': '#0b3315', primary: '#0b7a2c', 'primary-foreground': '#f1f5ec',
      secondary: '#e1eadb', 'secondary-foreground': '#0b3315', muted: '#e6eee1', 'muted-foreground': '#3d6146',
      border: '#bfd2bd', ring: '#0b7a2c', 'glow-1': '#16a34a', 'glow-2': '#86efac'
    }
  },
  tangerine: {
    // The boilerplate's light page was a mid gray that sank muted text and the orange.
    light: { background: '#f5f6f7', border: '#dcdfe3', primary: '#c4461f', 'muted-foreground': '#5f6673' },
    dark: { 'primary-foreground': '#1c120e', link: '#f7724d' }
  },
  'amber-minimal': {
    light: { link: '#b05e00' }
  },
  claude: {
    label: 'Terracotta',
    all: { 'font-display': sourceSerif, 'display-weight': '500', tracking: '0.6' },
    light: { primary: '#b45232', 'muted-foreground': '#686762' },
    dark: { 'primary-foreground': '#1f1410' }
  },
  'factory-wiki': {
    label: 'Factory',
    all: { 'font-display': barlow, 'display-weight': '700', tracking: '0.2', 'display-case': 'uppercase' },
    light: { primary: '#9c4a05' }
  },
  'oil-refining-wiki': {
    label: 'Refinery',
    all: { 'font-display': barlow, 'display-weight': '600', tracking: '0.2' },
    light: { primary: '#a84d00', 'muted-foreground': '#556461' }
  },
  'elegant-luxury': {
    all: { 'font-display': cormorant, 'display-weight': '600', tracking: '0.3' },
    light: { border: '#eadbc3' },
    dark: { link: '#f26b5f' }
  },
  'corporate-boringcore': {
    all: { 'font-display': `Tahoma, Verdana, ${mona}`, 'display-weight': '700', tracking: '0' }
  }
};
