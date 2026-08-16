import type { BindRoot } from "#er0dlx1gtbzh";
import { toText } from "./model.js";
import {
  firstNonScriptHTMLElementChild,
  isInUnhydratedIsland,
} from "./client/dom.js";
import {
  searchControlHostsFromNode,
  searchPanelHostFromNode,
  searchPanelHostsFromNode,
} from "./client/hosts.js";
import {
  filterDetails,
  getCombinedQuery,
  getFilterInputs,
  getSearchInputs,
  itemMatchesFilters,
  itemMatchesQuery,
  panelCache,
  refreshPanelCache,
  syncDropdownSections,
} from "./client/cache.js";
import {
  readSearchControlsConfig,
  readSearchPanelConfig,
} from "./client/config.js";
import {
  registerFamilyElement,
  registeredSearchPanels,
  searchControlsByFamily,
  searchPanelsByFamily,
} from "./client/registry.js";
import {
  SEARCH_CONTROLS_SELECTOR,
  SEARCH_PANEL_SELECTOR,
  controlBindings,
  inputBindings,
  panelBindings,
  panelToken,
  type SearchPanelBinding,
} from "./client/state.js";

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
  return { cache: null, familyKey, host, renderFrame: 0, root };
}

function setItemVisibility(item: HTMLElement, visible: boolean) {
  item.hidden = !visible;
}

function renderSearchPanelNow(panel: SearchPanelBinding) {
  if (!panel || !panel.host.isConnected) return;
  if (panel.renderFrame) {
    window.cancelAnimationFrame(panel.renderFrame);
    panel.renderFrame = 0;
  }
  const cache = panelCache(panel);
  const query = getCombinedQuery(panel);
  const filters = getFilterInputs(panel);
  const visibleSections = new Set<string>();
  let visible = 0;

  cache.items.forEach((item) => {
      if (item.exclude) {
        setItemVisibility(item.element, true);
        return;
      }
      const matches =
      itemMatchesQuery(item, query) && itemMatchesFilters(item, filters);
      setItemVisibility(item.element, matches);
      if (!matches) return;
      visible += 1;
      if (item.section) visibleSections.add(item.section);
  });
  syncDropdownSections(panel, visibleSections);
  cache.emptyNodes.forEach((node) => {
      node.hidden = !(cache.total > 0 && visible === 0);
  });
  panel.root.dispatchEvent(
    new CustomEvent("search:updated", {
        bubbles: true,
        detail: {
          query,
          filters: filterDetails(filters),
          total: cache.total,
          visible,
        },
    }),
  );
}

function renderSearchPanel(panel: SearchPanelBinding) {
  renderSearchPanelNow(panel);
}

function scheduleSearchPanel(panel: SearchPanelBinding) {
  if (!panel.host.isConnected) return;
  if (panel.renderFrame) return;
  panel.renderFrame = window.requestAnimationFrame(() => {
      panel.renderFrame = 0;
      renderSearchPanelNow(panel);
  });
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
  input.addEventListener(eventName, () => scheduleSearchPanel(panel));
}

function bindSearchPanel(host: HTMLElement | null) {
  const panel = searchPanelFromHost(host);
  if (!panel) return null;
  panelBindings.set(panel.host, panel);
  registerFamilyElement(searchPanelsByFamily, panel.familyKey, panel.host);
  refreshPanelCache(panel);
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
    panelsForFamily(familyKey).forEach((panel) => {
        refreshPanelCache(panel);
        renderSearchPanel(panel);
    });
    return host;
  }
  controlBindings.add(host);
  panelsForFamily(familyKey).forEach(bindSearchPanelInputs);
  return host;
}

function bindSearchPanelInputs(panel: SearchPanelBinding) {
  refreshPanelCache(panel);
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

function bindSearchRoot(root: HTMLElement | null) {
  if (!(root instanceof HTMLElement)) return null;
  const config = readSearchPanelConfig(root);
  const familyKey = toText(config.familyKey);
  const panel = { cache: null, familyKey, host: root, renderFrame: 0, root };
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
    bindRoot: bindSearchRoot,
    bindPanel: bindSearchPanel,
    boot: bootSearchManager,
    refreshSearchResults,
});

export {
  SEARCH_CONTROLS_SELECTOR,
  SEARCH_PANEL_SELECTOR,
  bind,
  bindSearchRoot as bindRoot,
  bindSearchControls,
  bindSearchPanel,
  bootSearchManager as boot,
  refreshSearchResults,
  searchManager,
};
export type { SearchPanelBinding };
export default searchManager;
