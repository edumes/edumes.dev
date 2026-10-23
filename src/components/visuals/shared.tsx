'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useInView } from 'motion/react';
import { defineCopy } from '@/i18n/copy';
import { Icon, type IconName } from '../icon';

const motionPreference = '(prefers-reduced-motion: reduce)';
const reducedMotion = () => matchMedia(motionPreference).matches;
const serverMotion = () => false;
function subscribeMotion(listener: () => void) {
  const query = matchMedia(motionPreference);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}

// Steps a looping timeline (one duration in ms per step; keep it a module constant) while its element is on screen,
// and pauses off screen. Before it is first seen, and always under reduced motion, it holds `still`: the complete
// picture, so the server render and calm viewers get the whole story in one frame. `enabled` pauses the timeline;
// `on` turns true once it plays.
export function useLoop(durations: number[], still = durations.length - 1, enabled = true) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const calm = useSyncExternalStore(subscribeMotion, reducedMotion, serverMotion);
  const [step, setStep] = useState(still);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!inView || calm || !enabled) return;
    if (!on) {
      setOn(true);
      return setStep(0);
    }
    const id = setTimeout(() => setStep((s) => (s + 1) % durations.length), durations[step]);
    return () => clearTimeout(id);
  }, [inView, calm, enabled, on, step, durations]);

  return { ref, step: calm ? still : step, on, inView };
}

// Several scenarios played one after another, each a list of [phase, ms]. A phase number means the same moment in
// every scenario, so a scenario can skip the phases it never reaches.
export function scenarios(list: [number, number][][]) {
  return {
    steps: list.flatMap((phases, s) => phases.map(([p]) => ({ s, p }))),
    durations: list.flatMap((phases) => phases.map(([, ms]) => ms)),
    totals: list.map((phases) => phases.reduce((a, [, ms]) => a + ms, 0))
  };
}

export const glow = '0 0 8px var(--glow-1)';
export const skeleton = 'border-transparent bg-foreground/[0.07] text-transparent';
export const row = 'morph flex items-center justify-between gap-3 rounded-sm border px-2.5 py-1.5 text-[0.8125rem]';
export const tone = {
  idle: 'border-border bg-background',
  ok: 'border-primary/50 bg-primary/10',
  bad: 'border-destructive/50 bg-destructive/10',
  warn: 'border-(--attention) bg-[color-mix(in_oklab,var(--attention)_12%,transparent)]'
};
export const delay = (on: boolean, ms: number) => ({ transitionDelay: on ? `${ms}ms` : '0ms' });

export type WireState = 'idle' | 'live' | 'done' | 'blocked';

