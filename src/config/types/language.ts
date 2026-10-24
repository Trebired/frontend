import type { FrontendLanguageLocale, FrontendLanguageLocaleMessages } from "./../../language/config.js";

type FrontendLanguageConfig = {
  defaultLocale?: string;
  error?: Record<string, FrontendLanguageLocaleMessages>;
  locales?: FrontendLanguageLocale[];
  strategy?: FrontendLocaleStrategy;
};

type FrontendLocaleStrategy = "none" | "prefix" | "prefix-all" | "query";

type NormalizedFrontendLanguageConfig = {
  defaultLocale: string;
  error: Record<string, FrontendLanguageLocaleMessages>;
  locales: FrontendLanguageLocale[];
  strategy: FrontendLocaleStrategy;
};

export type { FrontendLanguageConfig, FrontendLocaleStrategy, NormalizedFrontendLanguageConfig };
