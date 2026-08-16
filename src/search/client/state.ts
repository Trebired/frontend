type SearchPanelBinding = {
  cache: SearchPanelCache | null;
  familyKey: string;
  host: HTMLElement;
  renderFrame: number;
  root: HTMLElement;
};

type SearchInput = HTMLInputElement | HTMLSelectElement;

type SearchFilterRecord = {
  input: SearchInput;
  key: string;
};

type SearchItemRecord = {
  element: HTMLElement;
  exclude: boolean;
  filters: Record<string, unknown>|undefined;
  section: string;
  text: string;
};

type SearchPanelCache = {
  emptyNodes: HTMLElement[];
  filters: SearchFilterRecord[];
  inputs: SearchInput[];
  items: SearchItemRecord[];
  sectionHeadings: HTMLElement[];
  total: number;
};

const SEARCH_PANEL_SELECTOR = "search-panel";
const SEARCH_CONTROLS_SELECTOR = "search-controls";
const panelBindings = new WeakMap<HTMLElement, SearchPanelBinding>();
const controlBindings = new WeakSet<HTMLElement>();
const inputBindings = new WeakMap<HTMLElement, Set<string>>();
const panelTokens = new WeakMap<HTMLElement, string>();

let panelBindCounter = 0;

function panelToken(panel: SearchPanelBinding) {
  const existing = panelTokens.get(panel.host);
  if (existing) return existing;
  panelBindCounter += 1;
  const token = `search_panel_${panelBindCounter}`;
  panelTokens.set(panel.host, token);
  return token;
}

export {
  SEARCH_CONTROLS_SELECTOR,
  SEARCH_PANEL_SELECTOR,
  controlBindings,
  inputBindings,
  panelBindings,
  panelToken,
};
export type {
  SearchFilterRecord,
  SearchInput,
  SearchItemRecord,
  SearchPanelBinding,
  SearchPanelCache,
};
