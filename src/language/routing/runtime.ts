import { matchLocale, normalizeLocaleRouting } from "./options.js";
import type { LocaleRouting, LocaleRoutingOptions } from "./options.js";
import { buildLocalePathname, parseLocalePathname } from "./path.js";

type LocaleListener = (locale: string) => void;

const listeners = new Set<LocaleListener>();

let routing: LocaleRouting = normalizeLocaleRouting();

function configureLocaleRouting(options: LocaleRoutingOptions): LocaleRouting {
  routing = normalizeLocaleRouting(options);
  return routing;
}

function getLocaleRouting(): LocaleRouting {
  return routing;
}

function currentLocale(): string {
  if (typeof window === "undefined") return routing.defaultLocale;
  return parseLocalePathname(window.location.pathname, routing).locale;
}

function persistLocale(locale: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(routing.storageKey, locale);
  } catch {
    return;
  }
}

function localeHref(locale: string): string {
  const parsed = parseLocalePathname(window.location.pathname, routing);
  const pathname = buildLocalePathname(parsed.pathname, locale, routing);
  return `${pathname}${window.location.search}${window.location.hash}`;
}

function setCurrentLocale(locale: unknown): boolean {
  const next = matchLocale(locale, routing);
  if (!next || typeof window === "undefined") return false;
  persistLocale(next);
  if (next === currentLocale()) return false;
  for (const listener of listeners) listener(next);
  window.location.assign(localeHref(next));
  return true;
}

function onLocaleChanged(listener: LocaleListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export {
  configureLocaleRouting,
  currentLocale,
  getLocaleRouting,
  localeHref,
  onLocaleChanged,
  persistLocale,
  setCurrentLocale,
};
export type { LocaleListener };
