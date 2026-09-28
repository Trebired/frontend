import { ERROR_STATUSES } from "./../error/paths.js";
import { assertPlainObject, invalidConfig } from "./shared.js";

import type {
  FrontendLanguageLocale as FrontendLocaleConfig,
  FrontendLanguageLocaleMessages as FrontendErrorLocaleMessages,
} from "./../language/config.js";
import type { NormalizedFrontendLanguageConfig } from "./types.js";

const LANGUAGE_FIELDS = ["defaultLocale", "error", "locales", "strategy"];
const LOCALE_FIELDS = ["code", "flagCountry", "label", "shortLabel"];
const LOCALE_STRATEGIES = ["none", "prefix", "prefix-all", "query"];

const EMPTY_LANGUAGE_CONFIG: NormalizedFrontendLanguageConfig = Object.freeze({
    defaultLocale: "",
    error: Object.freeze({}) as NormalizedFrontendLanguageConfig["error"],
    locales: Object.freeze([]) as unknown as NormalizedFrontendLanguageConfig["locales"],
    strategy: "none",
});

function assertKnownLanguageFields(
  source: Record<string, unknown>,
  allowed: readonly string[],
  pathLabel: string,
) {
  for (const key of Object.keys(source)) {
    if (!allowed.includes(key)) throw invalidConfig(`${pathLabel}.${key} is not supported`);
  }
}

function normalizeLocale(value: unknown, index: number): FrontendLocaleConfig {
  const entry = assertPlainObject(value, `config.language.locales[${index}]`);
  assertKnownLanguageFields(entry, LOCALE_FIELDS, `config.language.locales[${index}]`);
  const code = String(entry.code || "").trim().toLowerCase();
  if (!code) throw invalidConfig(`config.language.locales[${index}].code is required`);
  return {
    code,
    ...(entry.flagCountry === undefined ? {} : { flagCountry: entry.flagCountry as false | string | null }),
    ...(entry.label === undefined ? {} : { label: String(entry.label) }),
    ...(entry.shortLabel === undefined ? {} : { shortLabel: String(entry.shortLabel) }),
  };
}

function missingErrorMessages(
  locales: FrontendLocaleConfig[],
  error: Record<string, FrontendErrorLocaleMessages>,
): string[] {
  const missing: string[] = [];
  for (const locale of locales) {
    const entry = error[locale.code];
    if (!entry) {
      missing.push(`config.language.error.${locale.code}`);
      continue;
    }
    if (!String(entry.action || "").trim()) {
      missing.push(`config.language.error.${locale.code}.action`);
    }
    for (const status of ERROR_STATUSES) {
      const value = entry[String(status)];
      const messages = typeof value === "object" && value ? value : null;
      if (!messages || !String(messages.title || "").trim()) {
        missing.push(`config.language.error.${locale.code}.${status}.title`);
      }
      if (!messages || !String(messages.lead || "").trim()) {
        missing.push(`config.language.error.${locale.code}.${status}.lead`);
      }
    }
  }
  return missing;
}

function normalizeLanguageConfig(value: unknown): NormalizedFrontendLanguageConfig {
  if (value === undefined) return EMPTY_LANGUAGE_CONFIG;
  const source = assertPlainObject(value, "config.language");
  assertKnownLanguageFields(source, LANGUAGE_FIELDS, "config.language");

  const locales = (Array.isArray(source.locales) ? source.locales : []).map(normalizeLocale);
  if (!locales.length) throw invalidConfig("config.language.locales must list at least one locale");

  const strategy = String(source.strategy || "none");
  if (!LOCALE_STRATEGIES.includes(strategy)) {
    throw invalidConfig(`config.language.strategy must be one of ${LOCALE_STRATEGIES.join(", ")}`);
  }

  const defaultLocale = String(source.defaultLocale || locales[0].code).trim().toLowerCase();
  if (!locales.some((locale) => locale.code === defaultLocale)) {
    throw invalidConfig("config.language.defaultLocale must be one of config.language.locales");
  }

  const error = (source.error === undefined
    ? {}
    : assertPlainObject(source.error, "config.language.error")
  ) as Record<string, FrontendErrorLocaleMessages>;

  const missing = missingErrorMessages(locales, error);
  if (missing.length) {
    throw invalidConfig(
      `every locale needs error page copy for every status; missing ${missing.join(", ")}`,
    );
  }

  return { defaultLocale, error, locales, strategy: strategy as NormalizedFrontendLanguageConfig["strategy"] };
}

export { EMPTY_LANGUAGE_CONFIG, normalizeLanguageConfig };
