import { THEME_MODES_GLOBAL_KEY } from "./constants.js";

type ThemeModeScheme = "dark" | "light";

type ThemeModeDescriptor = {
  key: string;
  label?: string;
  scheme?: ThemeModeScheme;
};

type ThemeModeInput = string | ThemeModeDescriptor;

type ThemeMode = {
  key: string;
  label: string;
  scheme: ThemeModeScheme;
};

type ThemeModeOptions = {
  dark?: string;
  light?: string;
  modes?: readonly ThemeModeInput[];
};

type ThemeModeRegistry = {
  dark: string;
  light: string;
  modes: readonly ThemeMode[];
};

const DEFAULT_THEME_MODE_KEYS: readonly string[] = ["dark", "light"];
const THEME_MODE_KEY_RE = /^[a-z0-9][a-z0-9_-]*$/u;
const DARK_KEY_RE = /(^|[-_])dark([-_]|$)/u;
const registryHolderKey = Symbol.for(THEME_MODES_GLOBAL_KEY);

let cachedSource: unknown = null;
let cachedRegistry: ThemeModeRegistry | null = null;

function themeModeKeyOf(value: unknown): string {
  const text = String(value ?? "").trim().toLowerCase();
  return THEME_MODE_KEY_RE.test(text) ? text : "";
}

function themeModeLabelOf(key: string, label?: unknown): string {
  const text = String(label ?? "").trim();
  if (text) return text;
  const words = key.replace(/[-_]+/gu, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function themeModeSchemeOf(key: string, scheme?: unknown): ThemeModeScheme {
  const text = String(scheme ?? "").trim().toLowerCase();
  if (text === "dark" || text === "light") return text;
  return DARK_KEY_RE.test(key) ? "dark" : "light";
}

function normalizeThemeMode(input: ThemeModeInput): ThemeMode | null {
  const source = typeof input === "string" ? { key: input } : input;
  const key = themeModeKeyOf(source?.key);
  if (!key) return null;
  return {
    key,
    label: themeModeLabelOf(key, source?.label),
    scheme: themeModeSchemeOf(key, source?.scheme),
  };
}

function normalizeThemeModes(inputs?: readonly ThemeModeInput[]): ThemeMode[] {
  const source = Array.isArray(inputs) && inputs.length ? inputs : DEFAULT_THEME_MODE_KEYS;
  const modes: ThemeMode[] = [];
  for (const input of source) {
    const mode = normalizeThemeMode(input);
    if (mode && !modes.some((item) => item.key === mode.key)) modes.push(mode);
  }
  return modes.length ? modes : normalizeThemeModes(DEFAULT_THEME_MODE_KEYS);
}

function resolveSchemeKey(modes: readonly ThemeMode[], requested: unknown, scheme: ThemeModeScheme): string {
  const key = themeModeKeyOf(requested);
  if (key && modes.some((mode) => mode.key === key)) return key;
  return (modes.find((mode) => mode.scheme === scheme) || modes[0]).key;
}

function normalizeThemeModeRegistry(options: ThemeModeOptions = {}): ThemeModeRegistry {
  const modes = normalizeThemeModes(options.modes);
  return {
    dark: resolveSchemeKey(modes, options.dark, "dark"),
    light: resolveSchemeKey(modes, options.light, "light"),
    modes,
  };
}

const DEFAULT_THEME_MODE_REGISTRY: ThemeModeRegistry = normalizeThemeModeRegistry();

function readRegistryHolder(): ThemeModeRegistry | null {
  const holder = globalThis as unknown as Record<symbol, unknown>;
  const source = holder[registryHolderKey];
  if (!source || typeof source !== "object") return null;
  if (source === cachedSource && cachedRegistry) return cachedRegistry;
  cachedSource = source;
  cachedRegistry = normalizeThemeModeRegistry(source as ThemeModeOptions);
  return cachedRegistry;
}

function configureThemeModes(options?: ThemeModeOptions | null): ThemeModeRegistry {
  const holder = globalThis as unknown as Record<symbol, unknown>;
  if (!options) {
    delete holder[registryHolderKey];
    cachedSource = null;
    cachedRegistry = null;
    return DEFAULT_THEME_MODE_REGISTRY;
  }
  const registry = normalizeThemeModeRegistry(options);
  holder[registryHolderKey] = registry;
  cachedSource = registry;
  cachedRegistry = registry;
  return registry;
}

function hasThemeModeOptions(options: ThemeModeOptions = {}): boolean {
  return Boolean(options.modes?.length || options.dark || options.light);
}

function getThemeModes(options: ThemeModeOptions = {}): ThemeModeRegistry {
  if (hasThemeModeOptions(options)) return normalizeThemeModeRegistry(options);
  return readRegistryHolder() || DEFAULT_THEME_MODE_REGISTRY;
}

function themeModeKeys(options: ThemeModeOptions = {}): string[] {
  return getThemeModes(options).modes.map((mode) => mode.key);
}

function findThemeMode(key: unknown, options: ThemeModeOptions = {}): ThemeMode | undefined {
  const normalized = themeModeKeyOf(key);
  return normalized
  ? getThemeModes(options).modes.find((mode) => mode.key === normalized)
  : undefined;
}

function isThemeMode(key: unknown, options: ThemeModeOptions = {}): boolean {
  return findThemeMode(key, options) !== undefined;
}

export {
  DEFAULT_THEME_MODE_KEYS,
  DEFAULT_THEME_MODE_REGISTRY,
  configureThemeModes,
  findThemeMode,
  getThemeModes,
  hasThemeModeOptions,
  isThemeMode,
  normalizeThemeMode,
  normalizeThemeModeRegistry,
  themeModeKeyOf,
  themeModeKeys,
};
export type {
  ThemeMode,
  ThemeModeDescriptor,
  ThemeModeInput,
  ThemeModeOptions,
  ThemeModeRegistry,
  ThemeModeScheme,
};
