import { useLocale } from 'next-intl';
import type { Locale } from './config';

// Text used by one component only, kept next to it instead of in messages/: { pt: {...}, en: {...} }. The pt object
// sets the shape and every other locale must match it exactly. Returns the hook that picks the current locale's text.
export const defineCopy =
  <T,>(copy: { pt: T } & Record<Exclude<Locale, 'pt'>, NoInfer<T>>) =>
  (): T =>
    copy[useLocale()];
