import { toText as text } from "#ndsvdqv80epr";
import { normalizeLocale, sourceLanguageMessage } from "./messages.js";

function translate(
  lang: string | undefined,
  key: string,
  vars?: Record<string, unknown>,
) {
  return sourceLanguageMessage(key, lang, vars);
}

function safeId(value: unknown, fallback = "language") {
  return text(value, fallback)
  .replace(/[^\w-]+/g, "_")
  .replace(/^_+|_+$/g, "")
  .toLowerCase() || fallback;
}

function normalizedLang(value: unknown) {
  return normalizeLocale(text(value, "en"));
}

function localeTag(value: unknown) {
  return text(value).trim().toLowerCase().replace(/_/gu, "-");
}

function localeBase(value: unknown) {
  return localeTag(value).split("-")[0] || "";
}

export { localeBase, localeTag, normalizedLang, safeId, text, translate };
