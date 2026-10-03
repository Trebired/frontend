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

type FrontendSystemKey =
|"actions"
|"code"
|"contrast"
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
  actionRow?: FrontendComponentTokens;
  band?: FrontendComponentTokens;
  brandCanvas?: FrontendComponentTokens;
  button?: FrontendComponentTokens;
  card?: FrontendComponentTokens;
  frame?: FrontendComponentTokens;
  glow?: FrontendComponentTokens;
  hairline?: FrontendComponentTokens;
  logo?: FrontendComponentTokens;
  prose?: FrontendComponentTokens;
  rule?: FrontendComponentTokens;
  scrollbar?: FrontendComponentTokens;
  tag?: FrontendComponentTokens;
  tile?: FrontendComponentTokens;
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
  assets?: FrontendAssetsConfig;
  components?: FrontendComponentsConfig;
  design?: FrontendDesignConfig;
  forVersion?: string;
  language?: FrontendLanguageConfig;
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
  assets: NormalizedFrontendAssetsConfig;
  components: NormalizedFrontendComponentsConfig;
  design: NormalizedFrontendDesignConfig;
  forVersion: string;
  language: NormalizedFrontendLanguageConfig;
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
  FrontendLanguageConfig,
  FrontendLocaleStrategy,
  NormalizedFrontendLanguageConfig,
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
