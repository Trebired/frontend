type FrontendIconPack = string;
type FrontendIconMode = "server" | "static";

type FrontendIconAliasValue = string | {
  icon?: string;
  name?: string;
  pack?: string;
  spec?: string;
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

type FrontendFlagsConfig = {
  countries?: readonly string[];
  ratio?: "1x1" | "3x2";
};

type FrontendFaviconConfig = {
  dark?: string;
  default?: string;
  ico?: readonly number[] | false;
  light?: string;
  sizes?: readonly number[];
};

type FrontendAssetsConfig = {
  favicon?: FrontendFaviconConfig | string | false;
  flags?: FrontendFlagsConfig | readonly string[] | false;
  fonts?: FrontendFontConfig;
  icons?: {
    aliases?: Record<string, FrontendIconAliasValue>;
    endpoint?: string | false;
    mode?: FrontendIconMode;
    packs?: readonly FrontendIconPack[];
    specs?: readonly string[];
  };
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

type NormalizedFrontendFlagsConfig = {
  countries: string[];
  ratio: "1x1" | "3x2";
};

type NormalizedFrontendFaviconConfig = {
  dark: string;
  default: string;
  ico: number[];
  light: string;
  sizes: number[];
};

type NormalizedFrontendAssetsConfig = {
  favicon: NormalizedFrontendFaviconConfig;
  flags: NormalizedFrontendFlagsConfig;
  fonts: NormalizedFrontendFontConfig;
  icons: {
    aliases: Record<string, string>;
    endpoint: string;
    mode: FrontendIconMode;
    packs: FrontendIconPack[];
    specs: string[];
  };
};

export type {
  FrontendFaviconConfig,
  NormalizedFrontendFaviconConfig,
  FrontendFlagsConfig,
  NormalizedFrontendFlagsConfig,
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
};
