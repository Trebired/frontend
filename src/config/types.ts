import type {
  FrontendAssetsConfig,
  FrontendFontConfig,
  FrontendFontDisplay,
  FrontendFontFamilyConfig,
  FrontendFontStyle,
  FrontendIconAliasValue,
  FrontendIconPack,
  NormalizedFrontendAssetsConfig,
  NormalizedFrontendFontConfig,
  NormalizedFrontendFontFamilyConfig,
} from "./types/assets.js";

type FrontendSystemKey =
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
  pill?: FrontendComponentTokens;
  progress?: FrontendComponentTokens;
  tabs?: FrontendComponentTokens;
  textLink?: FrontendComponentTokens;
  toggle?: FrontendComponentTokens;
  upload?: FrontendComponentTokens;
};

type FrontendSurfaceComponentsConfig = {
  button?: FrontendComponentTokens;
  card?: FrontendComponentTokens;
};

type FrontendOverlayComponentsConfig = {
  modal?: FrontendComponentTokens;
  popover?: FrontendComponentTokens;
  tooltip?: FrontendComponentTokens;
};

type FrontendFeedbackComponentsConfig = {
  flash?: FrontendComponentTokens;
};

type FrontendShellComponentsConfig = {
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
  overlays?: FrontendOverlayComponentsConfig;
  primitives?: FrontendPrimitiveComponentsConfig;
  shell?: FrontendShellComponentsConfig;
  surfaces?: FrontendSurfaceComponentsConfig;
};

type FrontendActivePressInteractionConfig = {
  brightness?: number | string;
  enabled?: boolean;
};

type FrontendDesignInteractionsConfig = {
  activePress?: FrontendActivePressInteractionConfig;
};

type FrontendDesignConfig = {
  interactions?: FrontendDesignInteractionsConfig;
  palette?: FrontendPaletteConfig;
  scales?: FrontendScalesConfig;
  semantics?: FrontendThemeTokens;
};

type FrontendRuntimeConfig = {
  layer?: FrontendComponentTokens;
  layout?: FrontendComponentTokens;
  progress?: FrontendComponentTokens;
  theme?: FrontendThemeConfig;
};

type FrontendConfig = {
  assets?: FrontendAssetsConfig;
  components?: FrontendComponentsConfig;
  design?: FrontendDesignConfig;
  prefix?: string;
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
  overlays: Required<FrontendOverlayComponentsConfig>;
  primitives: Required<FrontendPrimitiveComponentsConfig>;
  shell: Required<FrontendShellComponentsConfig>;
  surfaces: Required<FrontendSurfaceComponentsConfig>;
};

type NormalizedFrontendActivePressInteractionConfig = {
  brightness: string;
  enabled: boolean;
  filter: string;
};

type NormalizedFrontendDesignInteractionsConfig = {
  activePress: NormalizedFrontendActivePressInteractionConfig;
};

type NormalizedFrontendDesignConfig = {
  interactions: NormalizedFrontendDesignInteractionsConfig;
  palette: NormalizedFrontendPaletteConfig;
  scales: NormalizedFrontendScalesConfig;
  semantics: FrontendThemeTokens;
};

type NormalizedFrontendRuntimeConfig = {
  layer: FrontendComponentTokens;
  layout: FrontendComponentTokens;
  progress: FrontendComponentTokens;
  theme: NormalizedFrontendThemeConfig;
};

type NormalizedFrontendConfig = {
  assets: NormalizedFrontendAssetsConfig;
  components: NormalizedFrontendComponentsConfig;
  design: NormalizedFrontendDesignConfig;
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
  FrontendShellComponentsConfig,
  FrontendSurfaceComponentsConfig,
  FrontendSystemKey,
  FrontendThemeConfig,
  FrontendThemeMode,
  FrontendThemeModeScheme,
  FrontendThemeTokens,
  FrontendZIndexScaleConfig,
};
