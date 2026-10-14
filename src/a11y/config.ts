import { A11Y_CONFIG_ATTR } from "./attributes.js";
import { EMPTY_A11Y_SETTINGS, normalizeA11ySettings, TEXT_SIZES } from "./settings.js";

import type { A11yTextSize, FrontendA11ySettings } from "./types.js";

type FrontendA11yRuntimeConfig = {
  cookie: boolean;
  defaults: FrontendA11ySettings;
  textSizes: A11yTextSize[];
};

const EMPTY: FrontendA11yRuntimeConfig = {
  cookie: false,
  defaults: { ...EMPTY_A11Y_SETTINGS },
  textSizes: [...TEXT_SIZES],
};

let configured: FrontendA11yRuntimeConfig | null = null;

function textSizesOf(value: unknown): A11yTextSize[] {
  if (!Array.isArray(value)) return [...TEXT_SIZES];
  const sizes = value
  .map((entry) => Number(entry) as A11yTextSize)
  .filter((entry) => TEXT_SIZES.includes(entry));
  return sizes.length ? sizes : [...TEXT_SIZES];
}

function normalizeA11yRuntimeConfig(value: unknown): FrontendA11yRuntimeConfig {
  if (!value || typeof value !== "object") return EMPTY;
  const source = value as Record<string, unknown>;
  return {
    cookie: source.cookie === true,
    defaults: normalizeA11ySettings(source.defaults),
    textSizes: textSizesOf(source.textSizes),
  };
}

function configureFrontendA11y(value: unknown): FrontendA11yRuntimeConfig {
  configured = normalizeA11yRuntimeConfig(value);
  return configured;
}

function readDocumentA11y(): FrontendA11yRuntimeConfig | null {
  if (typeof document === "undefined") return null;
  const raw = document.documentElement.getAttribute(A11Y_CONFIG_ATTR);
  if (!raw) return null;
  try {
    return normalizeA11yRuntimeConfig(JSON.parse(raw));
  } catch {
    return null;
  }
}

function getFrontendA11y(): FrontendA11yRuntimeConfig {
  if (configured) return configured;
  const fromDocument = readDocumentA11y();
  if (fromDocument) configured = fromDocument;
  return configured || EMPTY;
}

export { configureFrontendA11y, getFrontendA11y, normalizeA11yRuntimeConfig };
export type { FrontendA11yRuntimeConfig };
