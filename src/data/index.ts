import { formatDateTime } from "#k0q2s2kidqtq";
import { isPlainObject } from "#kr652d3st9at";

function onlyString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toString(value: unknown, fallback: unknown = "") {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return typeof fallback === "string" ? fallback.trim() : String(fallback ?? "");
}

function dataTokens(value: unknown) {
  return toString(value)
  .split(/[\s,]+/u)
  .map((part) => toString(part))
  .filter(Boolean);
}

function dataTokenGroups(root: Element | null | undefined, attr: string) {
  const groups = dataTokens(root?.getAttribute(attr));
  return groups.length ? groups : [""];
}

function parseJson<T=unknown>(text: unknown, fallback: T): T {
  try {
    const parsed = JSON.parse(toString(text) || "{}");
    return parsed && typeof parsed === "object" ? parsed as T : fallback;
  } catch {
    return fallback;
  }
}

function parseElementObject<T=unknown>(id: unknown, fallback: T): T {
  const key = toString(id);
  if (!key || typeof document === "undefined") return fallback;
  const element = document.getElementById(key);
  if (!element) return fallback;
  const text =
  element instanceof HTMLTemplateElement
  ? element.content?.textContent || element.textContent || ""
  : element.textContent || "";
  return parseJson<T>(text, fallback);
}

function createAnimationFrameQueue(callback: () => void) {
  let queued = false;
  return function queueAnimationFrame() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
        queued = false;
        callback();
    });
  };
}

function formatLocaleDateTime(value: unknown, locale = "") {
  return formatDateTime(value, locale || undefined);
}

const normalize = Object.freeze({
    onlyString,
    toString,
});

const json = Object.freeze({
    parse: parseJson,
    parseElementObject,
});

const objectApi = Object.freeze({
    asObject<T=Record<string, unknown>>(value: unknown, fallback = {} as T) {
      return isPlainObject(value) ? value as T : fallback;
    },
    isObject: isPlainObject,
});

const separatorSymbol = "•";
const typography = Object.freeze({
    separator: separatorSymbol,
});

export {
  createAnimationFrameQueue,
  dataTokenGroups,
  dataTokens,
  formatLocaleDateTime,
  json,
  normalize,
  objectApi,
  onlyString,
  parseElementObject,
  parseJson,
  separatorSymbol,
  toString,
  typography,
};
