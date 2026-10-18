'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useMessages } from 'next-intl';

const HOLD_MS = 4500;

// Rotating hero headline. Every phrase also sits invisibly in the same grid cell, so the block always has the height
// of the tallest one at the current width and nothing below it moves when the phrase changes. Shorter phrases sit at
// the top of that block, right under the header, so the spare line lands between headline and lead instead.
export function HeroTitle({ heading }: { heading: string }) {
  const titles = useMessages().hero.titles;
  // SSR, no-JS, crawlers and screen readers get phrase 0. The inline script after this component (home.tsx) swaps in
  // the start phrase for this load before paint and leaves its index here, so hydration matches what is on screen.
  // The rest follow in a shuffled order.
  const [order] = useState(() => {
    const start = typeof window === 'undefined' ? 0 : ((window as Window & { __heroStart?: number }).__heroStart ?? 0);
    return [
      start,
      ...titles
        .map((_, i) => [Math.random(), i])
        .filter(([, i]) => i !== start)
        .sort((a, b) => a[0] - b[0])
        .map(([, i]) => i)
    ];
  });
  const [tick, setTick] = useState(0);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (hover || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      if (!document.hidden) setTick((n) => n + 1);
    }, HOLD_MS);
    return () => clearInterval(id);
  }, [hover]);

  const current = order[tick % order.length];

  // The h1 names the page for search engines and screen readers (name and role); the rotating phrases are decoration,
  // and only the fixed one is read out, so nobody gets the hidden sizers.
  return (
    <div className="type-display max-w-[13ch]" onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
      <h1 className="sr-only">{heading}</h1>
      <p className="sr-only">{titles[0]}</p>
      {/* Padding + negative margin widen the clip so accents and descenders aren't cut at rest; the mask feathers
          its outer edge so phrases fade in and out of the slot instead of being sliced. Phrases sit on a drum: the
          origin is pushed 1em behind the text, so rotateX rolls the next one up from below like a reel. */}
      <span
        aria-hidden
        className="-my-[0.25em] grid overflow-hidden py-[0.25em] [mask-image:linear-gradient(transparent,#000_0.15em,#000_calc(100%_-_0.15em),transparent)] [perspective:60em]"
      >
        {titles.map((title) => (
          <span key={title} className="invisible [grid-area:1/1]">
            {title}
          </span>
        ))}
        <AnimatePresence initial={false}>
          <motion.span
            key={current}
            initial={{ rotateX: -80, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 80, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.9 }}
            className="flex flex-col justify-start [grid-area:1/1] [backface-visibility:hidden] [transform-origin:50%_50%_-1em]"
          >
            {titles[current]}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}
