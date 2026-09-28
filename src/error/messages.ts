import { getFrontendLanguage } from "./../language/config.js";
import type { FrontendLanguageLocaleMessages } from "./../language/config.js";

function localeMessages(lang?: string): FrontendLanguageLocaleMessages | null {
  const language = getFrontendLanguage();
  const table = language.error;
  const code = String(lang || "").trim().toLowerCase();
  const entry = code ? table[code] : undefined;
  if (entry) return entry;
  const fallbackCode = language.defaultLocale || Object.keys(table)[0] || "";
  return fallbackCode ? table[fallbackCode] || null : null;
}

function errorMessage(kind: "lead" | "title", status: number, lang?: string): string {
  const entry = localeMessages(lang);
  if (!entry) return "";
  const byStatus = entry[String(status)];
  return typeof byStatus === "object" && byStatus ? String(byStatus[kind] || "") : "";
}

function errorActionLabel(lang?: string): string {
  const entry = localeMessages(lang);
  return entry ? String(entry.action || "") : "";
}

export { errorActionLabel, errorMessage };
