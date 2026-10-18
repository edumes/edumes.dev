import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { locales } from './config';
import pt from './messages/pt.json';
import en from './messages/en.json';

// Both files must have the same keys: one missing on either side fails the type check, and with it `next build`.
en satisfies typeof pt;
pt satisfies typeof en;

const messages = { pt, en };

// Static export: no [locale] segment and no middleware, so every route file calls setRequestLocale with its locale.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(locales, requested) ? requested : 'pt';
  return { locale, messages: messages[locale] };
});
