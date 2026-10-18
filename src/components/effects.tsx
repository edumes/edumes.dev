'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, motion } from 'motion/react';
import { play } from 'cuelume';
import { useLocale, useTranslations } from 'next-intl';
import { localeConfig } from '@/i18n/config';
import { Icon } from './icon';
import { rgba } from './hero-gradient';

// Marks [data-reveal] blocks data-in as they scroll into view; globals.css staggers their words/letters in.
export function Reveals() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute('data-in', '');
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    document.querySelectorAll('[data-reveal]:not([data-in])').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

const SPACING = 22; // matches the CSS dot grid on main:has(> #top)::before
const REACH = 120;

// Swells the hero's CSS dot grid around the cursor. Only the dots in reach are drawn, right over their static twins,
// and the loop sleeps once they settle. Fine pointers with motion allowed only; everyone else keeps the static grid.
export function RippleGrid() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const dots = new Map<number, number>(); // i * 1e4 + j -> eased proximity 0..1
    let px = -1e4;
    let py = -1e4;
    let raf = 0;
    let color = '';

    const frame = () => {
      const dpr = devicePixelRatio;
      const r = canvas.getBoundingClientRect();
      const w = Math.round(r.width * dpr);
      const h = Math.round(r.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const x = px - r.left;
      const y = py - r.top;
      const targets = new Map<number, number>();
      const rows = Math.ceil(r.height / SPACING);
      for (let i = Math.max(0, Math.floor((x - REACH) / SPACING)); i <= (x + REACH) / SPACING; i++) {
        for (let j = Math.max(0, Math.floor((y - REACH) / SPACING)); j <= Math.min(rows, (y + REACH) / SPACING); j++) {
          const d = Math.hypot(i * SPACING + SPACING / 2 - x, j * SPACING + SPACING / 2 - y);
          if (d < REACH) targets.set(i * 1e4 + j, 1 - d / REACH);
        }
      }
      for (const k of targets.keys()) if (!dots.has(k)) dots.set(k, 0);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, r.width, r.height);
      ctx.fillStyle = color;
      for (const [k, s] of dots) {
        const target = targets.get(k) ?? 0;
        const next = s + (target - s) * 0.15;
        if (!target && next < 0.01) {
          dots.delete(k);
          continue;
        }
        dots.set(k, next);
        ctx.globalAlpha = 0.1 + 0.3 * next;
        ctx.beginPath();
        ctx.arc(Math.floor(k / 1e4) * SPACING + SPACING / 2, (k % 1e4) * SPACING + SPACING / 2, 1.2 + 2.6 * next, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = dots.size ? requestAnimationFrame(frame) : 0;
    };
    const wake = () => {
      if (raf) return;
      color = getComputedStyle(document.documentElement).getPropertyValue('--foreground');
      raf = requestAnimationFrame(frame);
    };
    const move = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      wake();
    };
    const leave = (e: PointerEvent) => {
      if (e.relatedTarget) return;
      px = py = -1e4;
      wake();
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('scroll', wake, { passive: true });
    document.addEventListener('pointerout', leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('scroll', wake);
      document.removeEventListener('pointerout', leave);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-[-1] h-[min(60rem,100svh)] w-full mask-(--fade)"
    />
  );
}

// Ribbons from rewampui.com/components/sine-ribbons: a base wave plus two harmonics [freq, amp, speed] each, sized for
// a 360px band and scaled to the real height. Phones draw the first three.
const RIBBONS = [
  { y: 0.53, thick: 60, amp: 55, freq: 0.0032, speed: 0.012, phase: 0, harmonics: [[0.006, 24, 0.018], [0.012, 10, -0.01]] },
  { y: 0.47, thick: 75, amp: 70, freq: 0.0026, speed: 0.016, phase: 1.8, harmonics: [[0.005, 30, -0.014], [0.009, 14, 0.022]] },
  { y: 0.59, thick: 85, amp: 65, freq: 0.0022, speed: 0.01, phase: 3.4, harmonics: [[0.0045, 28, 0.015], [0.008, 16, -0.012]] },
  { y: 0.41, thick: 50, amp: 45, freq: 0.0038, speed: 0.02, phase: 4.8, harmonics: [[0.0075, 20, 0.024], [0.014, 8, -0.018]] },
  { y: 0.5, thick: 42, amp: 36, freq: 0.0045, speed: 0.024, phase: 2.3, harmonics: [[0.009, 16, -0.02], [0.016, 6, 0.028]] }
];
const STEP = 4;
const tone = (rgba: string, a: number) => rgba.replace(/[\d.]+\)$/, `${a})`);

