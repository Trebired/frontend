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

const DEFAULT_ICON_ALIAS_SOURCE = {
  agent: "remixicon:robot-2-line",
  app: "remixicon:box-2-line",
  back: "remixicon:arrow-left-line",
  check: "remixicon:check-line",
  close: "remixicon:close-line",
  copied: "remixicon:check-line",
  copy: "remixicon:clipboard-line",
  dark: "remixicon:moon-line",
  deployment: "remixicon:rocket-2-line",
  deps: "remixicon:archive-stack-fill",
  discard: "remixicon:close-line",
  download: "remixicon:download-line",
  edit: "remixicon:edit-line",
  env: "remixicon:leaf-line",
  error: "remixicon:error-warning-line",
  external_link: "remixicon:external-link-line",
  file: "remixicon:file-3-line",
  gear: "remixicon:settings-3-line",
  hardware: "remixicon:computer-line",
  health: "remixicon:pulse-line",
  home: "remixicon:home-line",
  info: "remixicon:information-2-line",
  light: "remixicon:sun-line",
  logout: "remixicon:logout-box-line",
  menu: "remixicon:menu-line",
  more: "remixicon:more-2-line",
  network: "remixicon:router-line",
  notification: "remixicon:notification-3-line",
  organization: "remixicon:organization-chart",
  overview: "remixicon:dashboard-horizontal-line",
  process: "remixicon:cpu-line",
  publication: "remixicon:upload-cloud-2-line",
  save: "remixicon:save-3-line",
  server: "remixicon:server-line",
  session: "remixicon:time-line",
  software: "remixicon:code-box-line",
  source: "remixicon:box-1-line",
  storage: "remixicon:hard-drive-3-line",
  success: "remixicon:checkbox-circle-line",
  team: "remixicon:team-line",
  terminal: "remixicon:terminal-box-line",
  user: "remixicon:user-line",
  users: "remixicon:group-line",
  warn: "remixicon:error-warning-line",
};

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

const defaultIconAliases: IconAliasMap = Object.freeze(
  normalizeIconAliasMap(DEFAULT_ICON_ALIAS_SOURCE),
);

export {
  defaultIconAliases,
  mergeIconAliases,
  normalizeIconAliasKey,
  normalizeIconAliasMap,
  normalizeIconAliasSpec,
  resolveIconAlias,
};
export type { IconAliasMap, IconAliasValue };
