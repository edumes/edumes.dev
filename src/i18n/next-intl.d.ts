import type { Locale } from './config';
import type pt from './messages/pt.json';

// Typed keys for t(), and typed useMessages()/useLocale().
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof pt;
  }
}
