'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { play } from 'cuelume';
import { useMessages, useTranslations } from 'next-intl';
import { Icon, type IconName } from './icon';

// One click on a made-up order screen, followed hop by hop through the stack.
const STEP_MS = 520;
const RESPONSE = 4; // index of the "Response" hop: the screen updates right after it
const ICONS: IconName[] = ['cursor-click', 'server', 'cog', 'database-backup', 'circle-check', 'refresh-cw'];

export function StackTrace() {
  const t = useTranslations('trace');
  const { fields, steps } = useMessages().trace;
  const n = steps.length;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [step, setStep] = useState(-1); // -1 idle, 0..n-1 in flight, n finished
  const [round, setRound] = useState(0);
  const [order, setOrder] = useState(1042);
  const clicked = useRef(false);

  useEffect(() => {
    if (inView) setRound((r) => r || 1);
  }, [inView]);

  useEffect(() => {
    if (!round) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return setStep(n);
    setStep(0);
    const id = setInterval(() => setStep((s) => (s + 1 >= n ? (clearInterval(id), n) : s + 1)), STEP_MS);
    return () => clearInterval(id);
  }, [round, n]);

  useEffect(() => {
    if (step === RESPONSE + 1 && clicked.current) play('success', { emphasis: 'subtle' });
  }, [step]);

  const running = step >= 0 && step < n;
  const saved = step > RESPONSE;
  const send = () => {
    if (running) return;
    clicked.current = true;
    if (step === n) setOrder((o) => o + 1);
    setRound((r) => r + 1);
  };

  return (
    <figure ref={ref} className="mt-14 sm:mt-20">
      <div className="grid overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-(--shadow) md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="border-b border-border p-5 sm:p-6 md:border-r md:border-b-0">
          <p className="type-meta">{t('app')}</p>
          <h2 className="type-heading mt-1">{t('form')}</h2>
          <dl className="mt-5 grid gap-3 text-[0.9375rem]">
            {fields.map(([label, value]) => (
              <div key={label} className="rounded-md border border-border px-3 py-2">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <button
            type="button"
            onClick={send}
            aria-disabled={running}
            className="pressable mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[0.9375rem] font-medium text-primary-foreground aria-disabled:opacity-70"
            data-cuelume-tap
          >
            {running && !saved && <Icon name="loader-circle" size={16} still className="motion-safe:animate-spin" />}
            {running && !saved ? t('saving') : t('save')}
          </button>
          <div className="mt-3 min-h-10" aria-live="polite">
            <AnimatePresence mode="popLayout">
              {saved && (
                <motion.p
                  key={order}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
                  className="rounded-md bg-primary/10 px-3 py-2 text-sm"
                >
                  {t('saved', { n: order })}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <ol className="p-5 sm:p-6" aria-hidden>
          {steps.map((s, i) => {
            const state = i < step ? 'done' : i === step ? 'active' : 'pending';
            return (
              <li key={s.layer} className="relative grid grid-cols-[1rem_minmax(0,1fr)] gap-x-3 pb-5 last:pb-0">
                {i < n - 1 && (
                  <span className="absolute top-4 bottom-0 left-[calc(0.5rem-0.5px)] w-px bg-border">
                    <span
                      className="block h-full origin-top bg-primary transition-transform"
                      style={{ transform: `scaleY(${i < step ? 1 : 0})`, transitionDuration: `${STEP_MS}ms`, transitionTimingFunction: 'var(--spring)' }}
                    />
                  </span>
                )}
                <span className="relative mt-1 flex size-4 items-center justify-center">
                  {state === 'active' && (
                    <motion.span
                      className="absolute inset-0 rounded-full bg-primary/30"
                      initial={{ scale: 0.6, opacity: 1 }}
                      animate={{ scale: 1.8, opacity: 0 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  )}
                  <span
                    className={`size-2.5 rounded-full border transition-colors duration-200 ${
                      state === 'pending' ? 'border-border bg-card' : 'border-primary bg-primary'
                    }`}
                  />
                </span>
                <div className={`transition-opacity duration-300 ${state === 'pending' ? 'opacity-45' : 'opacity-100'}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="flex items-center gap-2 font-semibold font-stretch-104%">
                      {/* Each hop's glyph plays as the request reaches it; the integration keeps turning once it runs in the background. */}
                      <Icon name={ICONS[i]} size={16} play={state === 'active'} loop={i === n - 1 && step === n ? 3200 : undefined} className="text-muted-foreground" />
                      {s.layer}
                      <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-xs font-normal text-secondary-foreground">{s.tech}</span>
                    </p>
                    <p className="font-mono text-xs text-muted-foreground tabular-nums">{s.ms}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{s.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <figcaption className="type-meta mt-3 max-w-[64ch]">{t('caption')}</figcaption>
    </figure>
  );
}
