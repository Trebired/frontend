import { toString } from "#dqy2d22qyujv";
import {
  bindTabTooltip,
  hidePane,
  hoistNestedFamily,
  initializeOwnedNodes,
  ownedNodes,
  paneForTab,
  scheduleOverflowSync,
  showPane,
  syncNestedGroups,
  syncNestedIndicatorRow,
  syncNestedTabsIndicator,
  uiContainer,
} from "./manager/dom.js";
import {
  familyKeyForRoot,
  isRootVisible,
  routeTokenForRoot,
  tabToken,
  writeRoute,
} from "./manager/route.js";
import { registeredTabRoots, registerTabRoot } from "./manager/registry.js";

const tabBindings = new WeakMap<HTMLElement, ReturnType<typeof createTabs>>();
let tabSwitchListenerBound = false;

function validTabsController(root, controller) {
  if (!controller || controller.root !== root) return false;
  const tabs = Array.isArray(controller.tabs) ? controller.tabs : [];
  return Boolean(
    tabs.length &&
      tabs.every(
      (tab) =>
      tab instanceof HTMLElement && tab.isConnected && root.contains(tab),
    ),
  );
}

function disposeTabsController(root, controller) {
  if (controller && typeof controller.destroy === "function")
  controller.destroy();
  tabBindings.delete(root);
}

function activeTab(context) {
  return (
    context.tabs.find((tab) => tab.getAttribute("aria-selected") === "true") ||
      null
  );
}

function syncTabState(context, nextTab, animate) {
  context.tabs.forEach((tab) => {
      const active = tab === nextTab;
      tab.setAttribute("aria-selected", active ? "true" : "false");
      if (tab instanceof HTMLAnchorElement) {
        if (active) tab.setAttribute("aria-current", "page");
        else tab.removeAttribute("aria-current");
      }
      const pane = paneForTab(tab);
      if (!pane) return;
      if (active) showPane(pane, animate);
      else hidePane(pane);
  });
}

function dispatchTabsChange(context, nextTab) {
  context.root.dispatchEvent(
    new CustomEvent("tabs:change", {
        bubbles: true,
        detail: {
          pane: paneForTab(nextTab),
          tab: nextTab,
        },
    }),
  );
}

function setActiveTab(context, nextTab, updateHash, animate) {
  syncTabState(context, nextTab, animate);
  syncNestedGroups(context.root, nextTab);
  syncNestedIndicatorRow(context.root);
  if (updateHash) writeRoute();
  dispatchTabsChange(context, nextTab);
}

function applyInitialState(context) {
  const token = routeTokenForRoot(context.root);
  if (token) {
    const matching = context.tabs.find((tab) => tabToken(tab) === token);
    if (matching) {
      setActiveTab(context, matching, false, false);
      return;
    }
  }

  const selected = activeTab(context) || context.tabs[0];
  if (selected) setActiveTab(context, selected, false, false);
}

function handleTabClick(context, event) {
  const target = event.target instanceof Element ? event.target : null;
  const tab =
  target && target.closest ? target.closest("[data-tab-button]") : null;
  if (!(tab instanceof HTMLElement)) return;
  if (!context.tabs.includes(tab)) return;
  event.preventDefault();
  setActiveTab(context, tab, true, true);
}

function handleRouteChange(context) {
  const token = routeTokenForRoot(context.root);
  const matching = token
  ? context.tabs.find((tab) => tabToken(tab) === token)
  : null;
  const fallback = activeTab(context) || context.tabs[0];
  if (matching) setActiveTab(context, matching, false, false);
  else if (fallback) setActiveTab(context, fallback, false, false);
}

function prepareTabsContext(root, options: any = {}) {
  if (!(root instanceof HTMLElement)) return null;
  if (
    root.closest("[data-live-island-root][data-live-island-hydrated='false']")
  )
  return null;
  const existing = tabBindings.get(root);
  if (existing) {
    if (options && options.force === true) {
      disposeTabsController(root, existing);
    } else if (validTabsController(root, existing)) {
      return { controller: existing };
    } else {
      disposeTabsController(root, existing);
    }
  }

  root.removeAttribute("data-tabs-ready");
  initializeOwnedNodes(root);
  hoistNestedFamily(root);
  const family = uiContainer(root);
  const tabs = ownedNodes(root, "[data-tab-button]").filter(
    (tab) => tab instanceof HTMLElement,
  );
  if (!tabs.length) return null;
  return { family, root, tabs };
}

function preparePanes(context) {
  const panes = context.tabs
  .map((tab) => paneForTab(tab))
  .filter((pane) => pane instanceof HTMLElement);
  panes.forEach((pane) => {
      pane.setAttribute("role", "tabpanel");
  });
}

