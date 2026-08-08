import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { searchText, toText } from "./model.js";
import {
  firstNonScriptHTMLElementChild,
  isInUnhydratedIsland,
  scopeRoot,
} from "./client/dom.js";
import {
  firstFormControl,
  normalizeSearchKey,
  readSearchControlsConfig,
  readSearchFilterConfig,
  readSearchItemConfig,
  readSearchPanelConfig,
  searchFilterValues,
  tagName,
  type SearchFilterDef,
} from "./client/config.js";
import { registerFamilyElement, registeredSearchControls, registeredSearchPanels, searchControlsByFamily, searchPanelsByFamily } from "./client/registry.js";
import {
  SEARCH_CONTROLS_SELECTOR,
  SEARCH_PANEL_SELECTOR,
  controlBindings,
  inputBindings,
  panelBindings,
  panelToken,
  type SearchPanelBinding,
} from "./client/state.js";

function searchPanelHostFromNode(target: unknown) {
  if (!(target instanceof Element)) return null;
  if (tagName(target) === SEARCH_PANEL_SELECTOR) return target as HTMLElement;
  const closest =
  typeof target.closest === "function"
  ? target.closest(SEARCH_PANEL_SELECTOR)
  : null;
  if (closest instanceof HTMLElement) return closest;
  const nested =
  typeof target.querySelector === "function"
  ? target.querySelector(SEARCH_PANEL_SELECTOR)
  : null;
  return nested instanceof HTMLElement ? nested : null;
}

function searchPanelHostsFromNode(target: unknown) {
  const root = scopeRoot(target);
  return root ? queryAll<HTMLElement>(root, SEARCH_PANEL_SELECTOR) : [];
}

function searchControlHostsFromNode(target: unknown) {
  const root = scopeRoot(target);
  return root ? queryAll<HTMLElement>(root, SEARCH_CONTROLS_SELECTOR) : [];
}

function panelBindingFromRoot(root: unknown) {
  if (!(root instanceof HTMLElement)) return null;
  const host = searchPanelHostFromNode(root);
  return host ? panelBindings.get(host) || bindSearchPanel(host) : null;
}

function searchPanelFromHost(host: HTMLElement | null) {
  if (!(host instanceof HTMLElement)) return null;
  if (isInUnhydratedIsland(host)) return null;
  const root = firstNonScriptHTMLElementChild(host);
  if (!(root instanceof HTMLElement)) return null;
  const config = readSearchPanelConfig(host);
  const familyKey = toText(config.familyKey);
  return { familyKey, host, root };
}

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

function getSearchInputs(panel: SearchPanelBinding) {
  return collectHosts(panel, "search-query-input", "search-query-input")
  .map(firstFormControl)
  .filter(
    (input): input is HTMLInputElement | HTMLSelectElement =>
    input instanceof HTMLInputElement || input instanceof HTMLSelectElement,
  );
}

function getFilterInputs(panel: SearchPanelBinding) {
  return collectHosts(panel, "search-filter", "search-filter")
  .map((host) => {
      const input = firstFormControl(host);
      const config = readSearchFilterConfig(host);
      return {
        input,
        key: normalizeSearchKey(config.attr),
        value: toText(input && input.value, "all"),
      };
  })
  .filter((filter): filter is SearchFilterDef =>
    Boolean(filter.input && filter.key),
  );
}

function getEmptyNodes(panel: SearchPanelBinding) {
  return collectHosts(panel, "search-empty, [data-search-empty-slot]", "");
}

function getSearchItems(panel: SearchPanelBinding) {
  return collectHosts(panel, "search-item, [data-search-item]", "");
}

function getCombinedQuery(panel: SearchPanelBinding) {
  return getSearchInputs(panel)
  .map((input) => toText(input.value).toLowerCase())
  .filter(Boolean)
  .join(" ");
}

function setItemVisibility(item: HTMLElement, visible: boolean) {
  item.hidden = !visible;
}

function isExcludedItem(item: HTMLElement) {
  return readSearchItemConfig(item).exclude === true;
}

function itemMatchesFilters(item: HTMLElement, filters: SearchFilterDef[]) {
  const config = readSearchItemConfig(item);
  return filters.every((filter) => {
      if (!filter.key) return true;
      if (!filter.value || filter.value === "all") return true;
      return searchFilterValues(config.filters, filter.key).includes(
        filter.value,
      );
  });
}

function itemMatchesQuery(item: HTMLElement, query: string) {
  if (!query) return true;
  return searchText(
    readSearchItemConfig(item).text || item.textContent,
  ).includes(query);
}

function visibleDropdownItemInSection(
  panel: SearchPanelBinding,
  section: string,
) {
  return getSearchItems(panel).some((item) => {
      if (item.hidden) return false;
      if (tagName(item) !== "li") return false;
      return toText(item.getAttribute("data-dropdown-section")) === section;
  });
}

