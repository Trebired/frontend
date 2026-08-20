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

type FrontendAssetsConfig = {
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

type NormalizedFrontendAssetsConfig = {
  fonts: NormalizedFrontendFontConfig;
  icons: {
    aliases: Record<string, string>;
    endpoint: string;
    mode: FrontendIconMode;
    packs: FrontendIconPack[];
  };
};

export type {
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
