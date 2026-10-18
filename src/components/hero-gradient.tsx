'use client';

import { useEffect, useMemo, useState } from 'react';
import AnimatedGradient from '@/components/ui/animated-gradient';

// The shader only parses hex/rgb/hsl; painting the token on a 1px canvas resolves oklch (or anything CSS takes) to sRGB.
export function rgba(token: string, ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = '#0000';
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(token);
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgba(${r},${g},${b},${a / 255})`;
}

// Animated glow in the preset's glow colors (primary/chart-2 unless overridden) behind the home hero; dots and grain from globals.css sit on top.
export function HeroGradient() {
  const [colors, setColors] = useState<string | null>(null);

  useEffect(() => {
    const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
    // The theme script rewrites the tokens inline on <html>; same colors keep the string, so nothing re-renders.
    const read = () => setColors(`${rgba('--glow-1', ctx)}|${rgba('--glow-2', ctx)}`);
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class', 'data-preset'] });
    return () => observer.disconnect();
  }, []);

  const config = useMemo(() => {
    if (!colors) return null;
    const [primary, accent] = colors.split('|');
    return {
      preset: 'custom' as const,
      color1: 'rgba(0,0,0,0)',
      color2: primary,
      color3: accent,
      proportion: 45,
      scale: 0.5,
      speed: 12,
      distortion: 5,
      swirl: 60,
      swirlIterations: 5,
      softness: 35,
      shape: 'Checks' as const,
      shapeSize: 30
    };
  }, [colors]);

  if (!config) return null;
  return <AnimatedGradient config={config} className="hero-gradient" style={{ inset: '0 0 auto', height: 'min(60rem, 100svh)', zIndex: -2 }} />;
}
