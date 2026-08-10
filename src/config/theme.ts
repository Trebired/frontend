import { assertPlainObject, invalidConfig, isPlainObject, normalizeBoolean } from "./shared.js";
import type {
  NormalizedFrontendThemeConfig,
  NormalizedFrontendThemeMode,
  FrontendThemeModeScheme,
  FrontendThemeTokens,
} from "./types.js";

const THEME_MODE_KEY_RE = /^[a-z0-9][a-z0-9_-]*$/iu;
const THEME_TOKEN_KEY_RE = /^[a-z0-9_-]+$/iu;
const THEME_MODE_FIELDS = ["label", "scheme", "tokens"];
const DARK_KEY_RE = /(^|[-_])dark([-_]|$)/iu;

function normalizeThemeTokens(value: unknown, pathLabel = "theme.tokens"): FrontendThemeTokens {
  if (value === undefined) return {};
  const source = assertPlainObject(value, pathLabel);
  const out: FrontendThemeTokens = {};
  for (const [key, item] of Object.entries(source).sort(([a], [b]) => a.localeCompare(b))) {
    if (!THEME_TOKEN_KEY_RE.test(key)) {
      throw invalidConfig(`${pathLabel}.${key} has an invalid token key`);
    }
    if (isPlainObject(item)) {
      out[key] = normalizeThemeTokens(item, `${pathLabel}.${key}`);
      continue;
    }
    if (typeof item !== "string" && typeof item !== "number") {
      throw invalidConfig(`${pathLabel}.${key} must be a string, number, or token object`);
    }
    out[key] = item;
  }
  return out;
}

function normalizeThemeModeKey(key: string): string {
  const normalized = String(key || "").trim().toLowerCase();
  if (!THEME_MODE_KEY_RE.test(normalized)) {
    throw invalidConfig(`theme.modes.${key} must start with a letter or number and contain only letters, numbers, underscores, or hyphens`);
  }
  return normalized;
}

function normalizeThemeModeScheme(value: unknown, key: string): FrontendThemeModeScheme {
  if (value === undefined) return DARK_KEY_RE.test(key) ? "dark" : "light";
  if (value !== "dark" && value !== "light") {
    throw invalidConfig(`theme.modes.${key}.scheme must be "dark" or "light"`);
  }
  return value;
}

function normalizeThemeModeLabel(value: unknown, key: string): string {
  if (value === undefined) {
    const words = key.replace(/[-_]+/gu, " ");
    return words.charAt(0).toUpperCase() + words.slice(1);
  }
  if (typeof value !== "string" || !value.trim()) {
    throw invalidConfig(`theme.modes.${key}.label must be a non-empty string`);
  }
  return value.trim();
}

function normalizeConfiguredThemeMode(rawKey: string, source: Record<string, unknown>): NormalizedFrontendThemeMode {
  const key = normalizeThemeModeKey(rawKey);
  for (const field of Object.keys(source)) {
    if (!THEME_MODE_FIELDS.includes(field)) {
      throw invalidConfig(`theme.modes.${key}.${field} is not supported; declare custom properties under theme.modes.${key}.tokens`);
    }
  }
  return {
    key,
    label: normalizeThemeModeLabel(source.label, key),
    scheme: normalizeThemeModeScheme(source.scheme, key),
    tokens: normalizeThemeTokens(source.tokens, `theme.modes.${key}.tokens`),
  };
}

function themeModeEntries(value: unknown): Array<[string, Record<string, unknown>]> {
  if (!Array.isArray(value)) {
    return Object.entries(assertPlainObject(value, "theme.modes")).map(([key, item]) => {
        return [key, assertPlainObject(item, `theme.modes.${key}`)];
    });
  }
  return value.map((item, index) => {
      const { key, ...rest } = assertPlainObject(item, `theme.modes[${index}]`);
      if (typeof key !== "string" || !key.trim()) {
        throw invalidConfig(`theme.modes[${index}].key must be a non-empty string`);
      }
      return [key, rest];
  });
}

function normalizeConfiguredThemeModes(value: unknown): NormalizedFrontendThemeMode[] {
  if (value === undefined) return [];
  const modes: NormalizedFrontendThemeMode[] = [];
  for (const [key, source] of themeModeEntries(value)) {
    const mode = normalizeConfiguredThemeMode(key, source);
    if (modes.some((existing) => existing.key === mode.key)) {
      throw invalidConfig(`theme.modes.${mode.key} is declared more than once`);
    }
    modes.push(mode);
  }
  return modes;
}

function resolveDeclaredMode(
  modes: NormalizedFrontendThemeMode[],
  value: unknown,
  pathLabel: string,
): string {
  if (value === undefined || value === "") return "";
  const key = String(value).trim().toLowerCase();
  if (!modes.some((mode) => mode.key === key)) {
    throw invalidConfig(`${pathLabel} must name a mode declared in theme.modes`);
  }
  return key;
}

function resolveSchemeMode(
  modes: NormalizedFrontendThemeMode[],
  value: unknown,
  scheme: FrontendThemeModeScheme,
  pathLabel: string,
): string {
  const explicit = resolveDeclaredMode(modes, value, pathLabel);
  if (explicit) return explicit;
  return modes.find((mode) => mode.scheme === scheme)?.key || "";
}

function normalizeThemeConfig(value: unknown): NormalizedFrontendThemeConfig {
  const source = value === undefined ? {} : assertPlainObject(value, "theme");
  const modes = normalizeConfiguredThemeModes(source.modes);
  return {
    cssVariables: normalizeBoolean(source.cssVariables, true, "theme.cssVariables"),
    dark: resolveSchemeMode(modes, source.dark, "dark", "theme.dark"),
    defaultMode: resolveDeclaredMode(modes, source.defaultMode, "theme.defaultMode"),
    light: resolveSchemeMode(modes, source.light, "light", "theme.light"),
    modes,
    tokens: normalizeThemeTokens(source.tokens),
  };
}

function flattenThemeTokens(
  tokens: FrontendThemeTokens,
  prefix: string[] = [],
): Array<[string, string | number]> {
  const out: Array<[string, string | number]> = [];
  for (const [key, value] of Object.entries(tokens).sort(([a], [b]) => a.localeCompare(b))) {
    if (isPlainObject(value)) {
      out.push(...flattenThemeTokens(value, [...prefix, key]));
      continue;
    }
    if (typeof value === "string" || typeof value === "number") {
      out.push([[...prefix, key].join("-"), value]);
    }
  }
  return out;
}

export { flattenThemeTokens, normalizeThemeConfig, normalizeThemeTokens };
