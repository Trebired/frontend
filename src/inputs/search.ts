import { queryAll, type BindRoot } from "#er0dlx1gtbzh";

const SEARCH_SELECTOR = "[data-tbf-search]";
const SEARCH_INPUT_SELECTOR = "[data-tbf-search-input]";
const SEARCH_ITEM_SELECTOR = "[data-tbf-search-item]";
const SEARCH_EMPTY_SELECTOR = "[data-tbf-search-empty]";
const SEARCH_EVENT = "tbf:search";

type SearchState = {
  count: number;
  query: string;
  root: HTMLElement;
};

function itemText(item: HTMLElement) {
  return String(item.getAttribute("data-tbf-search-text") || item.textContent || "").toLowerCase();
}

function applySearch(root: HTMLElement, query: string): SearchState {
  const normalized = query.trim().toLowerCase();
  let count = 0;
  queryAll<HTMLElement>(root, SEARCH_ITEM_SELECTOR).forEach((item) => {
      const visible = !normalized || itemText(item).includes(normalized);
      item.hidden = !visible;
      item.setAttribute("data-tbf-search-match", visible ? "true" : "false");
      if (visible) count += 1;
  });
  queryAll<HTMLElement>(root, SEARCH_EMPTY_SELECTOR).forEach((empty) => {
      empty.hidden = count > 0;
  });
  const state = { count, query, root };
  root.dispatchEvent(new CustomEvent(SEARCH_EVENT, { bubbles: true, detail: state }));
  return state;
}

function bindSearch(root: HTMLElement | null) {
  if (!(root instanceof HTMLElement) || root.hasAttribute("data-tbf-search-bound")) return null;
  root.setAttribute("data-tbf-search-bound", "true");
  const input = root.querySelector<HTMLInputElement>(SEARCH_INPUT_SELECTOR);
  if (!input) return applySearch(root, "");
  input.addEventListener("input", () => applySearch(root, input.value));
  return applySearch(root, input.value);
}

function bindStaticSearchControls(root: BindRoot = document) {
  queryAll<HTMLElement>(root, SEARCH_SELECTOR).forEach(bindSearch);
}

export {
  SEARCH_EMPTY_SELECTOR,
  SEARCH_EVENT,
  SEARCH_INPUT_SELECTOR,
  SEARCH_ITEM_SELECTOR,
  SEARCH_SELECTOR,
  applySearch,
  bindSearch,
  bindStaticSearchControls as bindSearchControls,
};
export type { SearchState };
