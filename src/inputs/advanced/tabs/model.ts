import { toString } from "#dqy2d22qyujv";
import type { ReactNode } from "react";
import { routeParamNameForFamily } from "./manager/route.js";
import { joinClassNames } from "#dqy2d22qyujv";
import { primitiveStackClassName } from "#hzrmwbvgt2ax";

type tabs_item = {
  buttonAttributes?: Record<string, unknown>;
  buttonClassName?: string;
  defaultActive?: boolean;
  hasNestedTabs?: boolean;
  hidden?: boolean;
  id: string;
  label?: ReactNode;
  route?: string;
  value?: string;
};
type tabs_props = {
  familyAttributes?: Record<string, unknown>;
  familyClassName?: string;
  familyKey?: string;
  headerClassName?: string;
  headerLeading?: ReactNode;
  headerLeadingRow?: number;
  hoistFamilyToParent?: boolean;
  id?: string;
  initialValue?: string;
  items: Array<tabs_item | null | undefined | false>;
  listAttributes?: Record<string, unknown>;
  listClassName?: string;
  rootAttributes?: Record<string, unknown>;
  rootClassName?: string;
};
type tab_panel_props = {
  attributes?: Record<string, unknown>;
  children?: ReactNode;
  className?: string;
  defaultActive?: boolean;
  familyKey: string;
  hidden?: boolean;
  id: string;
  route: string;
};
type tabs_model = {
  activeHasNestedTabs: boolean;
  activeId: string;
  collapseNestedSpacing: boolean;
  familyClassName: string;
  familyStyle?: Record<string, unknown>;
  hasHeaderLeading: boolean;
  hasNestedTabs: boolean;
  initialValue: string;
  items: tabs_item[];
  listClassName: string;
  requestedHeaderLeadingRow: number;
  rootId: string;
};

function mergeStyle(
  baseStyle: Record<string, unknown> | undefined,
  extraStyle: Record<string, unknown> | undefined,
) {
  if (!baseStyle && !extraStyle) return undefined;
  return {
    ...(baseStyle || {}),
    ...(extraStyle || {}),
  };
}

function normalizedItems(props: tabs_props) {
  return Array.isArray(props.items)
  ? (props.items.filter(Boolean) as tabs_item[])
  : [];
}

function itemMatchesInitialValue(item: tabs_item, initialValue: string) {
  const target = toString(initialValue);
  if (!target) return false;
  return [item.value, item.id, item.route]
  .map((value) => toString(value))
  .filter(Boolean)
  .includes(target);
}

function activeItemFor(items: tabs_item[], initialValue: string) {
  const visibleItems = items.filter((item) => item.hidden !== true);
  const fallbackItem =
  visibleItems.find((item) => item.defaultActive) ||
    visibleItems[0] ||
    items[0] ||
    null;
  return (
    visibleItems.find((item) => itemMatchesInitialValue(item, initialValue)) ||
      items.find((item) => itemMatchesInitialValue(item, initialValue)) ||
      fallbackItem
  );
}

function resolveHeaderLeadingRow(props: tabs_props) {
  return Number.isFinite(props.headerLeadingRow)
  ? Math.max(1, Math.floor(Number(props.headerLeadingRow)))
  : 0;
}

function resolveFamilyStyle(props: tabs_props, collapseNestedSpacing: boolean) {
  const familyAttributes = (props.familyAttributes || {}) as any;
  const baseStyle =
  familyAttributes && typeof familyAttributes.style === "object"
  ? (familyAttributes.style as Record<string, unknown>)
  : undefined;
  return mergeStyle(
    baseStyle,
    collapseNestedSpacing ? { gap: "0px" } : undefined,
  );
}

function routeInitialValue(currentUrl: string, familyKey: string) {
  const key = routeParamNameForFamily(familyKey);
  const url = toString(currentUrl);
  if (!key || !url) return "";
  try {
    return toString(
      new URL(url, "http://localhost").searchParams.get(key),
    );
  } catch {
    return "";
  }
}

function resolveInitialValue(props: tabs_props, currentUrl: string) {
  const routeValue = routeInitialValue(currentUrl, toString(props.familyKey));
  if (routeValue) return routeValue;
  const explicit = toString(props.initialValue);
  if (explicit) return explicit;
  return "";
}

function buildTabsModel(props: tabs_props, currentUrl: string): tabs_model {
  const items = normalizedItems(props);
  const initialValue = resolveInitialValue(props, currentUrl);
  const activeItem = activeItemFor(items, initialValue);
  const hasNestedTabs = items.some((item) => item.hasNestedTabs === true);
  const activeHasNestedTabs = Boolean(
    activeItem && activeItem.hasNestedTabs === true,
  );
  const collapseNestedSpacing = hasNestedTabs && !activeHasNestedTabs;
  return {
    activeHasNestedTabs,
    activeId: toString(activeItem && activeItem.id),
    collapseNestedSpacing,
    familyClassName: joinClassNames([
        primitiveStackClassName({ className: "tabs-family", gap: "xs" }),
        toString(props.familyClassName),
    ]),
    familyStyle: resolveFamilyStyle(props, collapseNestedSpacing),
    hasHeaderLeading:
    props.headerLeading !== undefined &&
      props.headerLeading !== null &&
      props.headerLeading !== false,
    hasNestedTabs,
    initialValue,
    items,
    listClassName: joinClassNames(["tabs", toString(props.listClassName)]),
    requestedHeaderLeadingRow: resolveHeaderLeadingRow(props),
    rootId: toString(props.id),
  };
}

export { buildTabsModel, routeInitialValue };
export type { tab_panel_props, tabs_item, tabs_model, tabs_props };
