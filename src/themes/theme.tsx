import presets from './presets.json';

export type Mode = 'light' | 'dark' | 'system';
export type PresetName = keyof typeof presets;
export const PRESETS = presets;
export const DEFAULT_PRESET = Object.keys(presets)[0] as PresetName;
export const THEME_KEY = 'edumes:theme';

const css = (vars: Record<string, string>) => Object.entries(vars).map(([k, v]) => `--${k}:${v}`).join(';');
const def = presets[DEFAULT_PRESET];

// Runs before first paint: applies the saved preset and mode, and exposes window.__theme for the menu.
const script = `(()=>{const P=${JSON.stringify(presets)},K='${THEME_KEY}',D='${DEFAULT_PRESET}',r=document.documentElement,m=matchMedia('(prefers-color-scheme: dark)');
function read(){try{return JSON.parse(localStorage.getItem(K))||{}}catch{return{}}}
function apply(s){const p=P[s.preset]?s.preset:D,mode=s.mode||'system',dark=mode==='dark'||(mode==='system'&&m.matches);
r.classList.toggle('dark',dark);r.style.colorScheme=dark?'dark':'light';r.dataset.preset=p;
for(const[k,v]of Object.entries(P[p][dark?'dark':'light']))r.style.setProperty('--'+k,v)}
let s=read();apply(s);m.addEventListener('change',()=>apply(read()));
window.__theme={get:read,set(n){s={...read(),...n};try{localStorage.setItem(K,JSON.stringify(s))}catch{}apply(s)}}})()`;

export function ThemeHead() {
  return (
    <>
      {/* No-JS fallback: the default preset, following the OS mode. */}
      <style>{`:root{${css(def.light)}}@media (prefers-color-scheme:dark){:root{${css(def.dark)}}}`}</style>
      <script dangerouslySetInnerHTML={{ __html: script }} />
    </>
  );
}

declare global {
  interface Window {
    __theme: {
      get(): { preset?: PresetName; mode?: Mode };
      set(next: { preset?: PresetName; mode?: Mode }): void;
    };
  }
}