// Section divider: translucent sine ribbons in the preset's glow colors. They rise from flat lines the first time they
// are seen, ripple around a fine pointer and speed up a little while the page scrolls; `seed` gives each divider its
// own shape. The loop only runs on screen, and reduced motion gets one still frame.
export function SineRibbons({ seed = 0, className = '' }: { seed?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(pointer: fine)').matches;
    const pointer = { x: -1e4, y: -1e4 };
    const ripple = { x: 0, y: 0, s: 0 };
    let w = 0;
    let h = 0;
    let t = seed * 1000;
    let grow = still ? 1 : 0;
    let rise: ReturnType<typeof animate> | undefined;
    let boost = 0;
    let scroll = scrollY;
    let raf = 0;
    let last = 0;
    let colors: string[] = [];
    let dark = false;

    const draw = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      const k = (h / 360) * grow;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      // Screen blends the overlaps into light on dark pages; on light pages it would wash them out to white.
      ctx.globalCompositeOperation = dark ? 'screen' : 'source-over';
      RIBBONS.slice(0, w < 640 ? 3 : 5).forEach((r, i) => {
        const [a, b] = [colors[i % 2], colors[(i + 1) % 2]];
        const f = 1 + 0.15 * Math.sin(seed * 3 + i);
        const base = h * r.y;
        const top: number[] = [];
        const bottom: number[] = [];
        for (let x = 0; x <= w + STEP; x += STEP) {
          let y = Math.sin(x * r.freq * f + t * r.speed + r.phase) * r.amp;
          for (const [hf, ha, hs] of r.harmonics) y += Math.sin(x * hf * f + t * hs) * ha;
          const d = Math.hypot(x - ripple.x, base - ripple.y);
          if (d < 200) y += Math.sin(d * 0.08 - t * 0.1) * (1 - d / 200) ** 2 * 32 * ripple.s;
          const half = (r.thick / 2) * (0.7 + Math.sin(x * 0.004 + t * 0.01) * 0.3);
          top.push(base + (y - half) * k);
          bottom.push(base + (y + half) * k);
        }
        const line = (ys: number[]) => {
          ctx.beginPath();
          ys.forEach((y, j) => ctx.lineTo(j * STEP, y));
        };

        line(top);
        for (let j = bottom.length - 1; j >= 0; j--) ctx.lineTo(j * STEP, bottom[j]);
        const fill = ctx.createLinearGradient(0, 0, w, h);
        fill.addColorStop(0, tone(a, 0.5));
        fill.addColorStop(0.5, tone(b, 0.35));
        fill.addColorStop(1, tone(a, 0.08));
        ctx.fillStyle = fill;
        ctx.fill();

        line(top);
        ctx.strokeStyle = ctx.shadowColor = tone(a, 0.9);
        ctx.lineWidth = 1.6;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        line(bottom);
        ctx.strokeStyle = tone(a, 0.35);
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    };

    const frame = (now: number) => {
      const dt = last ? Math.min(now - last, 50) : 16.7;
      last = now;
      boost += (Math.min((Math.abs(scrollY - scroll) / dt) * 1.5, 2) - boost) * 0.1;
      scroll = scrollY;
      t += (dt / 16.7) * (1 + boost);

      const r = canvas.getBoundingClientRect();
      const px = pointer.x - r.left;
      const py = pointer.y - r.top;
      const inside = px >= 0 && px <= w && py >= 0 && py <= h;
      if (inside && ripple.s < 0.01) Object.assign(ripple, { x: px, y: py });
      if (inside) {
        ripple.x += (px - ripple.x) * 0.08;
        ripple.y += (py - ripple.y) * 0.08;
      }
      ripple.s += (+inside - ripple.s) * 0.08;

      draw();
      raf = requestAnimationFrame(frame);
    };

    const size = () => {
      ({ width: w, height: h } = canvas.getBoundingClientRect());
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      draw();
    };
    // The theme script rewrites the tokens inline on <html>, same as HeroGradient listens for.
    const read = () => {
      colors = ['--glow-1', '--glow-2'].map((c) => rgba(c, probe));
      dark = document.documentElement.classList.contains('dark');
      draw();
    };
    const move = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    const leave = (e: PointerEvent) => {
      if (!e.relatedTarget) pointer.x = pointer.y = -1e4;
    };

    read();
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class', 'data-preset'] });
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) {
          cancelAnimationFrame(raf);
          raf = last = 0;
          return;
        }
        raf ||= requestAnimationFrame(frame);
        if (!rise && e.intersectionRatio >= 0.5) rise = animate(0, 1, { type: 'spring', bounce: 0, duration: 1.2, onUpdate: (v) => (grow = v) });
      },
      { threshold: [0, 0.5] }
    );
    if (!still) io.observe(canvas);
    if (fine && !still) {
      window.addEventListener('pointermove', move, { passive: true });
      document.addEventListener('pointerout', leave);
    }
    return () => {
      cancelAnimationFrame(raf);
      rise?.stop();
      ro.disconnect();
      mo.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerout', leave);
    };
  }, [seed]);

  return <canvas ref={ref} aria-hidden className={`ribbons block h-35 w-full sm:h-50 ${className}`} />;
}

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

