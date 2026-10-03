import type { FrontendGlassConfig, NormalizedFrontendGlassConfig } from "./glass.js";
import type {
  FrontendDesignInteractionsConfig,
  FrontendPaletteConfig,
  FrontendScalesConfig,
  FrontendScrollBehavior,
  FrontendThemeTokens,
  NormalizedFrontendDesignInteractionsConfig,
  NormalizedFrontendPaletteConfig,
  NormalizedFrontendScalesConfig,
} from "./../types.js";

type FrontendDesignConfig = {
  breakpoints?: Record<string, number>;
  glass?: FrontendGlassConfig;
  interactions?: FrontendDesignInteractionsConfig;
  palette?: FrontendPaletteConfig;
  scales?: FrontendScalesConfig;
  scrollBehavior?: FrontendScrollBehavior;
  semantics?: FrontendThemeTokens;
};

type NormalizedFrontendDesignConfig = {
  breakpoints: Record<string, number>;
  glass: NormalizedFrontendGlassConfig | null;
  interactions: NormalizedFrontendDesignInteractionsConfig;
  palette: NormalizedFrontendPaletteConfig;
  scales: NormalizedFrontendScalesConfig;
  scrollBehavior: FrontendScrollBehavior;
  semantics: FrontendThemeTokens;
};

export type { FrontendDesignConfig, NormalizedFrontendDesignConfig };
