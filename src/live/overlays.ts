import { cssEscape, requestDomFrame, type BindRoot } from "#er0dlx1gtbzh";
import {
  bindOwnedTabs,
  createTabs,
  dropdownRootConfig,
} from "#z2c0jqmjqds4";
import { LAYOUT_PORTAL_ROOT_ID } from "#ieim4iimrwal";
import { LAYER_ROOT_ID } from "#ccvonx3uhbte";
import {
  MODAL_CONTENT_SELECTOR,
  MODAL_SELECTOR,
  openModal,
} from "#8rm3pzkj3gge";
import { frontendDataAttr } from "#5vbaqj4pirp3";
import { POPOVER_TRIGGER_SELECTOR } from "#knbi1qla9fbx";
import { rehydrate } from "./regions.js";

type LiveOverlayRoot =
BindRoot | string | (() => BindRoot | null | undefined);

type LiveOverlayModalSnapshot = {
  activePanels: string[];
  id: string;
  scrollTop: number;
};

type LiveOverlaySnapshot = {
  modals: LiveOverlayModalSnapshot[];
  windowScrollY: number | null;
};

type LiveOverlayStateOptions = {
  bindTabs?: boolean;
  modalSelector?: string;
  popoverTriggerSelector?: string;
  portaledSelector?: string | string[];
  preserveWindowScroll?: boolean;
  rehydrate?: boolean;
  root?: LiveOverlayRoot;
};

type RestoreLiveOverlayStateOptions = {
  consume?: boolean;
};

const DEFAULT_MODAL_SELECTOR = `${MODAL_SELECTOR}[id]`;
const DROPDOWN_ROOT_SELECTOR = "[data-dropdown-root]";
const DROPDOWN_SHOW_ATTR = "data-dropdown-show";
const DROPDOWN_OPEN_ATTR = "data-dropdown-open";
const DATA_TABS_ROOT_SELECTOR = "[data-tabs-root]";
const TAB_ROOT_SELECTOR = "tabs-root";
const TAB_BUTTON_SELECTOR = "[data-tab-button]";
const SELECTED_TAB_SELECTOR = `${TAB_BUTTON_SELECTOR}[aria-selected='true']`;
const OPEN_ATTR = frontendDataAttr("open");
const OPENING_ATTR = frontendDataAttr("opening");
const POPOVER_ATTR = frontendDataAttr("popover");
const POPOVER_OPEN_ATTR = frontendDataAttr("popover-open");

function resolveConfiguredRoot(root: LiveOverlayRoot | undefined, fallback: BindRoot) {
  if (typeof root === "function") return root() || fallback;
  if (typeof root === "string") return resolveRootSelector(root) || fallback;
  return root || fallback;
}

function resolveRootSelector(selector: string) {
  if (typeof document === "undefined") return null;
  const value = String(selector || "").trim();
  if (!value) return null;
  if (value.startsWith("#")) return document.getElementById(value.slice(1));
  try {
    return document.querySelector(value);
  } catch {
    return null;
  }
}

function defaultRoot() {
  return typeof document !== "undefined" ? document : null;
}

function liveOverlayRoot(options: LiveOverlayStateOptions, fallback?: BindRoot) {
  const base = fallback || defaultRoot();
  if (!base) return null;
  return resolveConfiguredRoot(options.root, base);
}

function resolveLayoutPortalElement() {
  if (typeof document === "undefined") return null;
  const root = document.getElementById(LAYOUT_PORTAL_ROOT_ID);
  return root instanceof HTMLElement ? root : null;
}

function resolveLayerRootElement() {
  if (typeof document === "undefined") return null;
  const root = document.getElementById(LAYER_ROOT_ID);
  return root instanceof HTMLElement ? root : null;
}

function overlayPortalRoots() {
  const roots = [resolveLayoutPortalElement(), resolveLayerRootElement()].filter(
    (root): root is HTMLElement => root instanceof HTMLElement,
  );
  return Array.from(new Set(roots));
}

function queryElements(root: ParentNode | null | undefined, selector: string) {
  const value = String(selector || "").trim();
  if (!root || !value || typeof root.querySelectorAll !== "function") return [];
  try {
    return Array.from(root.querySelectorAll(value))
    .filter((node): node is HTMLElement => node instanceof HTMLElement);
  } catch {
    return [];
  }
}

function modalOpenSelector(selector: string) {
  return [
    `${selector}[${OPEN_ATTR}="true"][id]`,
    `${selector}[${OPENING_ATTR}="true"][id]`,
  ].join(", ");
}

