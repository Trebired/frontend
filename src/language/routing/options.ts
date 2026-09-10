import { FRONTEND_PREFIX } from "#5vbaqj4pirp3";

type LocaleRoutingOptions = {
  cookieName?: string;
  defaultLocale?: string;
  locales?: readonly string[];
  storageKey?: string;
};

type LocaleRouting = {
  cookieName: string;
  defaultLocale: string;
  locales: string[];
  storageKey: string;
};

const DEFAULT_LOCALE_STORAGE_KEY = `${FRONTEND_PREFIX}.locale`;
const DEFAULT_LOCALE_COOKIE_NAME = "ui_lang";

function cleanLocale(value: unknown): string {
  return String(value ?? "").trim().toLowerCase().replace(/_/gu, "-");
}

function normalizeLocaleRouting(options: LocaleRoutingOptions = {}): LocaleRouting {
  const declared = [...new Set((options.locales || []).map(cleanLocale).filter(Boolean))];
  const fallback = cleanLocale(options.defaultLocale) || declared[0] || "en";
  const locales = declared.includes(fallback) ? declared : [fallback, ...declared];
  return {
    cookieName: String(options.cookieName || DEFAULT_LOCALE_COOKIE_NAME),
    defaultLocale: fallback,
    locales: locales.length ? locales : [fallback],
    storageKey: String(options.storageKey || DEFAULT_LOCALE_STORAGE_KEY),
  };
}

function matchLocale(value: unknown, routing: LocaleRouting): string {
  const cleaned = cleanLocale(value);
  if (!cleaned) return "";
  if (routing.locales.includes(cleaned)) return cleaned;
  const base = cleaned.split("-")[0];
  return routing.locales.includes(base) ? base : "";
}

function pickLocale(values: Iterable<unknown>, routing: LocaleRouting): string {
  for (const value of values) {
    const matched = matchLocale(value, routing);
    if (matched) return matched;
  }
  return "";
}

export {
  DEFAULT_LOCALE_COOKIE_NAME,
  DEFAULT_LOCALE_STORAGE_KEY,
  cleanLocale,
  matchLocale,
  normalizeLocaleRouting,
  pickLocale,
};
export type { LocaleRouting, LocaleRoutingOptions };
