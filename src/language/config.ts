import { frontendDataAttr } from "#5vbaqj4pirp3";

type FrontendLanguageStatusMessages = {
  lead: string;
  title: string;
};

type FrontendLanguageLocaleMessages = Record<string, FrontendLanguageStatusMessages|string>& {
  action: string;
};

type FrontendLanguageLocale = {
  code: string;
  flagCountry?: false | string | null;
  label?: string;
  shortLabel?: string;
};

type FrontendLanguageRuntimeConfig = {
  defaultLocale: string;
  error: Record<string, FrontendLanguageLocaleMessages>;
  locales: FrontendLanguageLocale[];
};

const LANGUAGE_CONFIG_ATTR = frontendDataAttr("language-config");

const EMPTY: FrontendLanguageRuntimeConfig = { defaultLocale: "", error: {}, locales: [] };

let configured: FrontendLanguageRuntimeConfig | null = null;

function normalize(value: unknown): FrontendLanguageRuntimeConfig {
  if (!value || typeof value !== "object") return EMPTY;
  const source = value as Partial<FrontendLanguageRuntimeConfig>;
  return {
    defaultLocale: String(source.defaultLocale || ""),
    error: source.error && typeof source.error === "object" ? source.error : {},
    locales: Array.isArray(source.locales) ? source.locales : [],
  };
}

function configureFrontendLanguage(value: unknown): FrontendLanguageRuntimeConfig {
  configured = normalize(value);
  return configured;
}

function readDocumentLanguage(): FrontendLanguageRuntimeConfig | null {
  if (typeof document === "undefined") return null;
  const raw = document.documentElement.getAttribute(LANGUAGE_CONFIG_ATTR);
  if (!raw) return null;
  try {
    return normalize(JSON.parse(raw));
  } catch {
    return null;
  }
}

function getFrontendLanguage(): FrontendLanguageRuntimeConfig {
  if (configured) return configured;
  const fromDocument = readDocumentLanguage();
  if (fromDocument) configured = fromDocument;
  return configured || EMPTY;
}

export { LANGUAGE_CONFIG_ATTR, configureFrontendLanguage, getFrontendLanguage };
export type {
  FrontendLanguageLocale,
  FrontendLanguageLocaleMessages,
  FrontendLanguageRuntimeConfig,
  FrontendLanguageStatusMessages,
};
