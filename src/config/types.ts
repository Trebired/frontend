type FrontendIconPack = "remixicon" | "simple-icons";

type FrontendSystemKey =
  | "actions"
  | "code"
  | "editor"
  | "explorer"
  | "flash"
  | "fullscreen"
  | "graph"
  | "icons"
  | "inputs"
  | "layer"
  | "layout"
  | "language"
  | "logs"
  | "modal"
  | "popover"
  | "primitives"
  | "progress"
  | "sidebar"
  | "surface"
  | "theme"
  | "tooltip";

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

type FrontendPaletteMode = {
  scale: FrontendPaletteFamilies;
};

type FrontendPaletteSemanticRef = {
  family: string;
  step: string;
};

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

type FrontendFontDisplay = "auto" | "block" | "fallback" | "optional" | "swap";

type FrontendFontStyle = "italic" | "normal";

type FrontendFontFamilyConfig = {
  display?: FrontendFontDisplay;
  family?: string;
  fontsource?: string;
  package?: string;
  styles?: readonly FrontendFontStyle[];
  subsets?: readonly string[];
  weights?: readonly number[];
};

type FrontendFontConfig = {
  families?: Record<string, FrontendFontFamilyConfig>;
  sans?: string;
};

type FrontendComponentTokens = FrontendThemeTokens;

type FrontendComponentsConfig = {
  actionButton?: FrontendComponentTokens;
  button?: FrontendComponentTokens;
  card?: FrontendComponentTokens;
  flash?: FrontendComponentTokens;
  progress?: FrontendComponentTokens;
  surfaceButton?: FrontendComponentTokens;
  surfaceCard?: FrontendComponentTokens;
  tabs?: FrontendComponentTokens;
};

type FrontendConfig = {
  components?: FrontendComponentsConfig;
  fonts?: FrontendFontConfig;
  palette?: FrontendPaletteConfig;
  prefix?: string;
  icons?: {
    endpoint?: string;
    packs?: readonly FrontendIconPack[];
  };
  scales?: FrontendScalesConfig;
  systems?: Partial<Record<FrontendSystemKey, boolean>>;
  theme?: FrontendThemeConfig;
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

type NormalizedFrontendFontFamilyConfig = {
  display: FrontendFontDisplay;
  family: string;
  key: string;
  packageName: string;
  styles: FrontendFontStyle[];
  subsets: string[];
  weights: number[];
};

type NormalizedFrontendFontConfig = {
  families: NormalizedFrontendFontFamilyConfig[];
  sans: string;
};

type NormalizedFrontendComponentsConfig =
  Record<keyof FrontendComponentsConfig, FrontendComponentTokens>;

type NormalizedFrontendConfig = {
  components: NormalizedFrontendComponentsConfig;
  fonts: NormalizedFrontendFontConfig;
  palette: NormalizedFrontendPaletteConfig;
  prefix: string;
  icons: {
    endpoint: string;
    packs: FrontendIconPack[];
  };
  scales: NormalizedFrontendScalesConfig;
  systems: Record<FrontendSystemKey, boolean>;
  theme: NormalizedFrontendThemeConfig;
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
  NormalizedFrontendComponentsConfig,
  NormalizedFrontendFontConfig,
  NormalizedFrontendFontFamilyConfig,
  NormalizedFrontendPaletteConfig,
  NormalizedFrontendPaletteMode,
  NormalizedFrontendPaletteSemantic,
  NormalizedFrontendScalesConfig,
  NormalizedFrontendThemeConfig,
  NormalizedFrontendThemeMode,
  NormalizedFrontendZIndexScaleConfig,
  FrontendConfig,
  FrontendComponentTokens,
  FrontendComponentsConfig,
  FrontendFontConfig,
  FrontendFontDisplay,
  FrontendFontFamilyConfig,
  FrontendFontStyle,
  FrontendIconPack,
  FrontendPaletteConfig,
  FrontendPaletteFamilies,
  FrontendPaletteMode,
  FrontendPaletteScale,
  FrontendPaletteSemanticRef,
  FrontendScaleSteps,
  FrontendScalesConfig,
  FrontendSystemKey,
  FrontendThemeConfig,
  FrontendThemeMode,
  FrontendThemeModeScheme,
  FrontendThemeTokens,
  FrontendZIndexScaleConfig,
};
