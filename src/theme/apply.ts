import type { BindRoot } from "#er0dlx1gtbzh";
import { frontendCssVar } from "#5vbaqj4pirp3";
import { THEME_ATTR, THEME_CHANGE_EVENT, THEME_SWITCHING_ATTR } from "./constants.js";
import { findThemeMode, getThemeModes, themeModeKeyOf } from "./modes.js";
import type { ThemeBrowserSyncOptions } from "./browser-sync.js";
import type { ThemeModeOptions, ThemeModeScheme } from "./modes.js";

type ThemeValue = string;

type ThemePersistenceAdapter = {
  get?: () => Promise<string|null|undefined>|string | null | undefined;
  set?: (theme: ThemeValue) => Promise<unknown>|unknown;
};

type ThemeRuntimeOptions = ThemeModeOptions& {
  defaultTheme?: ThemeValue;
  persistence?: ThemePersistenceAdapter;
  sync?: ThemeBrowserSyncOptions;
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

function deviceScheme(): ThemeModeScheme {
  return systemPrefersLight() ? "light" : "dark";
}

function applyDeviceScheme(): ThemeModeScheme {
  const scheme = deviceScheme();
  if (typeof document !== "undefined") {
    document.documentElement.style.colorScheme = scheme;
  }
  return scheme;
}

function onDeviceSchemeChange(handler: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  let query: MediaQueryList | null = null;
  try {
    query = window.matchMedia("(prefers-color-scheme: light)");
  } catch {
    return () => {};
  }
  const listener = () => handler();
  query.addEventListener?.("change", listener);
  return () => query?.removeEventListener?.("change", listener);
}

function systemThemeKey(options: ThemeRuntimeOptions = {}): ThemeValue {
  const registry = getThemeModes(options);
  return systemPrefersLight() ? registry.light : registry.dark;
}

/**
 * A view-transition switch commits the attribute from its callback, which the
 * browser runs a frame later — so between `applyTheme()` and that commit the
 * DOM still reads the old theme. `pendingTheme` holds the value already
 * decided on, otherwise a second toggle click landing inside that window
 * computes `nextTheme()` from the stale one and switches back.
 */
let pendingTheme: ThemeValue = "";

function currentDomTheme(options: ThemeRuntimeOptions = {}): ThemeValue {
  if (typeof document === "undefined") return "";
  if (pendingTheme) return pendingTheme;
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

type ThemeSwitchMode = "instant" | "uniform";
type ViewTransitionHandle = { finished: Promise<unknown> };

const THEME_SWITCH_BUFFER_MS = 120;
const THEME_SWITCH_DEFAULT_MS = 240;

let themeSwitchTimer: ReturnType<typeof setTimeout> | null = null;

function endThemeSwitch(): void {
  if (typeof document === "undefined") return;
  document.documentElement.removeAttribute(THEME_SWITCHING_ATTR);
  if (themeSwitchTimer) clearTimeout(themeSwitchTimer);
  themeSwitchTimer = null;
}

/**
 * Suppresses (`"instant"`) or unifies (`"uniform"`) per-element transitions
 * for the length of a switch — see `styles/utils/base.scss`. The hold is a
 * plain timer: a `transitionend` listener would receive one bubbled event per
 * element per property, which on a real page is tens of thousands of events.
 */
function beginThemeSwitch(mode: ThemeSwitchMode, holdMs: number): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute(THEME_SWITCHING_ATTR, mode);
  if (themeSwitchTimer) clearTimeout(themeSwitchTimer);
  themeSwitchTimer = setTimeout(endThemeSwitch, holdMs);
}

function themeSwitchDurationMs(): number {
  try {
    const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(frontendCssVar("transition-normal"))
    .trim();
    if (raw.endsWith("ms")) return Number.parseFloat(raw) || THEME_SWITCH_DEFAULT_MS;
    if (raw.endsWith("s")) return (Number.parseFloat(raw) || 0.24) * 1000;
  } catch {
    // an unreadable token just means the default hold below
  }
  return THEME_SWITCH_DEFAULT_MS;
}

function prefersReducedMotion(): boolean {
  try {
    return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  } catch {
    return false;
  }
}

function startViewTransition(run: () => void): ViewTransitionHandle | null {
  const start = (
    document as unknown as {
      startViewTransition?: (callback: () => void) => ViewTransitionHandle;
    }
  ).startViewTransition;
  if (typeof start !== "function") return null;
  try {
    return start.call(document, run);
  } catch {
    return null;
  }
}

function commitTheme(
  next: ThemeValue,
  normalized: ThemeValue,
  previous: ThemeValue,
  options: ThemeRuntimeOptions,
): void {
  pendingTheme = "";
  document.documentElement.setAttribute(THEME_ATTR, next);
  applyDeviceScheme();
  document.body?.setAttribute(THEME_ATTR, next);
  if (previous !== next) dispatchThemeChange(normalized, next);
  runThemeSync(document);
  void options;
}

/**
 * A theme switch changes the CSS vars every element reads at once, and the
 * browser cannot tell that from a hover — so each element animated on its own
 * locally tuned duration and the switch looked staggered. Animating them
 * together instead is not the fix either: a page's worth of `background-color`
 * /`box-shadow` transitions are main-thread paint work, which janks (and the
 * stagger comes back, since paint lands in chunks) and still leaves out
 * everything that has no transitionable property at all — gradients, images,
 * native scrollbars.
 *
 * So the whole page cross-fades as a single compositor-driven animation via
 * the View Transitions API, with per-element transitions suppressed
 * underneath. That is uniform by construction: one animation, not thousands.
 * Browsers without the API fall back to one shared duration for the
 * color-affecting properties, which is the best a per-element approach can do.
 */
function applyTheme(theme: ThemeValue, options: ThemeRuntimeOptions = {}): ThemeValue {
  if (typeof document === "undefined") return getEffectiveTheme(theme, options);
  const normalized = normalizeTheme(theme, options);
  const next = normalized || systemThemeKey(options);
  const previous = currentDomTheme(options);
  const commit = () => commitTheme(next, normalized, previous, options);

  if (previous === next) {
    commit();
    return next;
  }
  const hold = themeSwitchDurationMs() + THEME_SWITCH_BUFFER_MS;
  if (prefersReducedMotion()) {
    beginThemeSwitch("instant", THEME_SWITCH_BUFFER_MS);
    commit();
    return next;
  }
  pendingTheme = next;
  const transition = startViewTransition(() => {
      beginThemeSwitch("instant", hold);
      commit();
  });
  if (transition) {
    void Promise.resolve(transition.finished).then(endThemeSwitch, endThemeSwitch);
    return next;
  }
  pendingTheme = "";
  beginThemeSwitch("uniform", hold);
  commit();
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
  applyDeviceScheme,
  applyTheme,
  currentDomTheme,
  getEffectiveTheme,
  deviceScheme,
  nextTheme,
  normalizeTheme,
  onDeviceSchemeChange,
  readPersistedTheme,
  registerThemeSync,
  runThemeSync,
  setTheme,
  systemThemeKey,
  themeScheme,
};
export type { ThemePersistenceAdapter, ThemeRuntimeOptions, ThemeSyncListener, ThemeValue };
