import { queryAll, resolveDocumentTarget, type BindRoot } from "#er0dlx1gtbzh";
import { frontendDataAttr, frontendDataSelector, frontendEventName } from "#5vbaqj4pirp3";

const TABS_SELECTOR = frontendDataSelector("tabs");
const TAB_SELECTOR = frontendDataSelector("tab");
const TAB_PANEL_SELECTOR = frontendDataSelector("tab-panel");
const TABS_CHANGE_EVENT = frontendEventName("tabs");

type TabsState = {
  root: HTMLElement;
  tab: HTMLElement;
  value: string;
};

function tabValue(tab: HTMLElement) {
  return tab.getAttribute(frontendDataAttr("tab")) || tab.getAttribute("aria-controls") || "";
}

function panelForTab(tab: HTMLElement, root: HTMLElement) {
  const target = tab.getAttribute("aria-controls") || tab.getAttribute(frontendDataAttr("tab-target")) || tabValue(tab);
  const scoped = target ? root.querySelector<HTMLElement>(`#${CSS.escape(target.replace(/^#/u, ""))}`) : null;
  return scoped || resolveDocumentTarget(target);
}

function setTabActive(root: HTMLElement, tab: HTMLElement) {
  const value = tabValue(tab);
  queryAll<HTMLElement>(root, TAB_SELECTOR).forEach((item) => {
      const active = item === tab;
      item.setAttribute("aria-selected", active ? "true" : "false");
      item.setAttribute(frontendDataAttr("active"), active ? "true" : "false");
      item.tabIndex = active ? 0 : -1;
  });
  queryAll<HTMLElement>(root, TAB_PANEL_SELECTOR).forEach((panel) => {
      panel.hidden = true;
      panel.setAttribute(frontendDataAttr("active"), "false");
  });
  const panel = panelForTab(tab, root);
  if (panel) {
    panel.hidden = false;
    panel.setAttribute(frontendDataAttr("active"), "true");
  }
  const state = { root, tab, value };
  root.dispatchEvent(new CustomEvent(TABS_CHANGE_EVENT, { bubbles: true, detail: state }));
  return state;
}

function initialTab(root: HTMLElement) {
  return root.querySelector<HTMLElement>(`${TAB_SELECTOR}[aria-selected="true"],${TAB_SELECTOR}${frontendDataSelector("active", "true")}`) ||
    root.querySelector<HTMLElement>(TAB_SELECTOR);
}

function focusSiblingTab(tab: HTMLElement, direction: number) {
  const root = tab.closest<HTMLElement>(TABS_SELECTOR);
  if (!root) return;
  const tabs = queryAll<HTMLElement>(root, TAB_SELECTOR);
  const index = tabs.indexOf(tab);
  const next = tabs[(index + direction + tabs.length) % tabs.length];
  next?.focus();
  if (next) setTabActive(root, next);
}

function bindTabsRoot(root: HTMLElement | null) {
  if (!(root instanceof HTMLElement) || root.hasAttribute(frontendDataAttr("tabs-bound"))) return null;
  root.setAttribute(frontendDataAttr("tabs-bound"), "true");
  queryAll<HTMLElement>(root, TAB_SELECTOR).forEach((tab) => {
      tab.addEventListener("click", (event) => {
          event.preventDefault();
          setTabActive(root, tab);
      });
      tab.addEventListener("keydown", (event) => {
          if (event.key === "ArrowRight") focusSiblingTab(tab, 1);
          else if (event.key === "ArrowLeft") focusSiblingTab(tab, -1);
          else return;
          event.preventDefault();
      });
  });
  const first = initialTab(root);
  return first ? setTabActive(root, first) : null;
}

function bindStaticTabs(root: BindRoot = document) {
  queryAll<HTMLElement>(root, TABS_SELECTOR).forEach(bindTabsRoot);
}

export {
  TAB_PANEL_SELECTOR,
  TAB_SELECTOR,
  TABS_CHANGE_EVENT,
  TABS_SELECTOR,
  bindStaticTabs as bindTabs,
  bindTabsRoot,
  setTabActive,
};
export type { TabsState };
