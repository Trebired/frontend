import type {
  DynamicSidebarContext,
  DynamicSidebarItem,
  DynamicSidebarLinkItem,
  DynamicSidebarLiveConfig,
} from "./types.js";
import { toText as textValue } from "#ndsvdqv80epr";

function sidebarCountsTree(sidebar: DynamicSidebarContext | null | undefined) {
  const counts = sidebar?.entity_counts;
  return counts && typeof counts === "object" ? counts : {};
}

function dynamicSidebarTreeValue(tree: unknown, pathInput?: string) {
  const parts = textValue(pathInput)
  .split(".")
  .map((part) => textValue(part))
  .filter(Boolean);
  let current: unknown = tree && typeof tree === "object" ? tree : {};
  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) {
      return null;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function dynamicSidebarNumber(tree: unknown, pathInput?: string) {
  const value = dynamicSidebarTreeValue(tree, pathInput);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function dynamicSidebarText(tree: unknown, pathInput?: string) {
  const value = dynamicSidebarTreeValue(tree, pathInput);
  return typeof value === "string" ? value : "";
}

function dynamicSidebarCount(
  sidebar: DynamicSidebarContext | null | undefined,
  pathInput?: string,
) {
  return dynamicSidebarNumber(sidebarCountsTree(sidebar), pathInput) || 0;
}

function dynamicSidebarTextValue(
  sidebar: DynamicSidebarContext | null | undefined,
  pathInput?: string,
) {
  return dynamicSidebarText(sidebarCountsTree(sidebar), pathInput);
}

function dynamicSidebarLinkDisabled(
  sidebar: DynamicSidebarContext | null | undefined,
  item: DynamicSidebarLinkItem,
) {
  if (item.disabled === true) return true;
  const disabledPath = textValue(item.disabledPath);
  return disabledPath ? dynamicSidebarCount(sidebar, disabledPath) <= 0 : false;
}

function normalizeRoutePath(input: unknown) {
  const text = textValue(input);
  const path = text.split(/[?#]/u)[0] || "/";
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/u, "") : "/";
}

function dynamicSidebarLinkActive(
  currentPathInput: unknown,
  item: DynamicSidebarLinkItem,
  disabled: boolean,
) {
  if (disabled || item.navIgnore === true) return false;
  const current = normalizeRoutePath(currentPathInput);
  const target = normalizeRoutePath(item.href);
  if (current === target) return true;
  if (item.exact === true || target === "/") return false;
  return current.startsWith(`${target}/`);
}

function isDynamicSidebarDivider(
  item: DynamicSidebarItem,
): item is Extract<DynamicSidebarItem, { kind: "divider" }> {
  return item.kind === "divider";
}

function normalizeDynamicSidebarItems(items: DynamicSidebarItem[]) {
  const visibleItems = Array.isArray(items)
  ? items.filter((item) => {
      return item && item.show !== false &&
        (isDynamicSidebarDivider(item) ||
          !(item.hideWhenDisabled === true && item.disabled === true));
  })
  : [];
  const out: DynamicSidebarItem[] = [];
  for (const item of visibleItems) {
    if (isDynamicSidebarDivider(item)) {
      if (!out.length) continue;
      if (isDynamicSidebarDivider(out[out.length - 1])) continue;
      out.push(item);
      continue;
    }
    out.push(item);
  }
  while (out.length && isDynamicSidebarDivider(out[out.length - 1])) out.pop();
  return out;
}

function dynamicSidebarLiveConfig(
  sidebar: DynamicSidebarContext | null | undefined,
): DynamicSidebarLiveConfig {
  const live = sidebar?.live && typeof sidebar.live === "object"
  ? sidebar.live
  : null;
  const type = textValue(live?.type, textValue(sidebar?.type));
  if (!type) return {};
  return {
    params: live?.params && typeof live.params === "object" ? live.params : {},
    path: textValue(live?.path),
    rooms: Array.isArray(live?.rooms)
    ? live.rooms.map((item) => textValue(item)).filter(Boolean)
    : [],
    side: textValue(live?.side, "left"),
    type,
  };
}

export {
  dynamicSidebarCount,
  dynamicSidebarLinkActive,
  dynamicSidebarLinkDisabled,
  dynamicSidebarLiveConfig,
  dynamicSidebarNumber,
  dynamicSidebarText,
  dynamicSidebarTextValue,
  dynamicSidebarTreeValue,
  isDynamicSidebarDivider,
  normalizeDynamicSidebarItems,
  normalizeRoutePath,
  sidebarCountsTree,
  textValue,
};
