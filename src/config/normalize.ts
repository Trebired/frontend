import { assertPlainObject, invalidConfig } from "./shared.js";
import { DEFAULT_FRONTEND_COMPONENTS_CONFIG, normalizeComponentsConfig } from "./component-tokens.js";
import { normalizeFontsConfig } from "./fonts.js";
import { normalizePaletteConfig } from "./palette.js";
import { normalizeScalesConfig } from "./scales.js";
import { normalizeThemeConfig } from "./theme.js";
import type {
  NormalizedFrontendConfig,
  FrontendIconPack,
  FrontendSystemKey,
} from "./types.js";

const FRONTEND_CONFIG_PATH = `.${"tre"}bired/frontend/config.ts`;

/* Must stay in sync with THEME_ATTR exported from the ./theme runtime. */
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

const DEFAULT_FRONTEND_CONFIG: NormalizedFrontendConfig = Object.freeze({
  components: DEFAULT_FRONTEND_COMPONENTS_CONFIG,
  fonts: Object.freeze({
    families: Object.freeze([]) as NormalizedFrontendConfig["fonts"]["families"],
    sans: "",
  }),
  palette: Object.freeze({
    modes: Object.freeze([]) as NormalizedFrontendConfig["palette"]["modes"],
    semantic: Object.freeze([]) as NormalizedFrontendConfig["palette"]["semantic"],
    suffixedVariants: true,
  }),
  prefix: "tbf",
  icons: Object.freeze({
    endpoint: "/__icons/svg",
    packs: Object.freeze([...SUPPORTED_ICON_PACKS]) as FrontendIconPack[],
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
  }) as NormalizedFrontendConfig["scales"],
  systems: Object.freeze(Object.fromEntries(SYSTEM_ORDER.map((key) => [key, true]))) as Record<FrontendSystemKey, boolean>,
  theme: Object.freeze({
    cssVariables: true,
    dark: "",
    defaultMode: "",
    light: "",
    modes: Object.freeze([]) as NormalizedFrontendConfig["theme"]["modes"],
    tokens: Object.freeze({}),
  }),
});

function normalizePrefix(value: unknown): string {
  const prefix = String(value || DEFAULT_FRONTEND_CONFIG.prefix).trim();
  if (!/^[a-z][a-z0-9_-]*$/iu.test(prefix)) {
    throw invalidConfig("prefix must start with a letter and contain only letters, numbers, underscores, or hyphens");
  }
  return prefix;
}

function normalizeEndpoint(value: unknown): string {
  const endpoint = String(value || DEFAULT_FRONTEND_CONFIG.icons.endpoint).trim();
  if (!endpoint || /[\s"'<>]/u.test(endpoint)) {
    throw invalidConfig("icons.endpoint must be a URL path without whitespace");
  }
  return endpoint;
}

function normalizeIconPacks(value: unknown): FrontendIconPack[] {
  const raw = value === undefined ? DEFAULT_FRONTEND_CONFIG.icons.packs : value;
  if (!Array.isArray(raw)) throw invalidConfig("icons.packs must be an array");
  const packs: FrontendIconPack[] = [];
  for (const item of raw) {
    if (!SUPPORTED_ICON_PACKS.includes(item as FrontendIconPack)) {
      throw invalidConfig(`unsupported icon pack ${String(item)}`);
    }
    if (!packs.includes(item as FrontendIconPack)) packs.push(item as FrontendIconPack);
  }
  return packs;
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

function normalizeFrontendConfig(config: unknown = {}): NormalizedFrontendConfig {
  const source = assertPlainObject(config, "config");
  const icons = source.icons === undefined ? {} : assertPlainObject(source.icons, "icons");
  const theme = normalizeThemeConfig(source.theme);
  return {
    components: normalizeComponentsConfig(source.components),
    fonts: normalizeFontsConfig(source.fonts),
    palette: normalizePaletteConfig(source.palette, theme.modes.map((mode) => mode.key)),
    prefix: normalizePrefix(source.prefix),
    icons: {
      endpoint: normalizeEndpoint(icons.endpoint),
      packs: normalizeIconPacks(icons.packs),
    },
    scales: normalizeScalesConfig(source.scales),
    systems: normalizeSystems(source.systems),
    theme,
  };
}

export {
  DEFAULT_FRONTEND_CONFIG,
  SUPPORTED_ICON_PACKS,
  SYSTEM_ORDER,
  THEME_MODE_ATTRIBUTE,
  FRONTEND_CONFIG_PATH,
  normalizeFrontendConfig,
};
