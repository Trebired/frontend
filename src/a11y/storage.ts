import { FRONTEND_PREFIX } from "./../namespace/index.js";
import { normalizeA11ySettings } from "./settings.js";

import type { FrontendA11ySettings } from "./types.js";

const A11Y_STORAGE_KEY = `${FRONTEND_PREFIX}.a11y`;

const A11Y_COOKIE_NAME = "ui_a11y";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function parsePayload(raw: string | null): FrontendA11ySettings | null {
  if (!raw) return null;
  try {
    return normalizeA11ySettings(JSON.parse(raw));
  } catch {
    return null;
  }
}

function cookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`, "u"));
  return match ? decodeURIComponent(match[1] as string) : null;
}

function readStoredA11ySettings(): FrontendA11ySettings | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = parsePayload(window.localStorage.getItem(A11Y_STORAGE_KEY));
    if (stored) return stored;
  } catch {
    return parsePayload(cookieValue(A11Y_COOKIE_NAME));
  }
  return parsePayload(cookieValue(A11Y_COOKIE_NAME));
}

function writeStoredA11ySettings(settings: FrontendA11ySettings, cookie = false): void {
  const payload = JSON.stringify(settings);
  try {
    window.localStorage.setItem(A11Y_STORAGE_KEY, payload);
  } catch {
    void 0;
  }
  if (!cookie || typeof document === "undefined") return;
  const value = encodeURIComponent(payload);
  document.cookie = `${A11Y_COOKIE_NAME}=${value}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export { A11Y_COOKIE_NAME, A11Y_STORAGE_KEY, readStoredA11ySettings, writeStoredA11ySettings };
