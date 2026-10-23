'use client';

import { useId } from 'react';
import { motion } from 'motion/react';
import { useLocale } from 'next-intl';
import { defineCopy } from '@/i18n/copy';
import type { Locale } from '@/i18n/config';
import { useLoop } from './shared';

// Small scenes for the personal projects on the home page. Each one loops on its own while visible.

const useCopy = defineCopy({
  pt: {
    // One per position in NOTE_AT.
    loreForge: { notes: ['Valen', 'A Torre', 'Iria', 'Missão 3', 'Mapa'] },
    lyricType: { playing: 'tocando agora', accuracy: 'precisão 98%', wpm: 'ppm' },
    myGarden: { title: 'Meu jardim', ready: (n: number) => `${n} prontas para colher` },
    document: { file: 'contrato.pdf · p. 2', question: 'Qual o prazo de pagamento?', answer: '30 dias após a entrega.' },
    ytRadio: { live: 'AO VIVO', cycle: (n: number) => `ciclo ${n} de 8, sem repetir` },
    segmentor: { source: 'podcast.mp4 · um quadro por minuto' }
  },
  en: {
    loreForge: { notes: ['Valen', 'The Tower', 'Iria', 'Quest 3', 'Map'] },
    lyricType: { playing: 'now playing', accuracy: 'accuracy 98%', wpm: 'wpm' },
    myGarden: { title: 'My garden', ready: (n) => `${n} ready to harvest` },
    document: { file: 'contract.pdf · p. 2', question: "What's the payment term?", answer: '30 days after delivery.' },
    ytRadio: { live: 'LIVE', cycle: (n) => `cycle ${n} of 8, no repeats` },
    segmentor: { source: 'podcast.mp4 · one frame per minute' }
  }
});

type Scene = () => React.ReactElement;
const box = 'h-full rounded-md border border-border bg-card p-3 text-card-foreground';

