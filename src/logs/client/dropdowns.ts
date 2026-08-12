import {
  dropdownOptionValue,
  getDropdownOptions,
  resolveNamedDropdownInput,
  searchManager,
  setDropdownLabel as setSharedDropdownLabel,
  setDropdownOptionConfig,
} from "#z2c0jqmjqds4";
import { getGroupsFromLogs, getLevelsFromLogs } from "./filters.js";
import { safeStr } from "./utils.js";
import type { LogsPage } from "./types.js";

type DropdownInput = HTMLInputElement | HTMLSelectElement;

function getById(root: HTMLElement | null, id: string) {
  const local =
  root && root.querySelector
  ? root.querySelector<HTMLElement>("#" + id)
  : null;
  if (local) return local;
  const global = document.getElementById(id);
  return global instanceof HTMLElement ? global : null;
}

function resolveLogsDropdownRoot(
  page: LogsPage,
  inputEl: DropdownInput | null,
  rootId: string,
  marker: string,
) {
  const root = page && page.ui ? page.ui.root : null;
  const localRoot =
  inputEl && inputEl.closest
  ? inputEl.closest<HTMLElement>("[data-dropdown-root]")
  : null;
  if (localRoot) return localRoot;

  const byId = getById(root, rootId);
  if (byId) return byId;

  const byMarker = root
  ? root.querySelector<HTMLElement>(`[data-log-filter-dropdown="${marker}"]`)
  : null;
  return byMarker || null;
}

function resolveLogsDropdownInput(
  page: LogsPage,
  inputEl: DropdownInput | null,
  rootEl: HTMLElement | null,
  inputId: string,
  marker: string,
  name: string,
) {
  const root = page && page.ui ? page.ui.root : null;
  return resolveNamedDropdownInput({
      root,
      inputEl,
      rootEl,
      inputId,
      marker,
      name,
  });
}

function resolveDropdownList(
  page: LogsPage,
  rootEl: HTMLElement | null,
  listId: string,
) {
  const byId = getById(page && page.ui ? page.ui.root : null, listId);
  if (byId) return byId;

  const options = rootEl ? getDropdownOptions(rootEl) : null;
  const linkedList = options
  ? (options.querySelector("[data-dropdown-list]") as HTMLElement | null)
  : null;
  if (linkedList) return linkedList;

  return rootEl && rootEl.querySelector
  ? rootEl.querySelector<HTMLElement>("[data-dropdown-list]")
  : null;
}

function optionLabelForValue(value: string) {
  const text = safeStr(value);
  return text || "all";
}

function getDropdownLabelHtml(listEl: HTMLElement, value: string) {
  const item = Array.from(
    listEl.querySelectorAll<HTMLElement>("[data-dropdown-option]"),
  ).find(function(li) {
      return dropdownOptionValue(li) === value;
  });

  return item ? item.innerHTML : "";
}

function setLogsDropdownLabel(
  rootEl: HTMLElement | null,
  listEl: HTMLElement,
  value: string,
) {
  if (!rootEl) return;

  const label = optionLabelForValue(value);
  const html = getDropdownLabelHtml(listEl, value);
  setSharedDropdownLabel(rootEl, label, html);
}

function cleanDropdownValues(values: string[]) {
  return Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
      .map((value) => safeStr(value))
      .filter((value) => value && value !== "all"),
    ),
  );
}

function existingDropdownValues(listEl: HTMLElement) {
  return Array.from(
    listEl.querySelectorAll<HTMLLIElement>("[data-dropdown-option]"),
  ).map(function(li) {
      return dropdownOptionValue(li);
  });
}

function valuesChanged(existingValues: string[], nextValues: string[]) {
  if (existingValues.length !== nextValues.length) {
    return true;
  }

  for (let i = 0; i < nextValues.length; i += 1) {
    if (existingValues[i] !== nextValues[i]) {
      return true;
    }
  }

  return false;
}

function appendDropdownValue(
  listEl: HTMLElement,
  value: string,
  selected: boolean,
) {
  const li = document.createElement("li");
  const label = optionLabelForValue(value);
  li.setAttribute("data-dropdown-option", "");
  setDropdownOptionConfig(li, {
      label,
      selected,
      value,
  });
  li.hidden = false;

  if (listEl.closest("[data-search-panel-root]")) {
    li.setAttribute("data-search-item", "");
    const script = document.createElement("script");
    script.setAttribute("data-search-item-config", "");
    script.hidden = true;
    script.type = "application/json";
    script.textContent = JSON.stringify({ text: label.toLowerCase() }).replace(
      /</g,
      "\\u003c",
    );
    li.appendChild(script);
  }

  const span = document.createElement("span");
  span.textContent = label;
  li.appendChild(span);
  listEl.appendChild(li);
}

function rebuildDropdownList(
  listEl: HTMLElement,
  nextValues: string[],
  next: string,
) {
  listEl.textContent = "";

  for (const value of nextValues) {
    appendDropdownValue(listEl, value, value === next);
  }
}

function refreshDropdownSearch(listEl: HTMLElement) {
  if (
    searchManager &&
      typeof searchManager.refreshSearchResults === "function"
  ) {
    const searchRoot = listEl.closest("[data-search-panel-root]");
    if (searchRoot) searchManager.refreshSearchResults(searchRoot);
  }
}

function syncDropdown(
  rootEl: HTMLElement | null,
  inputEl: DropdownInput | null,
  listEl: HTMLElement | null,
  values: string[],
) {
  if (!inputEl || !listEl) return;

  const current = safeStr(inputEl.value) || "all";
  const cleanValues = cleanDropdownValues(values);
  const nextValues = ["all"].concat(cleanValues);
  const changed = valuesChanged(existingDropdownValues(listEl), nextValues);
  const next = nextValues.includes(current) ? current : "all";

  if (!changed) {
    inputEl.value = next;
    setLogsDropdownLabel(rootEl, listEl, next);
    return;
  }

  rebuildDropdownList(listEl, nextValues, next);
  inputEl.value = next;
  setLogsDropdownLabel(rootEl, listEl, next);
  inputEl.dispatchEvent(new Event("change", { bubbles: true }));
  refreshDropdownSearch(listEl);
}

export function syncGroupSelect(page: LogsPage) {
  const rootEl = resolveLogsDropdownRoot(
    page,
    page.ui.groupSelect,
    page.domIds.groupDropdown,
    "group",
  );
  const inputEl = resolveLogsDropdownInput(
    page,
    page.ui.groupSelect,
    rootEl,
    page.domIds.groupInput,
    "group",
    page.domIds.groupInputName,
  );
  const listEl = resolveDropdownList(page, rootEl, page.domIds.groupList);
  const groups = getGroupsFromLogs(page);

  page.ui.groupSelect = inputEl;
  syncDropdown(rootEl, inputEl, listEl, groups);
}

export function syncLevelSelect(page: LogsPage) {
  const rootEl = resolveLogsDropdownRoot(
    page,
    page.ui.levelSelect,
    page.domIds.levelDropdown,
    "level",
  );
  const inputEl = resolveLogsDropdownInput(
    page,
    page.ui.levelSelect,
    rootEl,
    page.domIds.levelInput,
    "level",
    page.domIds.levelInputName,
  );
  const listEl = resolveDropdownList(page, rootEl, page.domIds.levelList);

  page.ui.levelSelect = inputEl;
  syncDropdown(rootEl, inputEl, listEl, getLevelsFromLogs(page));
}
