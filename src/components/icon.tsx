'use client';

import { useEffect, useRef } from 'react';
import { icons } from './icons';

export type IconName = keyof typeof icons;
type Handle = { startAnimation: () => void; stopAnimation: () => void };
type Vendored = React.ComponentType<{ ref?: React.Ref<Handle>; size?: number; className?: string }>;

const HOST = 'a, button, [role=option], [data-icon-host]';
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// One observer for every icon: each plays once as it scrolls in, and icons arriving together play in a short stagger.
let io: IntersectionObserver | undefined;
const onSeen = new WeakMap<Element, () => void>();
function observe(el: Element, fn: () => void) {
  io ??= new IntersectionObserver(
    (entries) => {
      let i = 0;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io!.unobserve(e.target);
        setTimeout(onSeen.get(e.target)!, i++ * 70);
      }
    },
    { rootMargin: '0px 0px -10% 0px' }
  );
  onSeen.set(el, fn);
  io.observe(el);
  return () => io!.unobserve(el);
}

// An animated lucide icon (vendored by scripts/add-icons.mjs). It plays while its host, the nearest link, button,
// option or [data-icon-host] (a whole card, not just the glyph), is hovered or focused; once as it scrolls into view;
// whenever `play` turns true; and every `loop` ms. `still` never animates, and neither does anything under reduced motion.
export function Icon({
  name,
  size = 18,
  className = '',
  play,
  loop,
  still
}: {
  name: IconName;
  size?: number;
  className?: string;
  play?: boolean;
  loop?: number;
  still?: boolean;
}) {
  const C = icons[name] as Vendored;
  const box = useRef<HTMLSpanElement>(null);
  const icon = useRef<Handle>(null);
  const timer = useRef(0);
  const hovered = useRef(false);

  const start = () => {
    if (still || calm()) return;
    clearTimeout(timer.current);
    icon.current?.startAnimation();
  };
  const stop = () => {
    clearTimeout(timer.current);
    icon.current?.stopAnimation();
  };
  // A few icons loop until stopped (GitHub's tail wags), so a pulse lets them run for a beat unless the host is hovered.
  const pulse = () => {
    start();
    timer.current = window.setTimeout(() => hovered.current || stop(), 1400);
  };

  useEffect(() => {
    if (still) return;
    const el = box.current!;
    const host = el.parentElement?.closest(HOST);
    // Touch has no hover: a tap gets a pulse instead of a start cut short by the pointerleave right after it.
    const enter = (e: Event) => {
      if (e instanceof PointerEvent && e.pointerType !== 'mouse') return pulse();
      hovered.current = true;
      start();
    };
    const leave = (e: Event) => {
      if (e instanceof PointerEvent && e.pointerType !== 'mouse') return;
      hovered.current = false;
      stop();
    };
    const events = [
      ['pointerenter', enter],
      ['pointerleave', leave],
      ['focusin', enter],
      ['focusout', leave]
    ] as const;
    for (const [type, fn] of events) host?.addEventListener(type, fn);
    const unobserve = observe(el, pulse);
    const id = loop ? setInterval(pulse, loop) : undefined;
    return () => {
      for (const [type, fn] of events) host?.removeEventListener(type, fn);
      unobserve();
      clearInterval(id);
      clearTimeout(timer.current);
    };
  }, [still, loop]);

  useEffect(() => {
    if (play) pulse();
  }, [play]);

  return (
    <span ref={box} aria-hidden className={`inline-flex shrink-0 ${className}`}>
      <C ref={icon} size={size} className="flex" />
    </span>
  );
}
