type TrebiredFrontendIconPack = "remixicon" | "simple-icons";

type TrebiredFrontendSystemKey =
  | "actions"
  | "flash"
  | "fullscreen"
  | "graph"
  | "icons"
  | "inputs"
  | "layer"
  | "layout"
  | "modal"
  | "popover"
  | "progress"
  | "sidebar"
  | "surface"
  | "theme"
  | "tooltip";

type TrebiredFrontendThemeTokens = Record<string, unknown>;

type TrebiredFrontendThemeModeScheme = "dark" | "light";

type TrebiredFrontendThemeMode = {
  label?: string;
  scheme?: TrebiredFrontendThemeModeScheme;
  tokens?: TrebiredFrontendThemeTokens;
};

type TrebiredFrontendThemeConfig = {
  cssVariables?: boolean;
  dark?: string;
  defaultMode?: string;
  light?: string;
  modes?: Record<string, TrebiredFrontendThemeMode>;
  tokens?: TrebiredFrontendThemeTokens;
};

type TrebiredFrontendPaletteScale = Record<string, string>;

type TrebiredFrontendPaletteFamilies = Record<string, TrebiredFrontendPaletteScale>;

type TrebiredFrontendPaletteMode = {
  scale: TrebiredFrontendPaletteFamilies;
};

type TrebiredFrontendPaletteSemanticRef = {
  family: string;
  step: string;
};

type TrebiredFrontendPaletteConfig = {
  modes?: Record<string, TrebiredFrontendPaletteMode>;
  semantic?: Record<string, TrebiredFrontendPaletteSemanticRef>;
  suffixedVariants?: boolean;
};

type TrebiredFrontendScaleSteps = Record<string, number>;

type TrebiredFrontendZIndexScaleConfig = {
  confetti?: string;
  layerRoot?: string;
  progress?: string;
  steps: TrebiredFrontendScaleSteps;
};

type TrebiredFrontendScalesConfig = {
  height?: TrebiredFrontendScaleSteps;
  lineHeight?: TrebiredFrontendScaleSteps;
  padding?: TrebiredFrontendScaleSteps;
  radius?: TrebiredFrontendScaleSteps;
  spacing?: TrebiredFrontendScaleSteps;
  textSize?: TrebiredFrontendScaleSteps;
  width?: TrebiredFrontendScaleSteps;
  zIndex?: TrebiredFrontendZIndexScaleConfig;
};

type TrebiredFrontendFontDisplay = "auto" | "block" | "fallback" | "optional" | "swap";

type TrebiredFrontendFontStyle = "italic" | "normal";

type TrebiredFrontendFontFamilyConfig = {
  display?: TrebiredFrontendFontDisplay;
  family?: string;
  fontsource?: string;
  package?: string;
  styles?: readonly TrebiredFrontendFontStyle[];
  subsets?: readonly string[];
  weights?: readonly number[];
};

type TrebiredFrontendFontConfig = {
  families?: Record<string, TrebiredFrontendFontFamilyConfig>;
  sans?: string;
};

type TrebiredFrontendConfig = {
  fonts?: TrebiredFrontendFontConfig;
  palette?: TrebiredFrontendPaletteConfig;
  prefix?: string;
  icons?: {
    endpoint?: string;
    packs?: readonly TrebiredFrontendIconPack[];
  };
  scales?: TrebiredFrontendScalesConfig;
  systems?: Partial<Record<TrebiredFrontendSystemKey, boolean>>;
  theme?: TrebiredFrontendThemeConfig;
};

type NormalizedTrebiredFrontendThemeMode = {
  key: string;
  label: string;
  scheme: TrebiredFrontendThemeModeScheme;
  tokens: TrebiredFrontendThemeTokens;
};

type NormalizedTrebiredFrontendThemeConfig = {
  cssVariables: boolean;
  dark: string;
  defaultMode: string;
  light: string;
  modes: NormalizedTrebiredFrontendThemeMode[];
  tokens: TrebiredFrontendThemeTokens;
};

