import {
  iconSpec,
  normalizeSpace,
  parseIconSpec,
} from "./shared.js";

type IconAliasValue = string | {
  icon?: unknown;
  name?: unknown;
  pack?: unknown;
  spec?: unknown;
};

type IconAliasMap = Record<string, string>;

const ICON_ALIAS_KEY_PATTERN = /^[a-z][a-z0-9_-]*$/iu;

function normalizeIconAliasKey(value: unknown): string {
  const key = String(value || "").trim();
  return ICON_ALIAS_KEY_PATTERN.test(key) ? key : "";
}

function normalizeIconAliasSpec(value: unknown): string {
  if (typeof value === "string") return parseIconSpec(value)?.spec || "";
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const source = value as IconAliasValue & Record<string, unknown>;
  if (source.spec !== undefined) return parseIconSpec(source.spec)?.spec || "";
  return iconSpec(source.pack, source.name ?? source.icon);
}

function normalizeIconAliasMap(value: unknown): IconAliasMap {
  const source = value && typeof value === "object" && !Array.isArray(value)
  ? value as Record<string, unknown>
  : {};
  const out: IconAliasMap = {};
  for (const [rawKey, rawSpec] of Object.entries(source)) {
    const key = normalizeIconAliasKey(rawKey);
    const spec = normalizeIconAliasSpec(rawSpec);
    if (key && spec) out[key] = spec;
  }
  return out;
}

function mergeIconAliases(...maps: unknown[]): IconAliasMap {
  return Object.assign({}, ...maps.map(normalizeIconAliasMap));
}

function resolveIconAlias(
  aliases: unknown,
  key: unknown,
  fallback: unknown = "",
): string {
  const map = normalizeIconAliasMap(aliases);
  const normalizedKey = normalizeIconAliasKey(key);
  if (normalizedKey && map[normalizedKey]) return map[normalizedKey];
  return normalizeIconAliasSpec(fallback) || normalizeSpace(fallback);
}

export {
  mergeIconAliases,
  normalizeIconAliasKey,
  normalizeIconAliasMap,
  normalizeIconAliasSpec,
  resolveIconAlias,
};
export type { IconAliasMap, IconAliasValue };
