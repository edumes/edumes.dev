// WCAG contrast check for every preset/mode in src/themes/presets.json. Exits 1 on any failure.
// Run after editing overrides: npm run sync:themes && npm run check:themes
import presets from '../src/themes/presets.json' with { type: 'json' };

const gamma = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
const linear = (x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
const alpha = (s) => (s == null ? 1 : s.endsWith('%') ? parseFloat(s) / 100 : parseFloat(s));

// sRGB [r, g, b, a] in 0..1 from the formats the presets use: hex, oklch, hsl, rgb.
function parse(c) {
  let m;
  if ((m = c.match(/^#([0-9a-f]{3,8})$/i))) {
    const h = m[1].length <= 4 ? [...m[1]].map((x) => x + x).join('') : m[1];
    const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
    return [n(0), n(2), n(4), h.length === 8 ? n(6) : 1];
  }
  if ((m = c.match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)$/i))) {
    const L = +m[1] / (m[2] ? 100 : 1), h = (+m[4] * Math.PI) / 180, A = +m[3] * Math.cos(h), B = +m[3] * Math.sin(h);
    const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
    const M = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
    const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
    const rgb = [4.0767416621 * l - 3.3077115913 * M + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * M - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * M + 1.707614701 * s];
    return [...rgb.map((v) => Math.min(1, Math.max(0, gamma(v)))), alpha(m[5])];
  }
  if ((m = c.match(/^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%\s*(?:[/,]\s*([\d.]+%?))?\s*\)$/i))) {
    const h = +m[1] / 360, s = +m[2] / 100, l = +m[3] / 100, q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = (t) => ((t = ((t % 1) + 1) % 1), t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p);
    return [f(h + 1 / 3), f(h), f(h - 1 / 3), alpha(m[4])];
  }
  if ((m = c.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[/,]\s*([\d.]+%?))?\s*\)$/i)))
    return [m[1] / 255, m[2] / 255, m[3] / 255, alpha(m[4])];
  throw new Error(`Unsupported color: ${c}`);
}

const over = (fg, bg) => [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3])).concat(1);
const lum = (c) => 0.2126 * linear(c[0]) + 0.7152 * linear(c[1]) + 0.0722 * linear(c[2]);
const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);

// [text, surface, minimum]. Text is AA (4.5); the border only has to be visible against the page.
const PAIRS = [
  ['foreground', 'background', 4.5],
  ['card-foreground', 'card', 4.5],
  ['popover-foreground', 'popover', 4.5],
  ['muted-foreground', 'background', 4.5],
  ['muted-foreground', 'card', 4.5],
  ['secondary-foreground', 'secondary', 4.5],
  ['primary-foreground', 'primary', 4.5],
  ['link', 'background', 4.5],
  ['link', 'card', 4.5],
  ['border', 'background', 1.15]
];

let failures = 0;
for (const [name, preset] of Object.entries(presets)) {
  for (const mode of ['light', 'dark']) {
    const t = preset[mode];
    const page = parse(t.background);
    const surface = (k) => (k === 'background' ? page : over(parse(t[k]), page));
    for (const [fg, bg, min] of PAIRS) {
      const base = surface(bg);
      const r = ratio(over(parse(t[fg]), base), base);
      if (r < min) {
        failures++;
        console.log(`${name} ${mode}: ${fg} on ${bg} = ${r.toFixed(2)} (min ${min})`);
      }
    }
  }
}
console.log(failures ? `\n${failures} contrast failures` : `All ${Object.keys(presets).length} presets pass.`);
process.exit(failures ? 1 : 0);
