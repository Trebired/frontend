type SearchPanelBinding = {
  familyKey: string;
  host: HTMLElement;
  root: HTMLElement;
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
export type { SearchPanelBinding };
