import { assertPlainObject, invalidConfig, isPlainObject } from "./shared.js";
import { normalizeThemeTokens } from "./theme.js";
import type {
  NormalizedFrontendComponentsConfig,
  FrontendComponentTokens,
  FrontendComponentsConfig,
} from "./types.js";

const COMPONENT_KEY_RE = /^[a-z][a-z0-9]*$/iu;

const DEFAULT_FRONTEND_COMPONENTS_CONFIG = Object.freeze({
  data: Object.freeze({
    graph: Object.freeze({
      download: Object.freeze({}),
      heatmap: Object.freeze({}),
      upload: Object.freeze({}),
    }),
    log: Object.freeze({
      line: Object.freeze({}),
      selection: Object.freeze({}),
    }),
  }),
  feedback: Object.freeze({
    flash: Object.freeze({
      container: {
        background: "transparent",
        border: "1px solid currentColor",
        color: "currentColor",
        padding: "15px",
        radius: "0",
      },
      intents: {
        error: {},
        info: {},
        success: {},
        warn: {},
      },
      layout: {
        actionsGap: "8px",
        bodyGap: "8px",
        gap: "10px",
      },
      placement: {
        maxWidth: "520px",
        offset: "18px",
      },
      slots: {
        description: { fontSize: "0.92rem" },
        icon: { fontWeight: "700", size: "15px" },
        progress: { height: "4px" },
        title: { fontWeight: "400" },
      },
    }),
  }),
  overlays: Object.freeze({
    modal: Object.freeze({}),
    popover: Object.freeze({
      item: {
        root: {
          height: "35px",
          padding: "5px 10px",
          radius: "0",
        },
        states: {
          hover: {},
          selected: {},
        },
      },
      panel: {
        background: "transparent",
        border: "1px solid currentColor",
        color: "currentColor",
        gap: "2px",
        padding: "8px",
        radius: "0",
      },
    }),
    tooltip: Object.freeze({
      arrow: {
        borderWidth: "1px",
        size: "8px",
      },
      motion: {
        duration: "170ms",
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      panel: {
        background: "transparent",
        border: "1px solid currentColor",
        color: "currentColor",
        fontFamily: "sans-serif",
        fontSize: "12px",
        lineHeight: "1.3",
        padding: "7px 9px",
        radius: "0",
      },
    }),
  }),
  primitives: Object.freeze({
    actionControl: Object.freeze({}),
    button: Object.freeze({
      root: {
        background: "transparent",
        border: "1px solid currentColor",
        color: "currentColor",
        fontSize: "12px",
        fontWeight: "600",
        gap: "8px",
        height: "28px",
        padding: "0 12px",
        paddingBlock: "0",
        radius: "0",
      },
      sizes: {
        lg: { fontSize: "13px", height: "34px", paddingInline: "14px" },
        md: { fontSize: "12px", height: "28px", paddingInline: "12px" },
        sm: { fontSize: "11px", height: "24px", paddingInline: "9px" },
      },
      slots: {
        icon: {
          fontSize: "15px",
          size: "28px",
          sizes: {
            lg: { fontSize: "18px", size: "34px" },
            md: { fontSize: "16px", size: "30px" },
            sm: { fontSize: "14px", size: "26px" },
            xs: { fontSize: "12px", size: "22px" },
            xs2: { fontSize: "10px", size: "18px" },
          },
        },
      },
      states: {
        disabled: { opacity: "0.55" },
        hover: {},
      },
      tones: {
        green: { states: { hover: {} } },
        highlight: { states: { hover: {} } },
        red: { states: { hover: {} } },
        yellow: { states: { hover: {} } },
      },
    }),
    choice: Object.freeze({
      checked: Object.freeze({}),
      control: Object.freeze({}),
    }),
    dot: Object.freeze({}),
    dropdown: Object.freeze({
      arrow: Object.freeze({}),
      menu: Object.freeze({}),
      option: Object.freeze({
        states: {
          hover: {},
          selected: {},
        },
      }),
    }),
    input: Object.freeze({
      states: {
        focus: {},
      },
    }),
    loader: Object.freeze({}),
    pill: Object.freeze({}),
    progress: Object.freeze({}),
    tabs: Object.freeze({
      list: { gap: "8px" },
      responsive: {
        mobile: { fontSize: "13px", height: "36px" },
      },
      root: {
        background: "transparent",
        border: "1px solid currentColor",
        color: "currentColor",
        fontFamily: "sans-serif",
        fontSize: "14px",
        height: "34px",
        paddingInline: "14px",
        radius: "0",
      },
      states: {
        active: {},
        hover: {},
      },
    }),
    textLink: Object.freeze({
      root: {
        color: "currentColor",
        fontWeight: "inherit",
        textDecorationLine: "underline",
        textDecorationStyle: "dotted",
        textDecorationThickness: "1px",
        textUnderlineOffset: "3px",
        transition: "color 120ms ease",
      },
      states: {
        hover: {
          textDecorationStyle: "solid",
        },
      },
    }),
    toggle: Object.freeze({
      active: Object.freeze({}),
      thumb: Object.freeze({}),
      track: Object.freeze({}),
    }),
  }),
  shell: Object.freeze({
    header: Object.freeze({
      brand: {
        tag: {
          offsetY: "0",
        },
      },
    }),
    language: Object.freeze({
      option: {
        states: {
          current: {},
        },
      },
    }),
    sidebar: Object.freeze({}),
    theme: Object.freeze({
      option: {
        states: {
          current: {},
        },
      },
    }),
  }),
  surfaces: Object.freeze({
    button: Object.freeze({}),
    card: Object.freeze({
      body: {
        divider: {},
      },
      root: {
        background: "transparent",
        border: "1px solid currentColor",
        minHeight: "35px",
        padding: "14px 14px 12px 14px",
        radius: "0",
      },
      row: {
        background: "transparent",
        padding: "9px 12px",
        radius: "0",
        states: {
          excluded: {},
          hover: {},
          selected: {},
        },
      },
      title: {
        fontSize: "15px",
        fontWeight: "700",
        margin: "0 0 10px 0",
      },
    }),
  }),
} satisfies NormalizedFrontendComponentsConfig);

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
