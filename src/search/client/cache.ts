import { searchText, toText } from "#yrscdg72qcm6";
import { isInUnhydratedIsland } from "./dom.js";
import { searchPanelHostFromNode } from "./hosts.js";
import {
  firstFormControl,
  normalizeSearchKey,
  readSearchFilterConfig,
  readSearchItemConfig,
  searchFilterValues,
  tagName,
} from "./config.js";
import { registeredSearchControls } from "./registry.js";
import type {
  SearchFilterRecord,
  SearchItemRecord,
  SearchPanelBinding,
} from "./state.js";

function controlsForPanel(panel: SearchPanelBinding) {
  if (!panel.familyKey) return [];
  return registeredSearchControls(panel.familyKey).filter(
    (node) => !isInUnhydratedIsland(node),
  );
}

function belongsToPanel(panel: SearchPanelBinding, node: Element) {
  const host = searchPanelHostFromNode(node);
  return !host || host === panel.host;
}

function collectHosts(
  panel: SearchPanelBinding,
  rootSelector: string,
  controlSelector: string,
) {
  const out = new Set<HTMLElement>();
  if (rootSelector) {
    Array.from(panel.root.querySelectorAll(rootSelector)).forEach((node) => {
        if (node instanceof HTMLElement && belongsToPanel(panel, node))
        out.add(node);
    });
  }
  if (controlSelector) {
    controlsForPanel(panel).forEach((controls) => {
        Array.from(controls.querySelectorAll(controlSelector)).forEach((node) => {
            if (node instanceof HTMLElement) out.add(node);
        });
    });
  }
  return Array.from(out);
}

function readSearchInputs(panel: SearchPanelBinding) {
  return collectHosts(panel, "search-query-input", "search-query-input")
  .map(firstFormControl)
  .filter(
    (input): input is HTMLInputElement | HTMLSelectElement =>
    input instanceof HTMLInputElement || input instanceof HTMLSelectElement,
  );
}

function readFilterRecords(panel: SearchPanelBinding) {
  return collectHosts(panel, "search-filter", "search-filter")
  .map((host) => {
      const input = firstFormControl(host);
      const config = readSearchFilterConfig(host);
      return {
        input,
        key: normalizeSearchKey(config.attr),
      };
  })
  .filter((filter): filter is SearchFilterRecord =>
    Boolean(filter.input && filter.key),
  );
}

function getEmptyNodes(panel: SearchPanelBinding) {
  return collectHosts(panel, "search-empty, [data-search-empty-slot]", "");
}

function getSearchItems(panel: SearchPanelBinding) {
  return collectHosts(panel, "search-item, [data-search-item]", "");
}

function getSectionHeadings(panel: SearchPanelBinding) {
  return Array.from(
    panel.root.querySelectorAll<HTMLElement>("[data-dropdown-section-heading]"),
  );
}

function readSearchItemRecord(item: HTMLElement): SearchItemRecord {
  const config = readSearchItemConfig(item);
  return {
    element: item,
    exclude: config.exclude === true,
    filters: config.filters,
    section: tagName(item) === "li"
    ? toText(item.getAttribute("data-dropdown-section"))
    : "",
    text: searchText(config.text || item.textContent),
  };
}

function refreshPanelCache(panel: SearchPanelBinding) {
  const items = getSearchItems(panel).map(readSearchItemRecord);
  panel.cache = {
    emptyNodes: getEmptyNodes(panel),
    filters: readFilterRecords(panel),
    inputs: readSearchInputs(panel),
    items,
    sectionHeadings: getSectionHeadings(panel),
    total: items.filter((item) => !item.exclude).length,
  };
  return panel.cache;
}

function panelCache(panel: SearchPanelBinding) {
  return panel.cache || refreshPanelCache(panel);
}

function getSearchInputs(panel: SearchPanelBinding) {
  return panelCache(panel).inputs;
}

function getFilterInputs(panel: SearchPanelBinding) {
  return panelCache(panel).filters;
}

function getCombinedQuery(panel: SearchPanelBinding) {
  return getSearchInputs(panel)
  .map((input) => searchText(input.value))
  .filter(Boolean)
  .join(" ");
}

function filterValue(filter: SearchFilterRecord) {
  return toText(filter.input.value, "all");
}

function itemMatchesFilters(item: SearchItemRecord, filters: SearchFilterRecord[]) {
  return filters.every((filter) => {
      if (!filter.key) return true;
      const value = filterValue(filter);
      if (!value || value === "all") return true;
      return searchFilterValues(item.filters as any, filter.key).includes(
        value,
      );
  });
}

function itemMatchesQuery(item: SearchItemRecord, query: string) {
  if (!query) return true;
  return item.text.includes(query);
}

function filterDetails(filters: SearchFilterRecord[]) {
  return filters.map((filter) => ({
        input: filter.input,
        key: filter.key,
        value: filterValue(filter),
  }));
}

function syncDropdownSections(panel: SearchPanelBinding, visibleSections: Set<string>) {
  panelCache(panel).sectionHeadings.forEach((sectionNode) => {
      const section = toText(
        sectionNode.getAttribute("data-dropdown-section-heading"),
      );
      if (!section) return;
      sectionNode.hidden = !visibleSections.has(section);
  });
}

export {
  filterDetails,
  getCombinedQuery,
  getFilterInputs,
  getSearchInputs,
  itemMatchesFilters,
  itemMatchesQuery,
  panelCache,
  refreshPanelCache,
  syncDropdownSections,
};