// Letters cycle through random ones and settle left to right, when first seen and on hover. The invisible copy holds
// the size so nothing reflows; screen readers get the plain text.
export function Scramble({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(text);
  const raf = useRef(0);

  const decode = () => {
    if (raf.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let n = 0;
    const tick = () => {
      n++;
      setShown([...text].map((c, i) => (i < n / 2 || !/[a-z]/i.test(c) ? c : LETTERS[(Math.random() * 26) | 0])).join(''));
      raf.current = n < text.length * 2 ? requestAnimationFrame(tick) : 0;
    };
    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        decode();
        io.disconnect();
      },
      { threshold: 0.6 }
    );
    io.observe(ref.current!);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <span ref={ref} onPointerEnter={decode} className="grid">
      <span className="sr-only">{text}</span>
      <span aria-hidden className="invisible [grid-area:1/1]">
        {text}
      </span>
      <span aria-hidden className="[grid-area:1/1]">
        {shown}
      </span>
    </span>
  );
}

// Résumé download that confirms itself, like CopyEmail: a check draws in and the label flips for a moment.
export function DownloadCv({ className }: { className: string }) {
  const t = useTranslations('ui');
  const pdf = localeConfig[useLocale()].cvPdf;
  const [done, setDone] = useState(false);
  return (
    <a
      href={pdf}
      download
      className={className}
      aria-live="polite"
      onClick={() => {
        play('success', { emphasis: 'subtle' });
        setDone(true);
        setTimeout(() => setDone(false), 2400);
      }}
    >
      {done ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <motion.path d="m5 12 5 5 9-10" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, ease: 'easeOut' }} />
        </svg>
      ) : (
        <Icon name="download" size={16} />
      )}
      {done ? t('downloaded') : t('downloadCv')}
    </a>
  );
}
