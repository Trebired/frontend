import type {
  FrontendLanguageLocale,
  FrontendLanguageLocaleMessages,
} from "./../language/config.js";

import type {
  FrontendAssetsConfig,
  FrontendFontConfig,
  FrontendFontDisplay,
  FrontendFontFamilyConfig,
  FrontendFontStyle,
  FrontendIconAliasValue,
  FrontendIconMode,
  FrontendIconPack,
  NormalizedFrontendAssetsConfig,
  NormalizedFrontendFontConfig,
  NormalizedFrontendFontFamilyConfig,
} from "./types/assets.js";
import type { FrontendDesignConfig, NormalizedFrontendDesignConfig } from "./types/design.js";
import type {
  FrontendContainersConfig,
  NormalizedFrontendContainers,
} from "./types/containers.js";

import type { FrontendA11yConfig, NormalizedFrontendA11yConfig } from "./types/a11y.js";
import type { FrontendMoneyConfig, NormalizedFrontendMoneyConfig } from "./types/money.js";

type FrontendSystemKey =
|"a11y"
|"actions"
|"code"
|"editor"
|"explorer"
|"flash"
|"fullscreen"
|"graph"
|"icons"
|"inputs"
|"layer"
|"layout"
|"language"
|"logs"
|"media"
|"modal"
|"popover"
|"primitives"
|"progress"
|"sidebar"
|"surface"
|"theme"
|"tooltip";

type FrontendThemeTokens = Record<string, unknown>;

type FrontendThemeModeScheme = "dark" | "light";

type FrontendThemeMode = {
  label?: string;
  scheme?: FrontendThemeModeScheme;
  tokens?: FrontendThemeTokens;
};

type FrontendThemeConfig = {
  cssVariables?: boolean;
  dark?: string;
  defaultMode?: string;
  light?: string;
  modes?: Record<string, FrontendThemeMode>;
  tokens?: FrontendThemeTokens;
};

type FrontendPaletteScale = Record<string, string>;

type FrontendPaletteFamilies = Record<string, FrontendPaletteScale>;

type FrontendPaletteMode = { scale: FrontendPaletteFamilies };

type FrontendPaletteSemanticRef = { family: string; step: string };

type FrontendPaletteConfig = {
  modes?: Record<string, FrontendPaletteMode>;
  semantic?: Record<string, FrontendPaletteSemanticRef>;
  suffixedVariants?: boolean;
};

type FrontendScaleSteps = Record<string, number>;

type FrontendZIndexScaleConfig = {
  confetti?: string;
  layerRoot?: string;
  progress?: string;
  steps: FrontendScaleSteps;
};

type FrontendScalesConfig = {
  height?: FrontendScaleSteps;
  lineHeight?: FrontendScaleSteps;
  padding?: FrontendScaleSteps;
  radius?: FrontendScaleSteps;
  spacing?: FrontendScaleSteps;
  textSize?: FrontendScaleSteps;
  width?: FrontendScaleSteps;
  zIndex?: FrontendZIndexScaleConfig;
};

type FrontendComponentTokens = FrontendThemeTokens;

type FrontendPrimitiveComponentsConfig = {
  actionControl?: FrontendComponentTokens;
  button?: FrontendComponentTokens;
  choice?: FrontendComponentTokens;
  dot?: FrontendComponentTokens;
  dropdown?: FrontendComponentTokens;
  input?: FrontendComponentTokens;
  loader?: FrontendComponentTokens;
  marquee?: FrontendComponentTokens;
  pill?: FrontendComponentTokens;
  progress?: FrontendComponentTokens;
  tabs?: FrontendComponentTokens;
  textLink?: FrontendComponentTokens;
  toggle?: FrontendComponentTokens;
  upload?: FrontendComponentTokens;
};

type FrontendSurfaceComponentsConfig = {
  brandCanvas?: FrontendComponentTokens;
  button?: FrontendComponentTokens;
  card?: FrontendComponentTokens;
  glow?: FrontendComponentTokens;
  hairline?: FrontendComponentTokens;
  motif?: FrontendComponentTokens;
  logo?: FrontendComponentTokens;
  prose?: FrontendComponentTokens;
  scrollbar?: FrontendComponentTokens;
};