function prepareTabs(context) {
  context.tabs.forEach((tab) => {
      tab.setAttribute("role", "tab");
      syncNestedTabsIndicator(tab);
      bindTabTooltip(tab);
  });
}

function prepareTabList(context) {
  const list = ownedNodes(context.root, "[data-tabs-list]")[0];
  if (list instanceof HTMLElement) list.setAttribute("role", "tablist");
}

function bindTabsEvents(context) {
  const onClick = (event) => handleTabClick(context, event);
  const onPopState = () => handleRouteChange(context);
  const onResize = () => {
    scheduleOverflowSync(context.root);
    syncNestedIndicatorRow(context.root);
  };

  if (context.family instanceof HTMLElement) {
    context.family.addEventListener("click", onClick);
  }
  window.addEventListener("popstate", onPopState);
  window.addEventListener("resize", onResize);

  return function cleanupTabsEvents() {
    if (context.family instanceof HTMLElement) {
      context.family.removeEventListener("click", onClick);
    }
    window.removeEventListener("popstate", onPopState);
    window.removeEventListener("resize", onResize);
  };
}

function finalizeInitialState(context) {
  applyInitialState(context);
  syncNestedGroups(context.root, activeTab(context));
  scheduleOverflowSync(context.root);
  syncNestedIndicatorRow(context.root);
  context.root.setAttribute("data-tabs-ready", "true");
}

function createTabsController(context, cleanup) {
  return {
    activateByHash(hash) {
      const matching = context.tabs.find(
        (tab) => tabToken(tab) === toString(hash).replace(/^#/, ""),
      );
      if (matching) setActiveTab(context, matching, true, true);
    },
    activateTab(tab) {
      if (!context.tabs.includes(tab)) return;
      setActiveTab(context, tab, true, true);
    },
    destroy() {
      if (typeof cleanup === "function") cleanup();
    },
    family: context.family,
    root: context.root,
    tabs: context.tabs,
  };
}

function createTabs(root, options = {}) {
  const context = prepareTabsContext(root, options);
  if (!context) return null;
  if (context.controller) return context.controller;

  preparePanes(context);
  prepareTabs(context);
  prepareTabList(context);
  const cleanup = bindTabsEvents(context);
  finalizeInitialState(context);
  registerTabRoot(context.root);

  const controller = createTabsController(context, cleanup);
  tabBindings.set(root, controller);
  return controller;
}

function activateTabByFamily(family, route) {
  const wantFamily = toString(family);
  const wantRoute = toString(route);
  if (!wantFamily || !wantRoute) return false;

  for (const root of registeredTabRoots()) {
    if (familyKeyForRoot(root) !== wantFamily) continue;
    if (!isRootVisible(root)) continue;

    const controller = tabBindings.get(root);
    const list =
    controller && Array.isArray(controller.tabs) ? controller.tabs : [];
    const tab = list.find((candidate) => tabToken(candidate) === wantRoute);
    if (tab && controller && typeof controller.activateTab === "function") {
      controller.activateTab(tab);
      return true;
    }
  }
  return false;
}

function ensureTabSwitchListener() {
  if (tabSwitchListenerBound || typeof document === "undefined") return;
  tabSwitchListenerBound = true;

  document.addEventListener("tabs:switch", function (event: CustomEvent) {
      const detail =
      event && event.detail && typeof event.detail === "object"
      ? event.detail
      : {};
      const switches = Array.isArray(detail.switches)
      ? detail.switches
      : [detail];
      switches.forEach((entry) => {
          const family =
          entry && typeof entry === "object"
          ? toString(entry.family || entry.key)
          : "";
          if (family && entry && entry.route)
          activateTabByFamily(family, entry.route);
      });
  });
}

function bindTabs(root: HTMLElement | null, options: any = {}) {
  ensureTabSwitchListener();
  if (!(root instanceof HTMLElement)) return null;
  return createTabs(root, options);
}

function tabsRootFromHost(host: Element | null) {
  return host instanceof HTMLElement && host.matches("[data-tabs-root]")
  ? host
  : null;
}

function bindTabsHost(host: Element | null, options: any = {}) {
  return bindTabs(tabsRootFromHost(host), options);
}

function bindOwnedTabs(owner: Element | null, options: any = {}) {
  ensureTabSwitchListener();
  if (!(owner instanceof Element)) return [];
  const hosts =
  owner.matches("[data-tabs-root]")
  ? [owner]
  : Array.from(owner.querySelectorAll("[data-tabs-root]"));
  return hosts.map((host) => bindTabsHost(host, options)).filter(Boolean);
}

export {
  activateTabByFamily,
  activateTabByFamily as activateTabByQuery,
  bindOwnedTabs,
  bindTabs,
  bindTabsHost,
  createTabs,
};
