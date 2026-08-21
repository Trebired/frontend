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

type FrontendAssetsConfig = {
  flags?: FrontendFlagsConfig | readonly string[] | false;
  fonts?: FrontendFontConfig;
  icons?: {
    aliases?: Record<string, FrontendIconAliasValue>;
    endpoint?: string | false;
    mode?: FrontendIconMode;
    packs?: readonly FrontendIconPack[];
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

type NormalizedFrontendAssetsConfig = {
  flags: NormalizedFrontendFlagsConfig;
  fonts: NormalizedFrontendFontConfig;
  icons: {
    aliases: Record<string, string>;
    endpoint: string;
    mode: FrontendIconMode;
    packs: FrontendIconPack[];
  };
};

export type {
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