// A connector between two boxes: vertical when narrow, horizontal from lg up (or, with `cq`, from the @xl container
// width up, for visuals that also live in narrow cards). It fills in once the data has passed, and a glowing dot runs
// along it while the data is on its way (`back` runs it the other way).
const AXIS = {
  lg: { wrap: 'lg:flex-row lg:px-1 lg:py-0', line: 'lg:h-px lg:w-7', origin: 'lg:origin-left', head: 'lg:-rotate-90' },
  cq: { wrap: '@xl:flex-row @xl:px-1 @xl:py-0', line: '@xl:h-px @xl:w-7', origin: '@xl:origin-left', head: '@xl:-rotate-90' }
};
export function Wire({ state, back, cq }: { state: WireState; back?: boolean; cq?: boolean }) {
  const a = AXIS[cq ? 'cq' : 'lg'];
  const fill = state === 'blocked' ? 'bg-destructive' : 'bg-primary';
  return (
    <div className={`flex shrink-0 flex-col items-center justify-center py-1 ${a.wrap}`} aria-hidden>
      <span className={`relative block h-6 w-px bg-border ${a.line}`}>
        <span className={`morph absolute inset-0 origin-top ${a.origin} ${fill}`} style={{ transform: state === 'idle' ? 'scale(0)' : 'none' }} />
        {state === 'live' && <span className={`wire-dot ${back ? '[animation-direction:reverse]' : ''}`} />}
      </span>
      <svg viewBox="0 0 10 6" className={`morph h-1.5 w-2.5 ${a.head} ${state === 'idle' ? 'text-border' : state === 'blocked' ? 'text-destructive' : 'text-primary'}`}>
        <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// A box in a flow. It glows while the data is in it, and its glyph plays as the data arrives.
export function Stage({ icon, title, active, className = '', children }: { icon: IconName; title: string; active: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={`morph rounded-md border border-border bg-card px-3 py-2.5 text-card-foreground ${active ? 'lit' : ''} ${className}`}>
      <p className="flex items-center gap-2 text-[0.8125rem] leading-tight font-semibold font-stretch-104%">
        <Icon name={icon} size={14} play={active} className="text-muted-foreground" />
        {title}
      </p>
      <div className="mt-2 text-xs/snug">{children}</div>
    </div>
  );
}

// The scenario names above a visual, with a bar filling under the one playing.
export function Tabs({ labels, s, total, on, inView }: { labels: string[]; s: number; total: number; on: boolean; inView: boolean }) {
  return (
    <ol className={`mb-5 grid gap-2 ${labels.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`} aria-hidden>
      {labels.map((label, k) => (
        <li key={label} className={`morph text-xs/tight sm:text-[0.8125rem] ${k === s ? 'text-foreground' : 'text-muted-foreground'}`}>
          <span className="mb-2 block h-0.5 overflow-hidden rounded-full bg-border">
            {k === s && (
              <span
                key={s}
                className="block h-full bg-primary"
                style={on ? { animation: `fill ${total}ms linear forwards`, animationPlayState: inView ? 'running' : 'paused' } : undefined}
              />
            )}
          </span>
          {label}
        </li>
      ))}
    </ol>
  );
}

// One trap of a case's problem, acted out on a loop of its own, with its verdict fading in at the end.
export function Trap({ ref, icon, title, verdict, shown, children }: { ref: React.Ref<HTMLDivElement>; icon: IconName; title: string; verdict: string; shown: boolean; children: React.ReactNode }) {
  return (
    <div ref={ref} className="flex flex-col rounded-lg border border-border bg-card p-4 text-card-foreground" data-icon-host>
      <p className="flex items-center gap-2 text-[0.9375rem] font-semibold font-stretch-104%">
        <Icon name={icon} size={16} className="text-muted-foreground" />
        {title}
      </p>
      <div className="mt-4 flex-1" aria-hidden>
        {children}
      </div>
      <p className="morph mt-4 flex items-start gap-2 text-[0.8125rem] leading-snug" style={{ opacity: shown ? 1 : 0 }}>
        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-(--attention)" />
        {verdict}
      </p>
    </div>
  );
}

export const Traps = ({ children }: { children: React.ReactNode }) => <div className="grid gap-4 md:grid-cols-3">{children}</div>;

// An outcome as before and after: the old way still and muted, the new one alive.
const useBeforeAfter = defineCopy({ pt: { before: 'Antes', after: 'Depois' }, en: { before: 'Before', after: 'After' } });
export function BeforeAfter({ label, before, after, lit, children }: { label: string; before: React.ReactNode; after: React.ReactNode; lit?: boolean; children?: React.ReactNode }) {
  const t = useBeforeAfter();
  return (
    <div role="img" aria-label={label}>
      <div className="flex flex-col lg:flex-row lg:items-stretch" aria-hidden>
        <div className="rounded-md border border-dashed border-border p-3 lg:flex-1">
          <p className="type-meta mb-3">{t.before}</p>
          <div className="opacity-75">{before}</div>
        </div>
        <Wire state="done" />
        <div className={`morph rounded-md border border-border bg-card p-3 text-card-foreground lg:flex-[1.3] ${lit ? 'lit' : ''}`}>
          <p className="type-meta mb-3">{t.after}</p>
          {after}
        </div>
      </div>
      {children}
    </div>
  );
}

// Timestamped lines that appear one by one, like a live log. `warn` lines take the attention color.
export function Log({ lines, shown }: { lines: [string, string, boolean?][]; shown: number }) {
  return (
    <ol className="grid gap-1 font-mono text-[0.6875rem] leading-snug sm:text-xs">
      {lines.map(([time, text, warn], k) => (
        <li
          key={k}
          className={`morph grid grid-cols-[3rem_minmax(0,1fr)] gap-2 ${k < shown ? '' : 'opacity-0'} ${warn ? 'text-(--attention)' : ''}`}
          style={{ transform: k < shown ? 'none' : 'translateY(4px)' }}
        >
          <span className="text-muted-foreground">{time}</span>
          {text}
        </li>
      ))}
    </ol>
  );
}

// A small static list for the "before" side: each line marked as a pain.
export function Pains({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-1.5 text-[0.8125rem]">
      {items.map((p) => (
        <li key={p} className="flex items-start gap-2">
          <span className="font-mono text-destructive">✗</span>
          {p}
        </li>
      ))}
    </ul>
  );
}

export function Phone({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`w-full max-w-60 rounded-[1.6rem] border border-border bg-background p-2 shadow-(--shadow) ${className}`}>
      <span className="mx-auto mb-2 block h-1 w-10 rounded-full bg-border" />
      <div className="rounded-[1.1rem] border border-border bg-card p-3 text-card-foreground">{children}</div>
    </div>
  );
}

// Window chrome for a made-up app or machine.
export function Window({ title, icon, lit, ghost, className = '', children }: { title: string; icon?: IconName; lit?: boolean; ghost?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={`morph rounded-md border p-2.5 text-card-foreground @md:p-3 ${ghost ? 'border-dashed border-border opacity-55' : 'border-border bg-card'} ${lit ? 'lit' : ''} ${className}`}>
      <p className="flex items-center gap-1.5 text-[0.6875rem] leading-tight font-semibold font-stretch-104% @xl:text-[0.8125rem]">
        <span className="mr-1 flex gap-1">
          {[0, 1, 2].map((d) => (
            <span key={d} className="size-1 rounded-full bg-border @md:size-1.5" />
          ))}
        </span>
        {icon && <Icon name={icon} size={14} play={lit} className="text-muted-foreground" />}
        {title}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
