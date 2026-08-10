import { assertPlainObject, invalidConfig, isPlainObject } from "./shared.js";
import { normalizeThemeTokens } from "./theme.js";
import type {
  NormalizedFrontendComponentsConfig,
  FrontendComponentTokens,
  FrontendComponentsConfig,
} from "./types.js";

const COMPONENT_KEY_RE = /^[a-z][a-z0-9]*$/iu;

const DEFAULT_FRONTEND_COMPONENTS_CONFIG = Object.freeze({
  actionButton: Object.freeze({}),
  button: Object.freeze({
    disabled: { opacity: "0.55" },
    font: { size: "12px", weight: "600" },
    gap: "8px",
    height: "28px",
    icon: {
      fontSize: "15px",
      size: "28px",
      xs2: { fontSize: "10px", size: "18px" },
      xs: { fontSize: "12px", size: "22px" },
      sm: { fontSize: "14px", size: "26px" },
      md: { fontSize: "16px", size: "30px" },
      lg: { fontSize: "18px", size: "34px" },
    },
    padding: "0 12px",
    paddingBlock: "0",
    radius: "var(--radius-md, var(--tbf-radius, 0))",
    sizes: {
      sm: { fontSize: "11px", height: "24px", paddingInline: "9px" },
      md: { fontSize: "12px", height: "28px", paddingInline: "12px" },
      lg: { fontSize: "13px", height: "34px", paddingInline: "14px" },
    },
  }),
  card: Object.freeze({
    minHeight: "var(--height-xs4, 35px)",
    padding: "14px 14px 12px 14px",
    radius: "var(--radius-lg, var(--tbf-radius, 0))",
    row: {
      padding: "9px 12px",
      radius: "var(--radius-lg, var(--tbf-radius, 0))",
    },
    title: { fontSize: "15px", fontWeight: "700", margin: "0 0 10px 0" },
  }),
  flash: Object.freeze({
    actionsGap: "8px",
    bodyGap: "8px",
    descriptionFontSize: "0.92rem",
    gap: "10px",
    icon: { fontSize: "15px", fontWeight: "700" },
    maxWidth: "520px",
    offset: "18px",
    padding: "15px",
    progressHeight: "4px",
    radius: "var(--radius-lg, var(--tbf-radius, 0))",
    title: { fontWeight: "400" },
  }),
  progress: Object.freeze({
    height: "3px",
  }),
  surfaceButton: Object.freeze({}),
  surfaceCard: Object.freeze({}),
  tabs: Object.freeze({
    font: { family: "var(--tbf-font-sans, sans-serif)", size: "14px" },
    gap: "var(--tbf-gap-sm)",
    height: "34px",
    mobile: { fontSize: "13px", height: "36px" },
    paddingInline: "14px",
    radius: "var(--radius-sm, var(--tbf-radius-sm, 0))",
  }),
  tooltip: Object.freeze({
    arrow: { size: "8px" },
    border: "var(--tbf-border-width, 1px) solid var(--tbf-border, #000)",
    duration: "170ms",
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    font: {
      family: "var(--tbf-font-sans, sans-serif)",
      size: "12px",
    },
    lineHeight: "1.3",
    padding: "7px 9px",
    radius: "var(--tbf-radius-sm, 0)",
  }),
} satisfies NormalizedFrontendComponentsConfig);

const COMPONENT_KEYS = Object.keys(
  DEFAULT_FRONTEND_COMPONENTS_CONFIG,
) as Array<keyof FrontendComponentsConfig>;

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

function normalizeComponentKey(key: string): keyof FrontendComponentsConfig {
  if (!COMPONENT_KEY_RE.test(key)) {
    throw invalidConfig(`components.${key} must start with a letter and contain only letters or numbers`);
  }
  if (!COMPONENT_KEYS.includes(key as keyof FrontendComponentsConfig)) {
    throw invalidConfig(`components.${key} is not a supported component`);
  }
  return key as keyof FrontendComponentsConfig;
}

function normalizeComponentsConfig(value: unknown): NormalizedFrontendComponentsConfig {
  const source = value === undefined ? {} : assertPlainObject(value, "components");
  const config: NormalizedFrontendComponentsConfig = {
    ...DEFAULT_FRONTEND_COMPONENTS_CONFIG,
  };
  for (const [rawKey, rawTokens] of Object.entries(source)) {
    const key = normalizeComponentKey(rawKey);
    const tokens = normalizeThemeTokens(rawTokens, `components.${key}`);
    config[key] = mergeComponentTokens(config[key], tokens);
  }
  return config;
}

export {
  DEFAULT_FRONTEND_COMPONENTS_CONFIG,
  normalizeComponentsConfig,
};
