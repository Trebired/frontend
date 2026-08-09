import { normalizeLocale, sourceLanguageMessage } from "./messages.js";

function text(value: unknown, fallback = "") {
  const out = String(value ?? "").trim();
  return out || fallback;
}

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

export { normalizedLang, safeId, text, translate };
