import type { BindRoot } from "#er0dlx1gtbzh";
import { THEME_ATTR, THEME_CHANGE_EVENT } from "./constants.js";
import { findThemeMode, getThemeModes, themeModeKeyOf } from "./modes.js";
import type { ThemeModeOptions, ThemeModeScheme } from "./modes.js";

type ThemeValue = string;

type ThemePersistenceAdapter = {
  get?: () => Promise<string | null | undefined> | string | null | undefined;
  set?: (theme: ThemeValue) => Promise<unknown> | unknown;
};

type ThemeRuntimeOptions = ThemeModeOptions & {
  defaultTheme?: ThemeValue;
  persistence?: ThemePersistenceAdapter;
};

type ThemeSyncListener = (root: BindRoot) => void;

const themeSyncListeners = new Set<ThemeSyncListener>();

function registerThemeSync(listener: ThemeSyncListener): void {
  themeSyncListeners.add(listener);
}

function runThemeSync(root: BindRoot = document): void {
  themeSyncListeners.forEach((listener) => listener(root));
}

function normalizeTheme(value: unknown, options: ThemeRuntimeOptions = {}): ThemeValue {
  const key = themeModeKeyOf(value);
  return key && findThemeMode(key, options) ? key : "";
}

function systemPrefersLight(): boolean {
  try {
    return Boolean(window.matchMedia?.("(prefers-color-scheme: light)").matches);
  } catch {
    return false;
  }
}

function systemThemeKey(options: ThemeRuntimeOptions = {}): ThemeValue {
  const registry = getThemeModes(options);
  return systemPrefersLight() ? registry.light : registry.dark;
}

function currentDomTheme(options: ThemeRuntimeOptions = {}): ThemeValue {
  if (typeof document === "undefined") return "";
  return normalizeTheme(document.documentElement.getAttribute(THEME_ATTR), options);
}

function getEffectiveTheme(value?: unknown, options: ThemeRuntimeOptions = {}): ThemeValue {
  return normalizeTheme(value, options) || currentDomTheme(options) || systemThemeKey(options);
}

function themeScheme(key: unknown, options: ThemeRuntimeOptions = {}): ThemeModeScheme {
  return findThemeMode(key, options)?.scheme || "light";
}

function dispatchThemeChange(theme: ThemeValue, themeKey: ThemeValue): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(THEME_CHANGE_EVENT, {
        detail: { theme, themeKey },
    }),
  );
}

function applyTheme(theme: ThemeValue, options: ThemeRuntimeOptions = {}): ThemeValue {
  if (typeof document === "undefined") return getEffectiveTheme(theme, options);
  const normalized = normalizeTheme(theme, options);
  const next = normalized || systemThemeKey(options);
  const previous = currentDomTheme(options);
  document.documentElement.setAttribute(THEME_ATTR, next);
  document.documentElement.style.colorScheme = themeScheme(next, options);
  document.body?.setAttribute(THEME_ATTR, next);
  if (previous !== next) dispatchThemeChange(normalized, next);
  runThemeSync(document);
  return next;
}

async function readPersistedTheme(
  adapter?: ThemePersistenceAdapter,
  options: ThemeRuntimeOptions = {},
): Promise<ThemeValue> {
  if (!adapter?.get) return "";
  try {
    return normalizeTheme(await adapter.get(), options);
  } catch {
    return "";
  }
}

async function setTheme(theme: ThemeValue, options: ThemeRuntimeOptions = {}): Promise<ThemeValue> {
  const normalized = normalizeTheme(theme, options);
  applyTheme(normalized, options);
  if (options.persistence?.set) {
    try {
      await options.persistence.set(normalized);
    } catch {}
  }
  return getEffectiveTheme(normalized, options);
}

function nextTheme(options: ThemeRuntimeOptions = {}): ThemeValue {
  const keys = getThemeModes(options).modes.map((mode) => mode.key);
  const index = keys.indexOf(getEffectiveTheme(undefined, options));
  return keys[(index + 1) % keys.length] || keys[0];
}

export {
  applyTheme,
  currentDomTheme,
  getEffectiveTheme,
  nextTheme,
  normalizeTheme,
  readPersistedTheme,
  registerThemeSync,
  runThemeSync,
  setTheme,
  systemThemeKey,
  themeScheme,
};
export type { ThemePersistenceAdapter, ThemeRuntimeOptions, ThemeSyncListener, ThemeValue };