// A Markdown vault turned into a graph of linked notes, one link lighting up at a time.
const NOTE_AT: [number, number][] = [[18, 30], [52, 18], [82, 38], [60, 72], [24, 76]];
const LINKS = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [1, 3]];
const LORE = [900, 900, 900, 900, 900, 900];
function LoreForge() {
  const t = useCopy().loreForge;
  const { ref, step } = useLoop(LORE, 0);
  const notes = NOTE_AT.map(([x, y], k) => [t.notes[k], x, y] as const);
  const [a, b] = LINKS[step];
  return (
    <div ref={ref} className={`${box} relative`}>
      <p className="relative z-10 font-mono text-[0.625rem] text-muted-foreground">vault/*.md</p>
      <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {LINKS.map(([i, j], k) => (
          <line
            key={k}
            x1={notes[i][1]}
            y1={notes[i][2]}
            x2={notes[j][1]}
            y2={notes[j][2]}
            vectorEffect="non-scaling-stroke"
            className={`morph ${k === step ? 'stroke-primary' : 'stroke-border'}`}
            strokeWidth={k === step ? 2 : 1}
          />
        ))}
      </svg>
      {notes.map(([n, x, y], k) => (
        <span
          key={n}
          className={`morph absolute -translate-1/2 rounded-sm border px-1.5 py-0.5 text-[0.625rem] whitespace-nowrap ${k === a || k === b ? 'lit border-primary/60 bg-card' : 'border-border bg-background'}`}
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          [[{n}]]
        </span>
      ))}
    </div>
  );
}

// Typing along with a made-up lyric line while the song plays. The line's length sets the loop's timing at module
// level, so it stays out of the copy.
const LYRIC: Record<Locale, string> = { pt: 'acendo as luzes da cidade', en: 'city lights are coming on' };
const TYPE = [600, ...[...LYRIC.pt].map(() => 90), 2000];
const SONG_MS = TYPE.slice(1).reduce((a, b) => a + b);
function LyricType() {
  const t = useCopy().lyricType;
  const { ref, step, on } = useLoop(TYPE);
  const line = LYRIC[useLocale()];
  const typed = Math.min(step, line.length);
  return (
    <div ref={ref} className={`${box} flex flex-col justify-between`}>
      <p className="flex items-center gap-2 text-[0.6875rem] text-muted-foreground">
        <span>♪ {t.playing}</span>
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-border">
          <span key={on && step > 0 ? 'play' : 'rest'} className="block h-full bg-primary" style={!on ? undefined : step === 0 ? { width: 0 } : { animation: `fill ${SONG_MS}ms linear forwards` }} />
        </span>
      </p>
      <p className="font-mono text-base/snug tracking-tight">
        <span>{line.slice(0, typed)}</span>
        <span className="inline-block h-[1.1em] w-px translate-y-[0.15em] bg-primary motion-safe:animate-pulse" />
        <span className="text-muted-foreground/60">{line.slice(typed)}</span>
      </p>
      <p className="flex justify-between text-[0.6875rem] text-muted-foreground">
        <span>{t.accuracy}</span>
        <span className="tabular-nums">{typed === line.length ? '72' : '—'} {t.wpm}</span>
      </p>
    </div>
  );
}

// Plots growing from seed to flower, each at its own pace, and the harvest paying out.
const GROW = [800, 800, 800, 1300];
function Plant({ stage }: { stage: number }) {
  return (
    <svg viewBox="0 0 20 24" className="size-full" aria-hidden>
      <ellipse cx="10" cy="21" rx="8" ry="2.5" className="fill-muted-foreground/25" />
      <g className="morph origin-bottom" style={{ transform: `scale(${[0.001, 0.45, 0.8, 1][stage]})`, transformOrigin: '10px 21px' }}>
        <path d="M10 21V9" className="stroke-primary" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M10 15c-3 0-5-2-5-4 3 0 5 2 5 4zM10 13c3 0 5-2 5-4-3 0-5 2-5 4z" className="fill-primary/60" />
        {stage === 3 && <circle cx="10" cy="7" r="3" className="fill-(--attention)" />}
      </g>
    </svg>
  );
}
function MyGarden() {
  const t = useCopy().myGarden;
  const { ref, step } = useLoop(GROW);
  const ready = [0, 1, 2, 3, 4, 5, 6, 7].filter((k) => (step + k) % 4 === 3).length;
  return (
    <div ref={ref} className={`${box} flex flex-col`}>
      <p className="flex justify-between text-[0.6875rem] text-muted-foreground">
        <span>{t.title}</span>
        <span className={`morph ${ready ? 'text-foreground' : ''}`}>{t.ready(ready)}</span>
      </p>
      <ul className="mt-2 grid min-h-0 flex-1 grid-cols-4 grid-rows-2 gap-1.5">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
          const stage = (step + k) % 4;
          return (
            <li key={k} className={`morph min-h-0 rounded-sm border p-1 ${stage === 3 ? 'border-(--attention)' : 'border-border bg-background'}`}>
              <Plant stage={stage} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// OCR over a page, a question, and an answer that points back to the line it came from.
const DOC = [500, 1000, 700, 900, 2600];
function DocumentAssistant() {
  const t = useCopy().document;
  const { ref, step } = useLoop(DOC);
  const widths = ['w-4/5', 'w-3/5', 'w-11/12', 'w-2/3', 'w-4/5', 'w-1/2'];
  return (
    <div ref={ref} className={`${box} grid grid-cols-[2fr_3fr] gap-3`}>
      <div className="relative overflow-hidden rounded-sm border border-border bg-background p-2">
        <p className="text-[0.5625rem] text-muted-foreground">{t.file}</p>
        <div className="mt-1.5 grid gap-1.5">
          {widths.map((w, k) => (
            <span key={k} className={`morph block h-1.5 rounded-full ${w} ${k === 3 && step >= 3 ? 'bg-(--attention) shadow-[0_0_8px_var(--attention)]' : 'bg-border'}`} />
          ))}
        </div>
        {step === 1 && <span className="laser" style={{ background: 'var(--primary)', boxShadow: '0 0 8px 1px var(--glow-1)', animationDuration: '1000ms' }} />}
      </div>
      <div className="flex flex-col justify-end gap-1.5 text-[0.6875rem] leading-snug">
        <p className={`morph ml-auto max-w-[95%] rounded-md rounded-br-none bg-primary px-2 py-1 text-primary-foreground ${step >= 2 ? '' : 'opacity-0'}`}>{t.question}</p>
        <p className={`morph max-w-[95%] rounded-md rounded-bl-none border border-border bg-background px-2 py-1 ${step >= 3 ? '' : 'opacity-0'}`} style={{ transform: step >= 3 ? 'none' : 'translateY(4px)' }}>
          {t.answer} <span className="text-(--attention)">[p. 2]</span>
        </p>
      </div>
    </div>
  );
}

// A live stream walking a shuffled folder of clips, never repeating one until the cycle closes.
const ORDER = [5, 2, 7, 1, 8, 3, 6, 4];
const RADIO = ORDER.map(() => 1300);
function YtRadio() {
  const t = useCopy().ytRadio;
  const { ref, step, on } = useLoop(RADIO, 2);
  const id = useId();
  const clip = (n: number) => `clip-${String(n).padStart(2, '0')}.mp4`;
  const next = [1, 2, 3].map((k) => ORDER[(step + k) % ORDER.length]);
  return (
    <div ref={ref} className={`${box} flex flex-col gap-2`}>
      <p className="flex items-center justify-between text-[0.6875rem]">
        <span className="flex items-center gap-1.5 rounded-sm bg-destructive/15 px-1.5 py-0.5 font-semibold">
          <span className="size-1.5 rounded-full bg-destructive motion-safe:animate-pulse" />
          {t.live}
        </span>
        <span className="text-muted-foreground tabular-nums">{t.cycle(step + 1)}</span>
      </p>
      <div className="rounded-sm border border-primary/50 bg-primary/10 px-2 py-1.5">
        <p className="font-mono text-xs">{clip(ORDER[step])}</p>
        <span className="mt-1 block h-1 overflow-hidden rounded-full bg-border">
          <span key={step} className="block h-full bg-primary" style={on ? { animation: `fill ${RADIO[0]}ms linear forwards` } : undefined} />
        </span>
      </div>
      <ul className="grid gap-1">
        {next.map((n) => (
          <motion.li key={n} layoutId={id + n} transition={{ type: 'spring', bounce: 0, duration: 0.5 }} className="rounded-sm border border-border bg-background px-2 py-0.5 font-mono text-[0.625rem] text-muted-foreground">
            {clip(n)}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

// One frame per minute of a long video, two minutes picked (one wide, one cropped to 9:16 around the center), then
// ffmpeg cutting each into its own file, named the way the app names them.
const CUT = [600, 800, 800, 1100, 1100, 2200];
const PICKS = [
  { minute: 1, vertical: false, at: 1 },
  { minute: 3, vertical: true, at: 2 }
];
function Segmentor() {
  const t = useCopy().segmentor;
  const { ref, step, on } = useLoop(CUT);
  return (
    <div ref={ref} className={`${box} flex flex-col justify-between`}>
      <p className="text-[0.625rem] text-muted-foreground">{t.source}</p>
      <ul className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((m) => {
          const pick = PICKS.find((p) => p.minute === m);
          const picked = pick && step >= pick.at;
          return (
            <li key={m}>
              <span className={`morph relative block aspect-video overflow-hidden rounded-sm border bg-muted-foreground/20 ${!picked ? 'border-border' : pick.vertical ? 'border-(--attention)' : 'lit border-primary'}`}>
                <span className="absolute top-1/2 left-1/2 size-2 -translate-1/2 rounded-full bg-muted-foreground/50" />
                {pick?.vertical && (
                  <span
                    className={`morph absolute inset-y-0 left-1/2 w-[32%] -translate-x-1/2 border-x border-(--attention) shadow-[0_0_0_99px_color-mix(in_oklab,var(--card)_60%,transparent)] ${picked ? '' : 'opacity-0'}`}
                  />
                )}
              </span>
              <span className="mt-0.5 block text-center font-mono text-[0.5625rem] text-muted-foreground tabular-nums">0{m}:00</span>
            </li>
          );
        })}
      </ul>
      <ul className="grid gap-1">
        {PICKS.map((p, k) => {
          const cutting = on && step === 3 + k;
          const done = step > 3 + k;
          return (
            <li key={p.minute} className={`morph flex items-center gap-2 font-mono text-[0.625rem] ${step >= p.at ? '' : 'opacity-0'} ${done ? '' : 'text-muted-foreground'}`}>
              <span className="truncate">
                podcast_segment_{p.minute + 1}_{p.vertical ? 'vertical' : 'default'}.mp4
              </span>
              <span className="h-1 min-w-6 flex-1 overflow-hidden rounded-full bg-border">
                <span key={cutting ? 'cut' : 'rest'} className="block h-full bg-primary" style={cutting ? { animation: `fill ${CUT[3 + k]}ms linear forwards` } : { width: done ? '100%' : 0 }} />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const SCENES: Record<string, Scene> = {
  LoreForge,
  'Lyric Type': LyricType,
  'My Garden': MyGarden,
  'Document Assistant': DocumentAssistant,
  'YT Radio Stream': YtRadio,
  Segmentor
};

// The scene for a project on the home page, by its name (the same in both languages).
export function ProjectScene({ name }: { name: string }) {
  const S = SCENES[name];
  return S ? (
    <div className="mb-5 h-40" aria-hidden>
      <S />
    </div>
  ) : null;
}