function tabRoots(modal: HTMLElement) {
  return Array.from(modal.querySelectorAll(TAB_ROOT_SELECTOR))
  .map((host) => host.firstElementChild)
  .filter((root): root is HTMLElement => root instanceof HTMLElement);
}

function modalActivePanels(modal: HTMLElement) {
  return tabRoots(modal).map((root) => {
      const active = root.querySelector(SELECTED_TAB_SELECTOR);
      return active instanceof HTMLElement
      ? String(active.getAttribute("aria-controls") || "").trim()
      : "";
  });
}

function modalContentScrollTop(modal: HTMLElement) {
  const content = modal.querySelector(MODAL_CONTENT_SELECTOR);
  return content instanceof HTMLElement ? content.scrollTop : 0;
}

function uniqueOpenModals(options: LiveOverlayStateOptions) {
  const root = liveOverlayRoot(options);
  if (!root) return [];
  const selector = modalOpenSelector(
    String(options.modalSelector || DEFAULT_MODAL_SELECTOR).trim() ||
      DEFAULT_MODAL_SELECTOR,
  );
  const byId = new Map<string, HTMLElement>();
  for (const scope of [root, ...overlayPortalRoots()]) {
    for (const modal of queryElements(scope, selector)) {
      if (modal.id && !byId.has(modal.id)) byId.set(modal.id, modal);
    }
  }
  return Array.from(byId.values());
}

function captureLiveOverlayState(
  options: LiveOverlayStateOptions = {},
): LiveOverlaySnapshot {
  return {
    modals: uniqueOpenModals(options).map((modal) => ({
          activePanels: modalActivePanels(modal),
          id: modal.id,
          scrollTop: modalContentScrollTop(modal),
    })),
    windowScrollY:
    options.preserveWindowScroll === true && typeof window !== "undefined"
    ? window.scrollY
    : null,
  };
}

function restoreModalTabs(modal: HTMLElement, activePanels: string[]) {
  tabRoots(modal).forEach((root, index) => {
      const panelId = String(activePanels[index] || "").trim();
      const controller = createTabs(root, { force: true });
      const tab = panelId
      ? root.querySelector(
        `${TAB_BUTTON_SELECTOR}[aria-controls="${cssEscape(panelId)}"]`,
      )
      : null;
      if (
        tab instanceof HTMLElement &&
          controller &&
          typeof controller.activateTab === "function"
      ) {
        controller.activateTab(tab);
      }
  });
}

function restoreModalSnapshot(snapshot: LiveOverlayModalSnapshot) {
  if (typeof document === "undefined") return;
  const modal = document.getElementById(snapshot.id);
  if (!(modal instanceof HTMLElement)) return;
  bindOwnedTabs(modal, { force: true });
  restoreModalTabs(modal, snapshot.activePanels);
  openModal(modal, null);
  requestDomFrame(() => {
      bindOwnedTabs(modal, { force: true });
      restoreModalTabs(modal, snapshot.activePanels);
      const content = modal.querySelector(MODAL_CONTENT_SELECTOR);
      if (content instanceof HTMLElement) content.scrollTop = snapshot.scrollTop;
  });
}

function restoreWindowScroll(snapshot: LiveOverlaySnapshot) {
  if (snapshot.windowScrollY == null || typeof window === "undefined") return;
  requestDomFrame(() => {
      if (Math.abs(window.scrollY - snapshot.windowScrollY!) <= 1) return;
      window.scrollTo({
          behavior: "instant" as ScrollBehavior,
          left: window.scrollX,
          top: snapshot.windowScrollY!,
      });
  });
}

function restoreLiveOverlayState(snapshot: LiveOverlaySnapshot | null | undefined) {
  if (!snapshot) return false;
  snapshot.modals.forEach(restoreModalSnapshot);
  restoreWindowScroll(snapshot);
  return true;
}

function normalizeSelectorList(selector: string | string[] | undefined) {
  return (Array.isArray(selector) ? selector : [selector || ""])
  .map((item) => String(item || "").trim())
  .filter(Boolean)
  .join(", ");
}

function removeStalePortaledOverlays(
  options: LiveOverlayStateOptions = {},
  rootInput?: ParentNode,
) {
  const selector = normalizeSelectorList(options.portaledSelector);
  if (!selector) return;
  const root = rootInput || liveOverlayRoot(options);
  if (!(root instanceof HTMLElement)) return;
  overlayPortalRoots().forEach((portal) => {
      queryElements(portal, selector).forEach((node) => {
          if (!root.contains(node)) node.remove();
      });
  });
}

