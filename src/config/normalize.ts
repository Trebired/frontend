import { normalizeA11yConfig } from "./a11y.js";
import { DEFAULT_FRONTEND_CONFIG, SUPPORTED_ICON_PACKS, SYSTEM_ORDER, THEME_MODE_ATTRIBUTE } from "./default/config.js";
import { normalizeLanguageConfig } from "./language.js";
import { normalizeLinksConfig } from "./links.js";
import { normalizeMoneyConfig } from "./money.js";
import { assertPlainObject, invalidConfig } from "./shared.js";
import { normalizeComponentsConfig } from "./component-tokens.js";
import { normalizeFaviconConfig } from "./favicon.js";
import { normalizeFontsConfig } from "./fonts.js";
import { normalizeGlassConfig } from "./glass.js";
import { normalizeInteractionsConfig } from "./interactions.js";
import { normalizePaletteConfig } from "./palette.js";
import { normalizeScalesConfig } from "./scales.js";
import { normalizeFlagsConfig } from "./flags.js";
import { normalizeBreakpointsConfig } from "./breakpoints.js";
import { normalizeThemeConfig, normalizeThemeTokens } from "./theme.js";
import {
  frontendConfigPath,
  PACKAGE_VERSION,
} from "./package.js";
import { normalizeContainersConfig } from "./containers.js";
import { normalizeIconAliasKey, normalizeIconAliasSpec } from "#rqcj8y6keks2";
import { resolveForVersion } from "@trebired/utils";
import type {
  NormalizedFrontendConfig,
  FrontendAssetsConfig,
  FrontendDesignConfig,
  FrontendIconPack,
  FrontendRuntimeConfig,
  FrontendSystemKey,
} from "./types.js";

type NormalizeOptions = {
  configPath?: string;
  requireForVersion?: boolean;
};

const FRONTEND_CONFIG_PATH = frontendConfigPath();

const TOP_LEVEL_FIELDS = [
  "a11y",
  "assets",
  "components",
  "containers",
  "design",
  "forVersion",
  "language",
  "links",
  "money",
  "runtime",
  "systems",
];

const ASSET_FIELDS = ["favicon", "flags", "fonts", "icons"];
const ICON_FIELDS = ["aliases", "endpoint", "mode", "packs", "specs"];
const DESIGN_FIELDS = [
  "breakpoints",
  "glass",
  "interactions",
  "palette",
  "scales",
  "scrollBehavior",
  "semantics",
];
const SCROLL_BEHAVIORS = ["auto", "smooth"];
const RUNTIME_FIELDS = ["layer", "layout", "progress", "theme"];

function assertKnownFields(
  source: Record<string, unknown>,
  allowed: readonly string[],
  pathLabel: string,
) {
  for (const key of Object.keys(source)) {
    if (!allowed.includes(key)) {
      throw invalidConfig(`${pathLabel}.${key} is not supported`);
    }
  }
}

function normalizeIconMode(value: unknown): NormalizedFrontendConfig["assets"]["icons"]["mode"] {
  const mode = String(value || DEFAULT_FRONTEND_CONFIG.assets.icons.mode).trim().toLowerCase();
  if (mode === "server" || mode === "static") return mode;
  throw invalidConfig("assets.icons.mode must be server or static");
}

function normalizeEndpoint(
  value: unknown,
  mode: NormalizedFrontendConfig["assets"]["icons"]["mode"],
): string {
  if (value === false) {
    if (mode === "static") return "";
    throw invalidConfig("assets.icons.endpoint can be false only when assets.icons.mode is static");
  }
  const fallback = mode === "static" ? "" : DEFAULT_FRONTEND_CONFIG.assets.icons.endpoint;
  const endpoint = String(value || fallback).trim();
  if (!endpoint && mode === "static") return "";
  if (!endpoint || /[\s"'<>]/u.test(endpoint)) {
    throw invalidConfig("assets.icons.endpoint must be a URL path without whitespace");
  }
  return endpoint;
}

function normalizeConfigIconPack(value: unknown): FrontendIconPack {
  const pack = String(value || "").trim().toLowerCase().replace(/_/gu, "-");
  if (pack === "simpleicons") return "simple-icons";
  if (!/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/u.test(pack)) {
    throw invalidConfig(`invalid icon pack ${String(value)}`);
  }
  return pack;
}

function normalizeIconPacks(value: unknown): FrontendIconPack[] {
  const raw = value === undefined ? DEFAULT_FRONTEND_CONFIG.assets.icons.packs : value;
  if (!Array.isArray(raw)) throw invalidConfig("assets.icons.packs must be an array");
  const packs: FrontendIconPack[] = [];
  for (const item of raw) {
    const pack = normalizeConfigIconPack(item);
    if (!packs.includes(pack)) packs.push(pack);
  }
  return packs;
}

function normalizeIconAliases(value: unknown): Record<string, string> {
  if (value === undefined) return { ...DEFAULT_FRONTEND_CONFIG.assets.icons.aliases };
  const source = assertPlainObject(value, "assets.icons.aliases");
  const aliases: Record<string, string> = {};
  for (const [rawKey, rawSpec] of Object.entries(source)) {
    const key = normalizeIconAliasKey(rawKey);
    if (!key) throw invalidConfig(`assets.icons.aliases has invalid key ${rawKey}`);
    const spec = normalizeIconAliasSpec(rawSpec);
    if (!spec) throw invalidConfig(`assets.icons.aliases.${rawKey} must be a valid icon spec`);
    aliases[key] = spec;
  }
  return aliases;
}

function normalizeIconSpecs(value: unknown): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw invalidConfig("assets.icons.specs must be an array of icon specs");
  }
  const specs: string[] = [];
  value.forEach((entry, index) => {
      const spec = String(entry || "").trim();
      if (!spec) throw invalidConfig(`assets.icons.specs.${index} must be a non-empty string`);
      if (!specs.includes(spec)) specs.push(spec);
  });
  return specs.sort();
}