type FrontendOverlayComponentsConfig = {
  modal?: FrontendComponentTokens;
  popover?: FrontendComponentTokens;
  tooltip?: FrontendComponentTokens;
};

type FrontendFeedbackComponentsConfig = {
  flash?: FrontendComponentTokens;
};

type FrontendMediaComponentsConfig = {
  expandableImage?: FrontendComponentTokens;
  lightbox?: FrontendComponentTokens;
};

type FrontendShellComponentsConfig = {
  bottomBar?: FrontendComponentTokens;
  error?: FrontendComponentTokens;
  header?: FrontendComponentTokens;
  language?: FrontendComponentTokens;
  sidebar?: FrontendComponentTokens;
  theme?: FrontendComponentTokens;
};

type FrontendDataComponentsConfig = {
  graph?: FrontendComponentTokens;
  log?: FrontendComponentTokens;
};

type FrontendComponentsConfig = {
  data?: FrontendDataComponentsConfig;
  feedback?: FrontendFeedbackComponentsConfig;
  media?: FrontendMediaComponentsConfig;
  overlays?: FrontendOverlayComponentsConfig;
  primitives?: FrontendPrimitiveComponentsConfig;
  shell?: FrontendShellComponentsConfig;
  surfaces?: FrontendSurfaceComponentsConfig;
  typography?: FrontendComponentTokens;
};

type FrontendActivePressInteractionConfig = {
  brightness?: number | string;
  enabled?: boolean;
};

type FrontendDesignInteractionsConfig = {
  activePress?: FrontendActivePressInteractionConfig;
};

type FrontendScrollBehavior = "auto" | "smooth";

type FrontendRuntimeConfig = {
  layer?: FrontendComponentTokens;
  layout?: FrontendComponentTokens;
  progress?: FrontendComponentTokens;
  theme?: FrontendThemeConfig;
};

type FrontendLanguageConfig = {
  defaultLocale?: string;
  error?: Record<string, FrontendLanguageLocaleMessages>;
  locales?: FrontendLanguageLocale[];
  strategy?: FrontendLocaleStrategy;
};

type FrontendLocaleStrategy = "none" | "prefix" | "prefix-all" | "query";

type FrontendConfig = {
  a11y?: FrontendA11yConfig;
  assets?: FrontendAssetsConfig;
  components?: FrontendComponentsConfig;
  containers?: FrontendContainersConfig;
  design?: FrontendDesignConfig;
  forVersion?: string;
  language?: FrontendLanguageConfig;
  money?: FrontendMoneyConfig;
  runtime?: FrontendRuntimeConfig;
  systems?: Partial<Record<FrontendSystemKey, boolean>>;
};

type NormalizedFrontendThemeMode = {
  key: string;
  label: string;
  scheme: FrontendThemeModeScheme;
  tokens: FrontendThemeTokens;
};

type NormalizedFrontendThemeConfig = {
  cssVariables: boolean;
  dark: string;
  defaultMode: string;
  light: string;
  modes: NormalizedFrontendThemeMode[];
  tokens: FrontendThemeTokens;
};

type NormalizedFrontendPaletteMode = {
  key: string;
  scale: FrontendPaletteFamilies;
};

type NormalizedFrontendPaletteSemantic = {
  family: string;
  name: string;
  step: string;
};

type NormalizedFrontendPaletteConfig = {
  modes: NormalizedFrontendPaletteMode[];
  semantic: NormalizedFrontendPaletteSemantic[];
  suffixedVariants: boolean;
};

type NormalizedFrontendZIndexScaleConfig = {
  confetti: string;
  layerRoot: string;
  progress: string;
  steps: FrontendScaleSteps;
};

type NormalizedFrontendScalesConfig = {
  height: FrontendScaleSteps;
  lineHeight: FrontendScaleSteps;
  padding: FrontendScaleSteps;
  radius: FrontendScaleSteps;
  spacing: FrontendScaleSteps;
  textSize: FrontendScaleSteps;
  width: FrontendScaleSteps;
  zIndex: NormalizedFrontendZIndexScaleConfig;
};

type NormalizedFrontendComponentsConfig = {
  data: Required<FrontendDataComponentsConfig>;
  feedback: Required<FrontendFeedbackComponentsConfig>;
  media: Required<FrontendMediaComponentsConfig>;
  overlays: Required<FrontendOverlayComponentsConfig>;
  primitives: Required<FrontendPrimitiveComponentsConfig>;
  shell: Required<FrontendShellComponentsConfig>;
  surfaces: Required<FrontendSurfaceComponentsConfig>;
  typography: FrontendComponentTokens;
};