function restoreMovedDropdowns(root: ParentNode | null | undefined) {
  queryElements(root, DROPDOWN_ROOT_SELECTOR).forEach((drop) => {
      const optionsId = String(dropdownRootConfig(drop).optionsId || "").trim();
      if (!optionsId || typeof document === "undefined") return;
      const options = document.getElementById(optionsId);
      if (!(options instanceof HTMLElement) || drop.contains(options)) return;
      options.removeAttribute(DROPDOWN_SHOW_ATTR);
      drop.removeAttribute(DROPDOWN_OPEN_ATTR);
      drop.appendChild(options);
  });
}

function restoreMovedPopovers(
  root: ParentNode | null | undefined,
  selector: string,
) {
  queryElements(root, selector).forEach((trigger) => {
      const popoverId = String(trigger.getAttribute("aria-controls") || "").trim();
      const parent = trigger.parentElement;
      if (!popoverId || !(parent instanceof HTMLElement) || typeof document === "undefined") {
        return;
      }
      const popover = document.getElementById(popoverId);
      if (!(popover instanceof HTMLElement) || parent.contains(popover)) return;
      popover.removeAttribute(OPEN_ATTR);
      popover.setAttribute(POPOVER_ATTR, "");
      popover.setAttribute("aria-hidden", "true");
      popover.setAttribute("inert", "");
      trigger.setAttribute("aria-expanded", "false");
      trigger.removeAttribute(POPOVER_OPEN_ATTR);
      parent.appendChild(popover);
  });
}

function restoreMovedLiveOverlays(
  options: LiveOverlayStateOptions = {},
  rootInput?: ParentNode,
) {
  const root = rootInput || liveOverlayRoot(options);
  if (!root) return;
  restoreMovedDropdowns(root);
  restoreMovedPopovers(
    root,
    String(options.popoverTriggerSelector || POPOVER_TRIGGER_SELECTOR).trim() ||
      POPOVER_TRIGGER_SELECTOR,
  );
}

function bindLiveOverlayTabs(root: BindRoot) {
  if (root instanceof Element) {
    bindOwnedTabs(root, { force: true });
    return;
  }
  queryElements(root, DATA_TABS_ROOT_SELECTOR).forEach((tabsRoot) => {
      bindOwnedTabs(tabsRoot, { force: true });
  });
}

function syncLiveOverlayRoot(
  options: LiveOverlayStateOptions = {},
  rootInput?: BindRoot,
) {
  const root = liveOverlayRoot(options, rootInput);
  if (!root) return null;
  removeStalePortaledOverlays(options, root);
  if (options.rehydrate !== false) rehydrate(root);
  if (options.bindTabs !== false) bindLiveOverlayTabs(root);
  return root;
}

function createLiveOverlayState(options: LiveOverlayStateOptions = {}) {
  let pending: LiveOverlaySnapshot | null = null;

  function preserve() {
    const snapshot = captureLiveOverlayState(options);
    if (snapshot.modals.length || snapshot.windowScrollY != null) pending = snapshot;
    return snapshot;
  }

  function restore(restoreOptions: RestoreLiveOverlayStateOptions = {}) {
    const snapshot = pending;
    if (restoreOptions.consume !== false) pending = null;
    return restoreLiveOverlayState(snapshot);
  }

  return {
    capture: () => captureLiveOverlayState(options),
    pending: () => pending,
    prepareForUpdate() {
      const snapshot = preserve();
      restoreMovedLiveOverlays(options);
      return snapshot;
    },
    preserve,
    removeStalePortaledOverlays: (root?: ParentNode) =>
    removeStalePortaledOverlays(options, root),
    restore,
    restoreMovedOverlays: (root?: ParentNode) =>
    restoreMovedLiveOverlays(options, root),
    restoreSoon(restoreOptions: RestoreLiveOverlayStateOptions = {}) {
      const consume =
      restoreOptions.consume === undefined ? false : restoreOptions.consume;
      requestDomFrame(() => {
          syncLiveOverlayRoot(options);
          restore({ consume });
      });
    },
    syncAfterUpdate(restoreOptions: RestoreLiveOverlayStateOptions = {}) {
      syncLiveOverlayRoot(options);
      return restore(restoreOptions);
    },
  };
}

export {
  captureLiveOverlayState,
  createLiveOverlayState,
  removeStalePortaledOverlays,
  restoreLiveOverlayState,
  restoreMovedLiveOverlays,
};
export type {
  LiveOverlayModalSnapshot,
  LiveOverlayRoot,
  LiveOverlaySnapshot,
  LiveOverlayStateOptions,
  RestoreLiveOverlayStateOptions,
};
