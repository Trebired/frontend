import {
  A11Y_CHANGE_EVENT,
  A11Y_HIGH_CONTRAST_ATTR,
  A11Y_MOTION_PREF_ATTR,
  A11Y_REDUCE_MOTION_ATTR,
  A11Y_TEXT_SIZE_ATTR,
  REDUCED_MOTION_QUERY,
  systemPrefersReducedMotion,
} from "./attributes.js";
import { EMPTY_A11Y_SETTINGS, mergeA11ySettings, normalizeA11ySettings } from "./settings.js";
import { readStoredA11ySettings, writeStoredA11ySettings } from "./storage.js";

import type { FrontendA11ySettings, ResolvedFrontendA11ySettings } from "./types.js";

const HIGH_CONTRAST_QUERY = "(prefers-contrast: more)";

const syncListeners = new Set<(settings:ResolvedFrontendA11ySettings)=>void>();

let current: FrontendA11ySettings | null = null;

let cookieEnabled = false;

function systemPrefersHighContrast(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(HIGH_CONTRAST_QUERY).matches;
}

function resolveA11ySettings(settings: FrontendA11ySettings): ResolvedFrontendA11ySettings {
  const reduceMotion = settings.motion === "reduce"
  ||(settings.motion === "system" && systemPrefersReducedMotion());
  const highContrast = settings.contrast === "high"
  ||(settings.contrast === "system" && systemPrefersHighContrast());
  return { ...settings, highContrast, reduceMotion };
}

function getA11ySettings(): FrontendA11ySettings {
  if (current) return current;
  current = readStoredA11ySettings() || { ...EMPTY_A11Y_SETTINGS };
  return current;
}

function applyA11ySettings(settings: FrontendA11ySettings): ResolvedFrontendA11ySettings {
  const resolved = resolveA11ySettings(settings);
  if (typeof document === "undefined") return resolved;
  const root = document.documentElement;
  root.setAttribute(A11Y_MOTION_PREF_ATTR, resolved.motion);
  root.setAttribute(A11Y_REDUCE_MOTION_ATTR, resolved.reduceMotion ? "on" : "off");
  root.setAttribute(A11Y_TEXT_SIZE_ATTR, String(resolved.textSize));
  root.setAttribute(A11Y_HIGH_CONTRAST_ATTR, resolved.highContrast ? "on" : "off");
  return resolved;
}

function runA11ySync(resolved: ResolvedFrontendA11ySettings): void {
  for (const listener of syncListeners) listener(resolved);
}

function registerA11ySync(listener: (settings: ResolvedFrontendA11ySettings) => void): () => void {
  syncListeners.add(listener);
  return () => {
    syncListeners.delete(listener);
  };
}

function setA11yCookieEnabled(enabled: boolean): void {
  cookieEnabled = enabled;
}

function setA11ySettings(patch: Partial<FrontendA11ySettings>): ResolvedFrontendA11ySettings {
  current = mergeA11ySettings(getA11ySettings(), patch);
  const resolved = applyA11ySettings(current);
  writeStoredA11ySettings(current, cookieEnabled);
  runA11ySync(resolved);
  if (typeof document !== "undefined") {
    document.dispatchEvent(new CustomEvent(A11Y_CHANGE_EVENT, { detail: resolved }));
  }
  return resolved;
}

function configureA11yDefaults(defaults: unknown): FrontendA11ySettings {
  if (readStoredA11ySettings()) return getA11ySettings();
  current = normalizeA11ySettings(defaults);
  return current;
}

function onSystemA11yChange(): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const queries = [window.matchMedia(REDUCED_MOTION_QUERY), window.matchMedia(HIGH_CONTRAST_QUERY)];
  const handler = () => {
    runA11ySync(applyA11ySettings(getA11ySettings()));
  };
  for (const query of queries) query.addEventListener("change", handler);
  return () => {
    for (const query of queries) query.removeEventListener("change", handler);
  };
}

export {
  applyA11ySettings,
  configureA11yDefaults,
  getA11ySettings,
  onSystemA11yChange,
  registerA11ySync,
  resolveA11ySettings,
  runA11ySync,
  setA11yCookieEnabled,
  setA11ySettings,
  systemPrefersHighContrast,
};