function syncDropdownSections(panel: SearchPanelBinding) {
  panel.root
  .querySelectorAll("[data-dropdown-section-heading]")
  .forEach((sectionNode) => {
      if (!(sectionNode instanceof HTMLElement)) return;
      const section = toText(
        sectionNode.getAttribute("data-dropdown-section-heading"),
      );
      if (!section) return;
      sectionNode.hidden = !visibleDropdownItemInSection(panel, section);
  });
}

function renderSearchPanel(panel: SearchPanelBinding) {
  if (!panel || !panel.host.isConnected) return;
  const query = getCombinedQuery(panel);
  const filters = getFilterInputs(panel);
  const items = getSearchItems(panel);
  const total = items.filter((item) => !isExcludedItem(item)).length;
  let visible = 0;

  items.forEach((item) => {
      if (isExcludedItem(item)) {
        setItemVisibility(item, true);
        return;
      }
      const matches =
      itemMatchesQuery(item, query) && itemMatchesFilters(item, filters);
      setItemVisibility(item, matches);
      if (matches) visible += 1;
  });
  syncDropdownSections(panel);
  getEmptyNodes(panel).forEach((node) => {
      node.hidden = !(total > 0 && visible === 0);
  });
  panel.root.dispatchEvent(
    new CustomEvent("search:updated", {
        bubbles: true,
        detail: {
          query,
          filters,
          total,
          visible,
        },
    }),
  );
}

function bindControlForPanel(
  panel: SearchPanelBinding,
  input: HTMLElement,
  eventName: string,
) {
  const token = panelToken(panel);
  let bindings = inputBindings.get(input);
  if (!bindings) {
    bindings = new Set();
    inputBindings.set(input, bindings);
  }
  const key = `${eventName}:${token}`;
  if (bindings.has(key)) return;
  bindings.add(key);
  input.addEventListener(eventName, () => renderSearchPanel(panel));
}

function bindSearchPanel(host: HTMLElement | null) {
  const panel = searchPanelFromHost(host);
  if (!panel) return null;
  panelBindings.set(panel.host, panel);
  registerFamilyElement(searchPanelsByFamily, panel.familyKey, panel.host);
  getSearchInputs(panel).forEach((input) => {
      bindControlForPanel(panel, input, "input");
  });
  getFilterInputs(panel).forEach((filter) => {
      bindControlForPanel(panel, filter.input, "change");
  });
  renderSearchPanel(panel);
  return panel;
}

function panelsForFamily(familyKey: string) {
  return registeredSearchPanels(familyKey)
  .map((host) => panelBindings.get(host) || bindSearchPanel(host))
  .filter((panel): panel is SearchPanelBinding => Boolean(panel));
}

function bindSearchControls(host: HTMLElement | null) {
  if (!(host instanceof HTMLElement)) return null;
  if (isInUnhydratedIsland(host)) return null;
  const config = readSearchControlsConfig(host);
  const familyKey = toText(config.familyKey);
  registerFamilyElement(searchControlsByFamily, familyKey, host);
  if (controlBindings.has(host)) {
    panelsForFamily(familyKey).forEach(renderSearchPanel);
    return host;
  }
  controlBindings.add(host);
  panelsForFamily(familyKey).forEach(bindSearchPanelInputs);
  return host;
}

function bindSearchPanelInputs(panel: SearchPanelBinding) {
  getSearchInputs(panel).forEach((input) => {
      bindControlForPanel(panel, input, "input");
  });
  getFilterInputs(panel).forEach((filter) => {
      bindControlForPanel(panel, filter.input, "change");
  });
  renderSearchPanel(panel);
}

function bind(target: BindRoot = document) {
  searchControlHostsFromNode(target).forEach(bindSearchControls);
  return searchPanelHostsFromNode(target).map(bindSearchPanel).filter(Boolean);
}

function bindRoot(root: HTMLElement | null) {
  if (!(root instanceof HTMLElement)) return null;
  const config = readSearchPanelConfig(root);
  const familyKey = toText(config.familyKey);
  const panel = { familyKey, host: root, root };
  panelBindings.set(root, panel);
  bindSearchPanelInputs(panel);
  return panel;
}

function refreshSearchResults(target: BindRoot = document) {
  const panel =
  panelBindingFromRoot(target) ||
    (target instanceof HTMLElement ? panelBindings.get(target) : null);
  if (panel) {
    bindSearchPanelInputs(panel);
    return;
  }
  searchPanelHostsFromNode(target).forEach((host) => {
      const bound = panelBindings.get(host) || bindSearchPanel(host);
      if (bound) bindSearchPanelInputs(bound);
  });
}

function bootSearchManager() {
  if (typeof document !== "undefined") bind(document);
  return searchManager;
}

const searchManager = Object.freeze({
    bind,
    bindControls: bindSearchControls,
    bindRoot,
    bindPanel: bindSearchPanel,
    boot: bootSearchManager,
    refreshSearchResults,
});

export {
  SEARCH_CONTROLS_SELECTOR,
  SEARCH_PANEL_SELECTOR,
  bind,
  bindRoot,
  bindSearchControls,
  bindSearchPanel,
  bootSearchManager as boot,
  refreshSearchResults,
  searchManager,
};
export type { SearchPanelBinding };
export default searchManager;
