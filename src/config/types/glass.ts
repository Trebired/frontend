type FrontendGlassTint = "dark" | "light" | "none";

type FrontendGlassConfig = {
  blur?: string;
  clear?: string;
  color?: string;
  opacity?: string;
  saturate?: string;
  tint?: FrontendGlassTint;
};

type NormalizedFrontendGlassConfig = {
  blur: string;
  clear: string;
  color: string;
  opacity: string;
  saturate: string;
};

export type { FrontendGlassTint, FrontendGlassConfig, NormalizedFrontendGlassConfig };
