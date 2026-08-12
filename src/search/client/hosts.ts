import { queryAll } from "#er0dlx1gtbzh";
import { tagName } from "./config.js";
import { scopeRoot } from "./dom.js";
import {
  SEARCH_CONTROLS_SELECTOR,
  SEARCH_PANEL_SELECTOR,
} from "./state.js";

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

export {
  searchControlHostsFromNode,
  searchPanelHostFromNode,
  searchPanelHostsFromNode,
};