type NormalizedTrebiredFrontendPaletteMode = {
  key: string;
  scale: TrebiredFrontendPaletteFamilies;
};

type NormalizedTrebiredFrontendPaletteSemantic = {
  family: string;
  name: string;
  step: string;
};

type NormalizedTrebiredFrontendPaletteConfig = {
  modes: NormalizedTrebiredFrontendPaletteMode[];
  semantic: NormalizedTrebiredFrontendPaletteSemantic[];
  suffixedVariants: boolean;
};

type NormalizedTrebiredFrontendZIndexScaleConfig = {
  confetti: string;
  layerRoot: string;
  progress: string;
  steps: TrebiredFrontendScaleSteps;
};

type NormalizedTrebiredFrontendScalesConfig = {
  height: TrebiredFrontendScaleSteps;
  lineHeight: TrebiredFrontendScaleSteps;
  padding: TrebiredFrontendScaleSteps;
  radius: TrebiredFrontendScaleSteps;
  spacing: TrebiredFrontendScaleSteps;
  textSize: TrebiredFrontendScaleSteps;
  width: TrebiredFrontendScaleSteps;
  zIndex: NormalizedTrebiredFrontendZIndexScaleConfig;
};

type NormalizedTrebiredFrontendFontFamilyConfig = {
  display: TrebiredFrontendFontDisplay;
  family: string;
  key: string;
  packageName: string;
  styles: TrebiredFrontendFontStyle[];
  subsets: string[];
  weights: number[];
};

type NormalizedTrebiredFrontendFontConfig = {
  families: NormalizedTrebiredFrontendFontFamilyConfig[];
  sans: string;
};

type NormalizedTrebiredFrontendConfig = {
  fonts: NormalizedTrebiredFrontendFontConfig;
  palette: NormalizedTrebiredFrontendPaletteConfig;
  prefix: string;
  icons: {
    endpoint: string;
    packs: TrebiredFrontendIconPack[];
  };
  scales: NormalizedTrebiredFrontendScalesConfig;
  systems: Record<TrebiredFrontendSystemKey, boolean>;
  theme: NormalizedTrebiredFrontendThemeConfig;
};

type LoadedTrebiredFrontendConfig = {
  config: NormalizedTrebiredFrontendConfig;
  configPath: string | null;
  dependencies: string[];
  generatedScss: string;
};

type LoadTrebiredFrontendConfigOptions = {
  configPath?: string;
  defaultIfMissing?: boolean;
  searchFrom?: string;
};

export type {
  LoadTrebiredFrontendConfigOptions,
  LoadedTrebiredFrontendConfig,
  NormalizedTrebiredFrontendConfig,
  NormalizedTrebiredFrontendFontConfig,
  NormalizedTrebiredFrontendFontFamilyConfig,
  NormalizedTrebiredFrontendPaletteConfig,
  NormalizedTrebiredFrontendPaletteMode,
  NormalizedTrebiredFrontendPaletteSemantic,
  NormalizedTrebiredFrontendScalesConfig,
  NormalizedTrebiredFrontendThemeConfig,
  NormalizedTrebiredFrontendThemeMode,
  NormalizedTrebiredFrontendZIndexScaleConfig,
  TrebiredFrontendConfig,
  TrebiredFrontendFontConfig,
  TrebiredFrontendFontDisplay,
  TrebiredFrontendFontFamilyConfig,
  TrebiredFrontendFontStyle,
  TrebiredFrontendIconPack,
  TrebiredFrontendPaletteConfig,
  TrebiredFrontendPaletteFamilies,
  TrebiredFrontendPaletteMode,
  TrebiredFrontendPaletteScale,
  TrebiredFrontendPaletteSemanticRef,
  TrebiredFrontendScaleSteps,
  TrebiredFrontendScalesConfig,
  TrebiredFrontendSystemKey,
  TrebiredFrontendThemeConfig,
  TrebiredFrontendThemeMode,
  TrebiredFrontendThemeModeScheme,
  TrebiredFrontendThemeTokens,
  TrebiredFrontendZIndexScaleConfig,
};
