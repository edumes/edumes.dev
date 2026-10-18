'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MotionConfig, motion } from 'motion/react';
import { bind, play, setEnabled, unlock } from 'cuelume';
import { useLocale, useTranslations } from 'next-intl';
import { profile, sectionIcons } from '@/content/site';
import { localeConfig } from '@/i18n/config';
import { PRESETS, DEFAULT_PRESET, type Mode, type PresetName } from '@/themes/theme';
import { Icon, type IconName } from './icon';

const SOUND_KEY = 'edumes:sound';
const sections = ['cases', 'projects', 'about', 'experience', 'contact'] as const;
const pages = ['top', ...sections] as const;
type Page = (typeof pages)[number];

const swap = (fn: () => void) => {
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(fn);
  else fn();
};

type Link = { label: string; href: string };

// `section` marks a page that belongs to one of the home's sections (a case page is under "cases"). `blog` is the
// blog's URL, set only once it has posts.
export function Header({ altHref, cases = [], section, blog }: { altHref: string; cases?: Link[]; section?: Page; blog?: string }) {
  const t = useTranslations();
  const { home, alt } = localeConfig[useLocale()];
  const command = useRef<HTMLDialogElement>(null);
  const [scrolled, setScrolled] = useState(false);

  // Glass only once content slides underneath; at the top the bar stays clear over the hero.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-spy: the section crossing the middle band of the viewport is current, and it stays current through the gaps
  // between sections (the ribbon dividers) so nothing flickers off. Only the home has these ids.
  const [current, setCurrent] = useState<Page | null>(null);
  useEffect(() => {
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id);
        const found = pages.find((s) => visible.has(s));
        if (found) setCurrent(found);
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    for (const s of pages) {
      const el = document.getElementById(s);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  // layoutRoot: the bar is fixed, so its pills must not read page scroll as movement. reducedMotion snaps them.
  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', bounce: 0, duration: 0.45 }}>
      <motion.header layoutRoot className="material fixed inset-x-0 top-0 z-40" data-scrolled={scrolled || undefined}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3">
          {t('ui.skip')}
        </a>
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-[var(--gutter)]">
          <a href={`${home}#top`} className="type-meta !text-foreground font-semibold [font-stretch:110%]" data-cuelume-navigate>
            {profile.name}
          </a>
          <nav className="hidden md:block" aria-label={t('ui.menu')}>
            <ul className="flex gap-6 text-[0.9375rem] text-muted-foreground">
              {sections.map((s) => (
                <li key={s}>
                  <a
                    href={`${home}#${s}`}
                    aria-current={current === s || undefined}
                    className="group relative isolate flex items-center gap-1.5 transition-colors hover:text-foreground aria-current:text-foreground"
                    data-cuelume-navigate
                  >
                    {current === s && <motion.span layoutId="nav-pill" className="absolute -inset-x-2.5 -inset-y-1 -z-10 rounded-md bg-muted" />}
                    {/* Glyphs only once the bar has room for them; below lg the labels alone already fill it. */}
                    <span className="hidden lg:contents">
                      <Icon name={sectionIcons[s]} size={16} play={current === s} />
                    </span>
                    {t(`nav.${s}`)}
                    {/* Liquid underline: a wave that draws itself on hover; the current link has the pill instead. */}
                    <svg
                      viewBox="0 0 100 10"
                      preserveAspectRatio="none"
                      className="pointer-events-none absolute inset-x-0 -bottom-1.5 h-1.5 w-full overflow-visible group-aria-current:hidden"
                      aria-hidden
                    >
                      <path
                        d="M0 5Q25 0 50 5T100 5"
                        pathLength={1}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="transition-[stroke-dashoffset] duration-500 ease-out [stroke-dasharray:1] [stroke-dashoffset:1] group-hover:[stroke-dashoffset:0]"
                      />
                    </svg>
                  </a>
                </li>
              ))}
              {blog && (
                <li>
                  <a href={blog} className="group relative flex items-center gap-1.5 transition-colors hover:text-foreground" data-cuelume-navigate>
                    <span className="hidden lg:contents">
                      <Icon name="book-text" size={16} />
                    </span>
                    {t('nav.blog')}
                  </a>
                </li>
              )}
            </ul>
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <IconButton label={t('ui.menu')} onClick={() => command.current?.showModal()} data-cuelume-open="">
              <Icon name="search" />
              <kbd className="hidden font-sans text-xs text-muted-foreground sm:inline">⌘K</kbd>
            </IconButton>
            <ThemeMenu />
            <SoundToggle />
            <a
              href={altHref}
              onClick={() => {
                try {
                  localStorage.setItem('edumes:lang', alt);
                } catch {}
              }}
              hrefLang={localeConfig[alt].tag}
              className="pressable flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              data-cuelume-navigate
            >
              <span className="hidden lg:contents">
                <Icon name="languages" />
              </span>
              {alt.toUpperCase()}
              <span className="sr-only"> {t('ui.language')}</span>
            </a>
          </div>
        </div>
        <CommandMenu dialog={command} home={home} altHref={altHref} cases={cases} blog={blog} />
      </motion.header>
      <MobileNav home={home} active={current ?? section ?? 'top'} />
    </MotionConfig>
  );
}

// Below md the text nav gives way to an icon pill pinned to the bottom of the screen (rewampui.com/components/dark-mode-mobile-navbar).
// Touch has no hover for the original's tooltips, so the current item spells out its name. Every item is 40px plus
// its label, which springs open only on the current one, so the dark indicator can glide straight to index * 40 with
// the measured label width instead of chasing layout mid-animation.
// It lives outside the header, whose backdrop-filter would make it the containing block of anything fixed inside.
function MobileNav({ home, active }: { home: string; active: Page }) {
  const t = useTranslations();
  const labels = useRef<Partial<Record<Page, HTMLSpanElement | null>>>({});
  const [label, setLabel] = useState(0);
  useLayoutEffect(() => {
    const measure = () => setLabel(labels.current[active]?.offsetWidth ?? 0);
    measure();
    document.fonts.ready.then(measure);
  }, [active]);

  return (
    <nav aria-label={t('ui.menu')} className="fixed inset-x-0 bottom-4 z-40 flex justify-center md:hidden">
        <ul className="relative flex rounded-full border border-border bg-popover p-1 text-popover-foreground raised">
          <motion.li
            aria-hidden
            initial={false}
            animate={{ x: pages.indexOf(active) * 40, width: 40 + label }}
            className="absolute top-1 left-1 h-10 rounded-full bg-foreground"
          />
          {pages.map((s) => {
            const on = s === active;
            return (
              <li key={s}>
                <a
                  href={`${home}#${s}`}
                  aria-label={t(`nav.${s}`)}
                  aria-current={on || undefined}
                  className="pressable relative flex h-10 items-center rounded-full px-2.75 text-muted-foreground aria-current:text-background"
                  data-cuelume-navigate
                >
                  <Icon name={sectionIcons[s]} size={18} play={on} />
                  <motion.span initial={false} animate={{ width: on ? 'auto' : 0, opacity: on ? 1 : 0 }} className="overflow-hidden">
                    <span ref={(el) => void (labels.current[s] = el)} className="block w-max pl-1.5 text-[0.8125rem] font-medium">
                      {t(`nav.${s}`)}
                    </span>
                  </motion.span>
                </a>
              </li>
            );
          })}
        </ul>
    </nav>
  );
}

function IconButton({ label, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="pressable flex h-9 items-center gap-1.5 rounded-md px-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      {...props}
    >
      {children}
    </button>
  );
}

function ThemeMenu() {
  const t = useTranslations('ui');
  const [state, setState] = useState<{ preset: PresetName; mode: Mode }>({ preset: DEFAULT_PRESET, mode: 'system' });
  useEffect(() => {
    const s = window.__theme.get();
    setState({ preset: s.preset ?? DEFAULT_PRESET, mode: s.mode ?? 'system' });
  }, []);
  const update = (next: Partial<typeof state>) => {
    setState((s) => ({ ...s, ...next }));
    swap(() => window.__theme.set(next));
  };

  return (
    <>
      <IconButton label={t('theme')} popoverTarget="theme-menu" data-cuelume-open="">
        <Icon name="palette" />
      </IconButton>
      <div
        id="theme-menu"
        popover="auto"
        className="popover fixed top-16 right-[var(--gutter)] w-[min(30rem,calc(100vw-2*var(--gutter)))] origin-top-right rounded-lg border border-border bg-popover p-2 text-popover-foreground raised"
      >
        <div role="radiogroup" aria-label={t('theme')} className="grid grid-cols-3 gap-1 rounded-md bg-muted p-1">
          {(['light', 'dark', 'system'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={state.mode === m}
              onClick={() => update({ mode: m })}
              className="pressable relative isolate flex items-center justify-center gap-1.5 rounded-sm py-1.5 text-sm text-muted-foreground aria-checked:text-foreground"
              data-cuelume-select
            >
              {state.mode === m && <motion.span layoutId="mode-pill" className="absolute inset-0 -z-10 rounded-sm bg-background shadow-sm" />}
              <Icon name={modeIcons[m]} size={16} play={state.mode === m} />
              {t(m)}
            </button>
          ))}
        </div>
        <ul
          className="mt-2 grid max-h-[min(26rem,calc(100svh-10rem))] grid-cols-2 gap-1.5 overflow-y-auto overscroll-contain p-0.5 sm:grid-cols-3"
          role="listbox"
          aria-label={t('theme')}
        >
          {(Object.keys(PRESETS) as PresetName[]).map((name) => {
            const selected = state.preset === name;
            // A miniature of the preset in the current mode: its page, heading font, corners and accent colors.
            const preview = (mode: 'light' | 'dark', className: string) => {
              const p = PRESETS[name][mode];
              return (
                <span
                  className={`${className} h-16 flex-col justify-between border px-2.5 py-2`}
                  style={{
                    background: `radial-gradient(120% 100% at 100% 0%, color-mix(in oklab, ${p['glow-1']} 30%, transparent), transparent 70%), ${p.background}`,
                    borderColor: p.border,
                    color: p.foreground,
                    borderRadius: `min(${p.radius}, 0.75rem)`
                  }}
                >
                  <span className="flex items-start justify-between gap-1">
                    <span
                      className="truncate text-[0.9375rem] leading-tight"
                      style={{
                        fontFamily: p['font-display'],
                        fontWeight: `calc(${p['display-weight']} - 40)`,
                        fontStretch: `calc(106% * ${p.stretch})`,
                        textTransform: p['display-case'] as React.CSSProperties['textTransform']
                      }}
                    >
                      {PRESETS[name].label}
                    </span>
                    {selected && <Icon name="check" size={16} play />}
                  </span>
                  <span className="flex items-center gap-1" aria-hidden>
                    <span className="h-2 w-6 rounded-full" style={{ background: p.primary }} />
                    <span className="size-2 rounded-full" style={{ background: p['glow-2'] }} />
                    <span className="h-1 w-8 rounded-full opacity-60" style={{ background: p['muted-foreground'] }} />
                  </span>
                </span>
              );
            };
            return (
              <li key={name} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => update({ preset: name })}
                  className={`pressable block w-full text-left outline-offset-2 hover:opacity-90 ${selected ? 'outline-2 outline-ring outline-solid' : ''}`}
                  style={{ borderRadius: `min(${PRESETS[name].light.radius}, 0.75rem)` }}
                  data-cuelume-select
                >
                  {preview('light', 'flex dark:hidden')}
                  {preview('dark', 'hidden dark:flex')}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

function SoundToggle() {
  const t = useTranslations('ui');
  const [on, setOn] = useState(false);
  useEffect(() => {
    const unbind = bind();
    let saved = false;
    try {
      saved = localStorage.getItem(SOUND_KEY) === 'on';
    } catch {}
    setEnabled(saved);
    setOn(saved);
    return unbind;
  }, []);
  const toggle = () => {
    const next = !on;
    setOn(next);
    try {
      localStorage.setItem(SOUND_KEY, next ? 'on' : 'off');
    } catch {}
    if (next) {
      unlock();
      setEnabled(true);
      play('toggle');
    } else setEnabled(false);
  };
  return (
    <IconButton label={on ? t('soundOff') : t('soundOn')} aria-pressed={on} onClick={toggle}>
      {on ? <Icon key="on" name="volume" play /> : <MutedIcon />}
    </IconButton>
  );
}

const modeIcons = { light: 'sun', dark: 'moon', system: 'sun-moon' } as const;

type Item = { label: string; group: string; icon: IconName; run: () => void };

function CommandMenu({ dialog, home, altHref, cases, blog }: { dialog: React.RefObject<HTMLDialogElement | null>; home: string; altHref: string; cases: Link[]; blog?: string }) {
  const t = useTranslations();
  const { alt } = localeConfig[useLocale()];
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !/input|textarea/i.test((e.target as HTMLElement).tagName))) {
        e.preventDefault();
        dialog.current?.open ? dialog.current.close() : dialog.current?.showModal();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog]);

  const go = (href: string) => () => (location.href = href);
  const nav = t('ui.goTo');
  const act = t('ui.actions');
  const items: Item[] = [
    ...sections.map((s) => ({ label: t(`nav.${s}`), group: nav, icon: sectionIcons[s], run: go(`${home}#${s}`) })),
    ...(blog ? [{ label: t('nav.blog'), group: nav, icon: 'book-text' as const, run: go(blog) }] : []),
    ...cases.map((c) => ({ label: c.label, group: t('cases.title'), icon: 'file-text' as const, run: go(c.href) })),
    {
      label: copied ? t('ui.copied') : `${t('ui.copyEmail')}: ${profile.email}`,
      group: act,
      icon: copied ? 'check' : 'copy',
      run: () => {
        navigator.clipboard.writeText(profile.email);
        play('success', { emphasis: 'subtle' });
        setCopied(true);
      }
    },
    {
      label: t('ui.language'),
      group: act,
      icon: 'languages',
      run: () => {
        try {
          localStorage.setItem('edumes:lang', alt);
        } catch {}
        location.href = altHref;
      }
    },
    ...(['light', 'dark', 'system'] as const).map((m) => ({
      label: `${t('ui.theme')}: ${t(`ui.${m}`)}`,
      group: act,
      icon: modeIcons[m],
      run: () => swap(() => window.__theme.set({ mode: m }))
    })),
    { label: 'GitHub', group: 'Links', icon: 'github', run: go(profile.github) },
    { label: 'LinkedIn', group: 'Links', icon: 'linkedin', run: go(profile.linkedin) }
  ];
  const q = query.trim().toLowerCase();
  const shown = q ? items.filter((i) => `${i.group} ${i.label}`.toLowerCase().includes(q)) : items;

  const choose = (item?: Item) => {
    if (!item) return;
    item.run();
    if (!item.label.startsWith(t('ui.copyEmail'))) dialog.current?.close();
  };

  return (
    <dialog
      ref={dialog}
      aria-label={t('ui.menu')}
      onClose={() => {
        setQuery('');
        setActive(0);
        setCopied(false);
      }}
      className="command mx-auto mt-[12vh] w-[min(36rem,calc(100vw-2rem))] rounded-lg border border-border bg-popover p-0 text-popover-foreground raised"
    >
      <input
        autoFocus
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const d = e.key === 'ArrowDown' ? 1 : -1;
            setActive((a) => (a + d + shown.length) % Math.max(shown.length, 1));
          } else if (e.key === 'Enter') choose(shown[active]);
        }}
        placeholder={t('ui.menuHint')}
        aria-label={t('ui.menuHint')}
        aria-activedescendant={shown[active] ? `cmd-${active}` : undefined}
        aria-controls="cmd-list"
        className="w-full border-b border-border bg-transparent px-4 py-3.5 text-base outline-none placeholder:text-muted-foreground"
      />
      <ul id="cmd-list" role="listbox" className="max-h-80 overflow-y-auto p-2">
        {shown.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted-foreground">{t('ui.menuEmpty')}</li>}
        {shown.map((item, i) => (
          <li key={item.group + item.label} id={`cmd-${i}`} role="option" aria-selected={i === active}>
            {(i === 0 || shown[i - 1].group !== item.group) && (
              <div className="px-3 pt-2 pb-1 text-xs text-muted-foreground">{item.group}</div>
            )}
            <button
              type="button"
              tabIndex={-1}
              onMouseMove={() => setActive(i)}
              onClick={() => choose(item)}
              className={`flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-left text-sm ${i === active ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            >
              <Icon key={item.icon} name={item.icon} size={16} play={i === active} />
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </dialog>
  );
}

// Sound off. lucide-animated has no muted speaker, so this one is drawn to match its stroke.
const MutedIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M11 5 6 9H3v6h3l5 4V5Z" />
    <path d="m16 9 5 6M21 9l-5 6" />
  </svg>
);