type NormalizedFrontendActivePressInteractionConfig = {
  brightness: string;
  enabled: boolean;
  filter: string;
};

type NormalizedFrontendDesignInteractionsConfig = {
  activePress: NormalizedFrontendActivePressInteractionConfig;
};

type NormalizedFrontendRuntimeConfig = {
  layer: FrontendComponentTokens;
  layout: FrontendComponentTokens;
  progress: FrontendComponentTokens;
  theme: NormalizedFrontendThemeConfig;
};

type NormalizedFrontendLanguageConfig = {
  defaultLocale: string;
  error: Record<string, FrontendLanguageLocaleMessages>;
  locales: FrontendLanguageLocale[];
  strategy: FrontendLocaleStrategy;
};

type NormalizedFrontendConfig = {
  a11y: NormalizedFrontendA11yConfig;
  assets: NormalizedFrontendAssetsConfig;
  components: NormalizedFrontendComponentsConfig;
  containers: NormalizedFrontendContainers;
  design: NormalizedFrontendDesignConfig;
  forVersion: string;
  language: NormalizedFrontendLanguageConfig;
  money: NormalizedFrontendMoneyConfig;
  prefix: string;
  runtime: NormalizedFrontendRuntimeConfig;
  systems: Record<FrontendSystemKey, boolean>;
};

type LoadedFrontendConfig = {
  config: NormalizedFrontendConfig;
  configPath: string | null;
  dependencies: string[];
  generatedScss: string;
};

type LoadFrontendConfigOptions = {
  configPath?: string;
  defaultIfMissing?: boolean;
  searchFrom?: string;
};

export type {
  FrontendA11yConfig,
  NormalizedFrontendA11yConfig,
  FrontendLanguageConfig,
  FrontendMoneyConfig,
  FrontendLocaleStrategy,
  NormalizedFrontendLanguageConfig,
  NormalizedFrontendMoneyConfig,
  LoadFrontendConfigOptions,
  LoadedFrontendConfig,
  NormalizedFrontendConfig,
  NormalizedFrontendActivePressInteractionConfig,
  NormalizedFrontendAssetsConfig,
  NormalizedFrontendComponentsConfig,
  NormalizedFrontendDesignConfig,
  NormalizedFrontendDesignInteractionsConfig,
  NormalizedFrontendFontConfig,
  NormalizedFrontendFontFamilyConfig,
  NormalizedFrontendPaletteConfig,
  NormalizedFrontendPaletteMode,
  NormalizedFrontendPaletteSemantic,
  NormalizedFrontendRuntimeConfig,
  NormalizedFrontendScalesConfig,
  NormalizedFrontendThemeConfig,
  NormalizedFrontendThemeMode,
  NormalizedFrontendZIndexScaleConfig,
  FrontendConfig,
  FrontendActivePressInteractionConfig,
  FrontendAssetsConfig,
  FrontendComponentTokens,
  FrontendComponentsConfig,
  FrontendDataComponentsConfig,
  FrontendDesignConfig,
  FrontendDesignInteractionsConfig,
  FrontendFeedbackComponentsConfig,
  FrontendFontConfig,
  FrontendFontDisplay,
  FrontendFontFamilyConfig,
  FrontendFontStyle,
  FrontendIconMode,
  FrontendIconPack,
  FrontendIconAliasValue,
  FrontendOverlayComponentsConfig,
  FrontendPaletteConfig,
  FrontendPaletteFamilies,
  FrontendPaletteMode,
  FrontendPaletteScale,
  FrontendPaletteSemanticRef,
  FrontendPrimitiveComponentsConfig,
  FrontendRuntimeConfig,
  FrontendScaleSteps,
  FrontendScalesConfig,
  FrontendScrollBehavior,
  FrontendShellComponentsConfig,
  FrontendSurfaceComponentsConfig,
  FrontendSystemKey,
  FrontendThemeConfig,
  FrontendThemeMode,
  FrontendThemeModeScheme,
  FrontendThemeTokens,
  FrontendZIndexScaleConfig,
};

export type *from "./types/containers.js";
