import { parseJsonText } from "#er0dlx1gtbzh";
import type {
  search_filter_config,
  search_filters,
  search_item_config,
  search_panel_config,
} from "#yrscdg72qcm6";
import { toText } from "#yrscdg72qcm6";

type SearchFilterDef = {
  input: HTMLInputElement | HTMLSelectElement;
  key: string;
  value: string;
};

function readSearchPanelConfig(host: ParentNode): search_panel_config {
  return readHostJsonConfig(
    host,
    'script[type="application/json"][data-search-panel-config]',
    {},
  );
}

function readSearchControlsConfig(host: ParentNode): search_panel_config {
  return readHostJsonConfig(
    host,
    'script[type="application/json"][data-search-controls-config]',
    {},
  );
}

function readSearchFilterConfig(host: ParentNode): search_filter_config {
  return readHostJsonConfig(
    host,
    'script[type="application/json"][data-search-filter-config]',
    {},
  );
}

function readSearchItemConfig(host: ParentNode): search_item_config {
  return readHostJsonConfig(
    host,
    'script[type="application/json"][data-search-item-config]',
    {},
  );
}

function firstFormControl(host: Element | null) {
  if (!host || typeof host.querySelector !== "function") return null;
  const input = host.querySelector("input, select");
  return input instanceof HTMLInputElement || input instanceof HTMLSelectElement
  ? input
  : null;
}

function normalizeSearchKey(value: unknown) {
  const raw = toText(value).toLowerCase();
  if (!raw) return "";
  return raw.startsWith("data-") ? raw.slice(5) : raw;
}

function searchFilterValues(filters: search_filters | undefined, key: string) {
  if (!filters || typeof filters !== "object" || !key) return [];
  const raw = filters[key] ?? filters[`data-${key}`];
  if (Array.isArray(raw)) {
    return raw.map((entry) => toText(entry)).filter(Boolean);
  }
  return toText(raw)
  .split("|")
  .map((part) => toText(part))
  .filter(Boolean);
}

function tagName(node: Element | null) {
  return node ? node.tagName.toLowerCase() : "";
}

function readHostJsonConfig<T>(
  host: ParentNode | null,
  selector: string,
  fallback: T,
): T {
  if (!host || typeof host.querySelector !== "function") return fallback;
  const element = host.querySelector(selector);
  return parseJsonText<T>(element?.textContent || "", fallback);
}

export {
  firstFormControl,
  normalizeSearchKey,
  readSearchControlsConfig,
  readSearchFilterConfig,
  readSearchItemConfig,
  readSearchPanelConfig,
  searchFilterValues,
  tagName,
};
export type { SearchFilterDef };
