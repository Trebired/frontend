type TrebiredFrontendIconPack = "remixicon" | "simple-icons";

type TrebiredFrontendSystemKey =
  | "actions"
  | "flash"
  | "fullscreen"
  | "icons"
  | "inputs"
  | "layer"
  | "modal"
  | "popover"
  | "progress"
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

type TrebiredFrontendConfig = {
  prefix?: string;
  icons?: {
    endpoint?: string;
    packs?: readonly TrebiredFrontendIconPack[];
  };
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

type NormalizedTrebiredFrontendConfig = {
  prefix: string;
  icons: {
    endpoint: string;
    packs: TrebiredFrontendIconPack[];
  };
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
  NormalizedTrebiredFrontendThemeConfig,
  NormalizedTrebiredFrontendThemeMode,
  TrebiredFrontendConfig,
  TrebiredFrontendIconPack,
  TrebiredFrontendSystemKey,
  TrebiredFrontendThemeConfig,
  TrebiredFrontendThemeMode,
  TrebiredFrontendThemeModeScheme,
  TrebiredFrontendThemeTokens,
};
