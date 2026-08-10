import { assertPlainObject, invalidConfig, isPlainObject } from "./shared.js";
import { normalizeThemeTokens } from "./theme.js";
import { DEFAULT_FRONTEND_COMPONENTS_CONFIG } from "./default-component-tokens.js";
import type {
  NormalizedFrontendComponentsConfig,
  FrontendComponentTokens,
  FrontendComponentsConfig,
} from "./types.js";

const COMPONENT_KEY_RE = /^[a-z][a-z0-9]*$/iu;

const COMPONENT_GROUP_KEYS = Object.keys(
  DEFAULT_FRONTEND_COMPONENTS_CONFIG,
) as Array<keyof FrontendComponentsConfig>;

function componentKeys(group: keyof FrontendComponentsConfig) {
  return Object.keys(
    DEFAULT_FRONTEND_COMPONENTS_CONFIG[group],
  );
}

function mergeComponentTokens(
  base: FrontendComponentTokens,
  override: FrontendComponentTokens,
): FrontendComponentTokens {
  const out: FrontendComponentTokens = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const previous = out[key];
    out[key] = isPlainObject(previous) && isPlainObject(value)
    ? mergeComponentTokens(previous, value)
    : value;
  }
  return out;
}

function normalizeComponentGroupKey(key: string): keyof FrontendComponentsConfig {
  if (!COMPONENT_KEY_RE.test(key)) {
    throw invalidConfig(`components.${key} must start with a letter and contain only letters or numbers`);
  }
  if (!COMPONENT_GROUP_KEYS.includes(key as keyof FrontendComponentsConfig)) {
    throw invalidConfig(`components.${key} is not a supported component group`);
  }
  return key as keyof FrontendComponentsConfig;
}

function normalizeComponentKey(group: keyof FrontendComponentsConfig, key: string) {
  if (!COMPONENT_KEY_RE.test(key)) {
    throw invalidConfig(`components.${String(group)}.${key} must start with a letter and contain only letters or numbers`);
  }
  if (!componentKeys(group).includes(key)) {
    throw invalidConfig(`components.${String(group)}.${key} is not a supported component`);
  }
  return key;
}

function normalizeComponentsConfig(value: unknown): NormalizedFrontendComponentsConfig {
  const source = value === undefined ? {} : assertPlainObject(value, "components");
  const config = { ...DEFAULT_FRONTEND_COMPONENTS_CONFIG };
  for (const [rawGroup, rawComponents] of Object.entries(source)) {
    const group = normalizeComponentGroupKey(rawGroup);
    const components = assertPlainObject(rawComponents, `components.${group}`);
    config[group] = { ...config[group] } as any;
    for (const [rawKey, rawTokens] of Object.entries(components)) {
      const key = normalizeComponentKey(group, rawKey);
      const tokens = normalizeThemeTokens(rawTokens, `components.${group}.${key}`);
      (config[group] as any)[key] = mergeComponentTokens(
        (config[group] as any)[key],
        tokens,
      );
    }
  }
  return config;
}

export {
  DEFAULT_FRONTEND_COMPONENTS_CONFIG,
  normalizeComponentsConfig,
};
