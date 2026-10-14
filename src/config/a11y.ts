import { assertPlainObject, invalidConfig } from "./shared.js";
import { CONTRAST_VALUES, EMPTY_A11Y_SETTINGS, MOTION_VALUES, TEXT_SIZES } from "./../a11y/settings.js";

import type { NormalizedFrontendA11yConfig } from "./types.js";
import type { A11yTextSize, FrontendA11ySettings } from "./../a11y/types.js";

const A11Y_FIELDS = ["cookie", "defaults", "textSizes"];

const DEFAULTS_FIELDS = ["contrast", "motion", "textSize"];

const EMPTY_A11Y_CONFIG: NormalizedFrontendA11yConfig = Object.freeze({
    cookie: false,
    defaults: Object.freeze({ ...EMPTY_A11Y_SETTINGS }) as NormalizedFrontendA11yConfig["defaults"],
    textSizes: Object.freeze([...TEXT_SIZES]) as unknown as A11yTextSize[],
});

function oneOf(value: unknown, allowed: readonly string[], pathLabel: string, fallback: string): string {
  if (value === undefined) return fallback;
  const next = String(value).trim().toLowerCase();
  if (!allowed.includes(next)) throw invalidConfig(`${pathLabel} must be one of ${allowed.join(", ")}`);
  return next;
}

function textSizeOf(value: unknown, pathLabel: string): A11yTextSize {
  const next = Number(value);
  if (!TEXT_SIZES.includes(next as A11yTextSize)) {
    throw invalidConfig(`${pathLabel} must be one of ${TEXT_SIZES.join(", ")}`);
  }
  return next as A11yTextSize;
}

function normalizeDefaults(value: unknown): NormalizedFrontendA11yConfig["defaults"] {
  if (value === undefined) return { ...EMPTY_A11Y_SETTINGS };
  const source = assertPlainObject(value, "config.a11y.defaults");
  for (const key of Object.keys(source)) {
    if (!DEFAULTS_FIELDS.includes(key)) throw invalidConfig(`config.a11y.defaults.${key} is not supported`);
  }
  const contrast = oneOf(source.contrast, CONTRAST_VALUES, "config.a11y.defaults.contrast", EMPTY_A11Y_SETTINGS.contrast);
  const motion = oneOf(source.motion, MOTION_VALUES, "config.a11y.defaults.motion", EMPTY_A11Y_SETTINGS.motion);
  return {
    contrast: contrast as FrontendA11ySettings["contrast"],
    motion: motion as FrontendA11ySettings["motion"],
    textSize: source.textSize === undefined
    ? EMPTY_A11Y_SETTINGS.textSize
    : textSizeOf(source.textSize, "config.a11y.defaults.textSize"),
  };
}

function normalizeTextSizes(value: unknown): A11yTextSize[] {
  if (value === undefined) return [...TEXT_SIZES];
  if (!Array.isArray(value) || value.length === 0) {
    throw invalidConfig("config.a11y.textSizes must list at least one size");
  }
  return value.map((entry, index) => textSizeOf(entry, `config.a11y.textSizes[${index}]`));
}

function normalizeA11yConfig(value: unknown): NormalizedFrontendA11yConfig {
  if (value === undefined) return EMPTY_A11Y_CONFIG;
  const source = assertPlainObject(value, "config.a11y");
  for (const key of Object.keys(source)) {
    if (!A11Y_FIELDS.includes(key)) throw invalidConfig(`config.a11y.${key} is not supported`);
  }
  return {
    cookie: source.cookie === undefined ? false : Boolean(source.cookie),
    defaults: normalizeDefaults(source.defaults),
    textSizes: normalizeTextSizes(source.textSizes),
  };
}

export { EMPTY_A11Y_CONFIG, normalizeA11yConfig };