function normalizeAssetsConfig(value: unknown): NormalizedFrontendConfig["assets"] {
  const source = value === undefined
  ? {}
  : assertPlainObject(value, "assets") as FrontendAssetsConfig;
  assertKnownFields(source, ASSET_FIELDS, "assets");
  const icons = source.icons === undefined
  ? {}
  : assertPlainObject(source.icons, "assets.icons");
  assertKnownFields(icons, ICON_FIELDS, "assets.icons");
  const mode = normalizeIconMode(icons.mode);
  return {
    favicon: normalizeFaviconConfig(source.favicon),
    flags: normalizeFlagsConfig(source.flags),
    fonts: normalizeFontsConfig(source.fonts),
    icons: {
      aliases: normalizeIconAliases(icons.aliases),
      endpoint: normalizeEndpoint(icons.endpoint, mode),
      mode,
      packs: normalizeIconPacks(icons.packs),
      specs: normalizeIconSpecs(icons.specs),
    },
  };
}

function normalizeRuntimeConfig(value: unknown): NormalizedFrontendConfig["runtime"] {
  const source = value === undefined
  ? {}
  : assertPlainObject(value, "runtime") as FrontendRuntimeConfig;
  assertKnownFields(source, RUNTIME_FIELDS, "runtime");
  return {
    layer: normalizeThemeTokens(source.layer, "runtime.layer"),
    layout: normalizeThemeTokens(source.layout, "runtime.layout"),
    progress: normalizeThemeTokens(source.progress, "runtime.progress"),
    theme: normalizeThemeConfig(source.theme),
  };
}

function normalizeDesignConfig(
  value: unknown,
  modeKeys: string[],
): NormalizedFrontendConfig["design"] {
  const source = value === undefined
  ? {}
  : assertPlainObject(value, "design") as FrontendDesignConfig;
  assertKnownFields(source, DESIGN_FIELDS, "design");
  return {
    breakpoints: normalizeBreakpointsConfig((source as Record<string, unknown>).breakpoints),
    glass: normalizeGlassConfig(source.glass),
    interactions: normalizeInteractionsConfig(source.interactions),
    palette: normalizePaletteConfig(source.palette, modeKeys),
    scales: normalizeScalesConfig(source.scales),
    scrollBehavior: normalizeScrollBehavior(source.scrollBehavior),
    semantics: normalizeThemeTokens(source.semantics, "design.semantics"),
  };
}

function normalizeScrollBehavior(
  value: unknown,
): NormalizedFrontendConfig["design"]["scrollBehavior"] {
  if (value === undefined) return DEFAULT_FRONTEND_CONFIG.design.scrollBehavior;
  const raw = typeof value === "string" ? value.trim() : "";
  if (!SCROLL_BEHAVIORS.includes(raw)) {
    throw invalidConfig(
      `design.scrollBehavior must be one of ${SCROLL_BEHAVIORS.join(", ")}`,
    );
  }
  return raw as NormalizedFrontendConfig["design"]["scrollBehavior"];
}

function normalizeSystems(value: unknown): Record<FrontendSystemKey, boolean> {
  if (value === undefined) return { ...DEFAULT_FRONTEND_CONFIG.systems };
  const source = assertPlainObject(value, "systems");
  const systems = { ...DEFAULT_FRONTEND_CONFIG.systems };
  for (const [key, enabled] of Object.entries(source)) {
    if (!SYSTEM_ORDER.includes(key as FrontendSystemKey)) {
      throw invalidConfig(`unsupported system ${key}`);
    }
    if (typeof enabled !== "boolean") {
      throw invalidConfig(`systems.${key} must be boolean`);
    }
    systems[key as FrontendSystemKey] = enabled;
  }
  return systems;
}

function normalizeFrontendConfig(
  config: unknown = {},
  options: NormalizeOptions = {},
): NormalizedFrontendConfig {
  const source = assertPlainObject(config, "config");
  assertKnownFields(source, TOP_LEVEL_FIELDS, "config");
  const runtime = normalizeRuntimeConfig(source.runtime);
  const design = normalizeDesignConfig(source.design, runtime.theme.modes.map((mode) => mode.key));
  return {
    a11y: normalizeA11yConfig(source.a11y),
    assets: normalizeAssetsConfig(source.assets),
    components: normalizeComponentsConfig(source.components),
    containers: normalizeContainersConfig(source.containers, Object.keys(design.breakpoints)),
    design,
    forVersion: normalizeForVersion(source, options),
    language: normalizeLanguageConfig(source.language),
    links: normalizeLinksConfig(source.links),
    money: normalizeMoneyConfig(source.money),
    prefix: DEFAULT_FRONTEND_CONFIG.prefix,
    runtime,
    systems: normalizeSystems(source.systems),
  };
}

function normalizeForVersion(
  config: Record<string, unknown>,
  options: NormalizeOptions,
): string {
  return resolveForVersion({
      config,
      configPath: options.configPath,
      forVersion: config.forVersion,
      label: "frontend",
      packageVersion: PACKAGE_VERSION,
      requireForVersion: options.requireForVersion,
  });
}

export {
  DEFAULT_FRONTEND_CONFIG,
  SUPPORTED_ICON_PACKS,
  SYSTEM_ORDER,
  THEME_MODE_ATTRIBUTE,
  FRONTEND_CONFIG_PATH,
  normalizeFrontendConfig,
};
