import { cleanLocale, matchLocale, normalizeLocaleRouting } from "./options.js";
import type { LocaleRouting, LocaleRoutingOptions } from "./options.js";
import { LOCALE_RENDERED_ATTR, applyLocaleMeta } from "./view.js";

type LocaleListener = (locale: string) => void;

const listeners = new Set<LocaleListener>();
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

let routing: LocaleRouting = normalizeLocaleRouting();
let configured = false;

function configureLocaleRouting(options: LocaleRoutingOptions): LocaleRouting {
  routing = normalizeLocaleRouting(options);
  configured = true;
  return routing;
}

function getLocaleRouting(): LocaleRouting {
  return routing;
}

function resolveLocale(value: unknown): string {
  return configured ? matchLocale(value, routing) : cleanLocale(value);
}

function currentLocale(): string {
  if (typeof document === "undefined") return routing.defaultLocale;
  return resolveLocale(document.documentElement.lang) || routing.defaultLocale;
}

function stripLocalePrefix(pathname: string): string {
  const trimmed = String(pathname || "/").replace(/\/+$/u, "") || "/";
  const [, first = "", ...rest] = trimmed.split("/");
  const prefixed = configured && first !== routing.defaultLocale && routing.locales.includes(first);
  if (!prefixed) return trimmed;
  return `/${rest.join("/")}`.replace(/\/+$/u, "") || "/";
}

function currentRoutePath(): string {
  if (typeof window === "undefined") return "/";
  return stripLocalePrefix(window.location.pathname);
}

function persistLocale(locale: string): void {
  if (typeof document === "undefined") return;
  const name = encodeURIComponent(routing.cookieName);
  document.cookie = `${name}=${encodeURIComponent(locale)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  try {
    window.localStorage.setItem(routing.storageKey, locale);
  } catch {
    return;
  }
}

function setCurrentLocale(locale: unknown): boolean {
  const next = resolveLocale(locale);
  if (!next || typeof document === "undefined") return false;
  persistLocale(next);
  if (next === currentLocale()) return false;
  const root = document.documentElement;
  root.lang = next;
  root.setAttribute(LOCALE_RENDERED_ATTR, next);
  applyLocaleMeta(document, next);
  for (const listener of listeners) listener(next);
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
  currentRoutePath,
  getLocaleRouting,
  onLocaleChanged,
  persistLocale,
  setCurrentLocale,
  stripLocalePrefix,
};
export type { LocaleListener };
