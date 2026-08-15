import { assertPlainObject, invalidConfig } from "./shared.js";
import { DEFAULT_FRONTEND_COMPONENTS_CONFIG, normalizeComponentsConfig } from "./component-tokens.js";
import { normalizeFontsConfig } from "./fonts.js";
import { normalizeInteractionsConfig } from "./interactions.js";
import { normalizePaletteConfig } from "./palette.js";
import { normalizeScalesConfig } from "./scales.js";
import { normalizeThemeConfig, normalizeThemeTokens } from "./theme.js";
import {
  frontendConfigPath,
  PACKAGE_VERSION,
} from "./package.js";
import {
  defaultIconAliases,
  normalizeIconAliasKey,
  normalizeIconAliasSpec,
} from "#rqcj8y6keks2";
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

const THEME_MODE_ATTRIBUTE = "data-tbf-theme";

const SUPPORTED_ICON_PACKS: FrontendIconPack[] = ["remixicon", "simple-icons"];

const SYSTEM_ORDER: FrontendSystemKey[] = [
  "theme",
  "layout",
  "language",
  "logs",
  "layer",
  "icons",
  "progress",
  "flash",
  "tooltip",
  "popover",
  "modal",
  "sidebar",
  "inputs",
  "actions",
  "code",
  "editor",
  "explorer",
  "primitives",
  "fullscreen",
  "surface",
  "graph",
];

const TOP_LEVEL_FIELDS = [
  "assets",
  "components",
  "design",
  "forVersion",
  "prefix",
  "runtime",
  "systems",
];

const ASSET_FIELDS = ["fonts", "icons"];
const ICON_FIELDS = ["aliases", "endpoint", "packs"];
const DESIGN_FIELDS = ["interactions", "palette", "scales", "semantics"];
const RUNTIME_FIELDS = ["layer", "layout", "progress", "theme"];

const DEFAULT_FRONTEND_CONFIG: NormalizedFrontendConfig = Object.freeze({
    assets: Object.freeze({
        fonts: Object.freeze({
            families: Object.freeze([]) as NormalizedFrontendConfig["assets"]["fonts"]["families"],
            sans: "",
        }),
        icons: Object.freeze({
            aliases: Object.freeze({ ...defaultIconAliases }),
            endpoint: "/__icons/svg",
            packs: Object.freeze([...SUPPORTED_ICON_PACKS]) as FrontendIconPack[],
        }),
    }),
    components: DEFAULT_FRONTEND_COMPONENTS_CONFIG,
    design: Object.freeze({
        interactions: Object.freeze({
            activePress: Object.freeze({
                brightness: "0.9",
                enabled: false,
                filter: "none",
            }),
        }),
        palette: Object.freeze({
            modes: Object.freeze([]) as NormalizedFrontendConfig["design"]["palette"]["modes"],
            semantic: Object.freeze([]) as NormalizedFrontendConfig["design"]["palette"]["semantic"],
            suffixedVariants: true,
        }),
        scales: Object.freeze({
            height: Object.freeze({}),
            lineHeight: Object.freeze({}),
            padding: Object.freeze({}),
            radius: Object.freeze({}),
            spacing: Object.freeze({}),
            textSize: Object.freeze({}),
            width: Object.freeze({}),
            zIndex: Object.freeze({ confetti: "", layerRoot: "", progress: "", steps: Object.freeze({}) }),
        }) as NormalizedFrontendConfig["design"]["scales"],
        semantics: Object.freeze({}),
    }),
    forVersion: PACKAGE_VERSION,
    prefix: "tbf",
    runtime: Object.freeze({
        layer: Object.freeze({}),
        layout: Object.freeze({}),
        progress: Object.freeze({ height: "3px" }),
        theme: Object.freeze({
            cssVariables: true,
            dark: "",
            defaultMode: "",
            light: "",
            modes: Object.freeze([]) as NormalizedFrontendConfig["runtime"]["theme"]["modes"],
            tokens: Object.freeze({}),
        }),
    }),
    systems: Object.freeze(Object.fromEntries(SYSTEM_ORDER.map((key) => [key, true]))) as Record<FrontendSystemKey, boolean>,
});

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

function normalizePrefix(value: unknown): string {
  const prefix = String(value || DEFAULT_FRONTEND_CONFIG.prefix).trim();
  if (!/^[a-z][a-z0-9_-]*$/iu.test(prefix)) {
    throw invalidConfig("prefix must start with a letter and contain only letters, numbers, underscores, or hyphens");
  }
  return prefix;
}

function normalizeEndpoint(value: unknown): string {
  const endpoint = String(value || DEFAULT_FRONTEND_CONFIG.assets.icons.endpoint).trim();
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

function normalizeAssetsConfig(value: unknown): NormalizedFrontendConfig["assets"] {
  const source = value === undefined
  ? {}
  : assertPlainObject(value, "assets") as FrontendAssetsConfig;
  assertKnownFields(source, ASSET_FIELDS, "assets");
  const icons = source.icons === undefined
  ? {}
  : assertPlainObject(source.icons, "assets.icons");
  assertKnownFields(icons, ICON_FIELDS, "assets.icons");
  return {
    fonts: normalizeFontsConfig(source.fonts),
    icons: {
      aliases: normalizeIconAliases(icons.aliases),
      endpoint: normalizeEndpoint(icons.endpoint),
      packs: normalizeIconPacks(icons.packs),
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
    interactions: normalizeInteractionsConfig(source.interactions),
    palette: normalizePaletteConfig(source.palette, modeKeys),
    scales: normalizeScalesConfig(source.scales),
    semantics: normalizeThemeTokens(source.semantics, "design.semantics"),
  };
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
  return {
    assets: normalizeAssetsConfig(source.assets),
    components: normalizeComponentsConfig(source.components),
    design: normalizeDesignConfig(source.design, runtime.theme.modes.map((mode) => mode.key)),
    forVersion: normalizeForVersion(source, options),
    prefix: normalizePrefix(source.prefix),
    runtime,
    systems: normalizeSystems(source.systems),
  };
}

function normalizeForVersion(
  config: Record<string, unknown>,
  options: NormalizeOptions,
): string {
  return resolveForVersion({
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
