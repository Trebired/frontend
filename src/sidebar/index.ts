import {
  browserLocalStorage,
  cssEscape,
  queryAll,
  resolveDocumentTarget,
  setAriaExpanded,
  setControlDisabled,
  type BindRoot,
} from "#er0dlx1gtbzh";
import {
  bindDynamicSidebarLive,
  type DynamicSidebarLiveOptions,
} from "./dynamic/runtime/index.js";
import { bindSidebarLiveSlots } from "./live.js";
import { frontendDataAttr, frontendDataSelector, frontendEventName } from "#5vbaqj4pirp3";
import { softRedirect } from "#xhefk4bgh568";

const SIDEBAR_SHELL_SELECTOR = frontendDataSelector("sidebar-shell");
const SIDEBAR_MINIMIZE_SELECTOR = `${frontendDataSelector("sidebar-minimize")}[aria-controls]`;
const SIDEBAR_OPEN_SELECTOR = `${frontendDataSelector("sidebar-open")}[aria-controls]`;
const SIDEBAR_CLOSE_SELECTOR = frontendDataSelector("sidebar-close");
const SIDEBAR_LINK_SELECTOR = `${frontendDataSelector("sidebar-link")}[href]`;
const SIDEBAR_BOOT_ATTRIBUTE = frontendDataAttr("sidebar-boot");
const SIDEBAR_STATE_EVENT = frontendEventName("sidebar-state");
const SIDEBAR_STORAGE_PREFIX = `${frontendEventName("sidebar")}:`;

type SidebarSide = "left" | "right" | string;

type SidebarState = {
  minimized: boolean;
  open: boolean;
  shell: HTMLElement;
  side: SidebarSide;
};

type SidebarPersistenceAdapter = (state: SidebarState) => Promise<unknown>|unknown;

type SidebarRuntimeOptions = {
  dynamicLive?: DynamicSidebarLiveOptions;
  persistence?: SidebarPersistenceAdapter;
};

const shellStates = new WeakMap<HTMLElement, SidebarState>();
const minimizeButtons = new WeakMap<HTMLElement, HTMLElement[]>();
const boundMinimizeButtons = new WeakSet<HTMLElement>();
const boundOpenButtons = new WeakSet<HTMLElement>();
const boundCloseButtons = new WeakSet<HTMLElement>();
const boundSidebarLinks = new WeakSet<HTMLAnchorElement>();
let sharedListenersInstalled = false;

function isModifiedLinkClick(event: MouseEvent) {
  return Boolean(
    event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0,
  );
}

function sidebarSoftRedirectTarget(link: HTMLAnchorElement) {
  if (link.hasAttribute("download")) return "";
  if (link.target && link.target !== "_self") return "";
  if (link.getAttribute("aria-disabled") === "true") return "";
  if (link.getAttribute(frontendDataAttr("disabled")) === "true") return "";
  if (link.closest(frontendDataSelector("full-reload"))) return "";

  const href = String(link.getAttribute("href") || "").trim();
  if (!href || href.startsWith("#")) return "";
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return "";
    if (
      url.hash &&
        url.pathname === window.location.pathname &&
        url.search === window.location.search
    ) {
      return "";
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "";
  }
}

function bindSidebarLink(link: HTMLAnchorElement) {
  if (boundSidebarLinks.has(link)) return;
  boundSidebarLinks.add(link);
  link.addEventListener("click", (event) => {
      if (event.defaultPrevented || isModifiedLinkClick(event)) return;
      const target = sidebarSoftRedirectTarget(link);
      if (!target) return;
      event.preventDefault();
      void softRedirect(target);
  });
}

function storageKey(side: SidebarSide) {
  return `${SIDEBAR_STORAGE_PREFIX}${String(side || "left")}:minimized`;
}

function normalizeSide(value: unknown): SidebarSide {
  const side = String(value || "left").trim();
  return side || "left";
}

function isPersistent(shell: HTMLElement) {
  return shell.getAttribute(frontendDataAttr("sidebar-persist")) !== "false";
}

function readSavedMinimized(side: SidebarSide) {
  const storage = browserLocalStorage();
  const saved = storage?.getItem(storageKey(side));
  if (saved === "1") return true;
  if (saved === "0") return false;
  return false;
}

function writeSavedMinimized(side: SidebarSide, minimized: boolean) {
  const storage = browserLocalStorage();
  if (!storage) return;
  storage.setItem(storageKey(side), minimized ? "1" : "0");
}

function dispatchSidebarState(state: SidebarState) {
  state.shell.dispatchEvent(new CustomEvent(SIDEBAR_STATE_EVENT, {
        bubbles: true,
        detail: { ...state },
  }));
}

function applyBodyState(state: SidebarState) {
  const body = typeof document !== "undefined" ? document.body : null;
  if (!body) return;
  const side = String(state.side || "left");
  body.setAttribute(frontendDataAttr(`sidebar-${side}`), "true");
  body.setAttribute(frontendDataAttr(`sidebar-${side}-minimized`), state.minimized ? "true" : "false");
  body.setAttribute(frontendDataAttr(`sidebar-${side}-open`), state.open ? "true" : "false");
}

function syncSidebarButtons(shell: HTMLElement, state: SidebarState) {
  for (const button of minimizeButtons.get(shell) || []) {
    setAriaExpanded(button, !state.minimized);
    button.setAttribute(frontendDataAttr("sidebar-minimized"), state.minimized ? "true" : "false");
  }
}

function applySidebarState(
  shell: HTMLElement,
  next: Partial<Pick<SidebarState, "minimized"|"open">>,
) {
  const current = shellStates.get(shell) || {
    minimized: false,
    open: false,
    shell,
    side: normalizeSide(shell.getAttribute(frontendDataAttr("sidebar-side"))),
  };
  const state = {
    ...current,
    ...next,
    shell,
    side: normalizeSide(shell.getAttribute(frontendDataAttr("sidebar-side")) || current.side),
  };
  shellStates.set(shell, state);
  shell.setAttribute(frontendDataAttr("sidebar-minimized"), state.minimized ? "true" : "false");
  shell.setAttribute(frontendDataAttr("sidebar-open"), state.open ? "true" : "false");
  applyBodyState(state);
  syncSidebarButtons(shell, state);
  dispatchSidebarState(state);
  return state;
}

function resolveSidebarShell(root: BindRoot, value: unknown) {
  const id = String(value || "").trim();
  if (!id) return null;
  const scoped = root.querySelector(`#${cssEscape(id)}`);
  if (scoped instanceof HTMLElement) return scoped;
  return resolveDocumentTarget(`#${id}`);
}

async function persistSidebarState(
  state: SidebarState,
  options: SidebarRuntimeOptions,
) {
  if (isPersistent(state.shell)) writeSavedMinimized(state.side, state.minimized);
  await options.persistence?.(state);
}

async function setSidebarMinimized(
  shell: HTMLElement,
  minimized: boolean,
  options: SidebarRuntimeOptions = {},
) {
  const previous = shellStates.get(shell);
  const state = applySidebarState(shell, { minimized });
  try {
    await persistSidebarState(state, options);
  } catch (error) {
    if (previous) applySidebarState(shell, { minimized: previous.minimized });
    throw error;
  }
  return state;
}

function setSidebarOpen(shell: HTMLElement, open: boolean) {
  return applySidebarState(shell, { open });
}

function toggleSidebarMinimized(
  shell: HTMLElement,
  options: SidebarRuntimeOptions = {},
) {
  const current = shellStates.get(shell) || bindSidebarShell(shell, options);
  if (!current) return null;
  return setSidebarMinimized(shell, !current.minimized, options);
}

function openSidebar(shell: HTMLElement) {
  return setSidebarOpen(shell, true);
}

function closeSidebar(shell: HTMLElement) {
  return setSidebarOpen(shell, false);
}

function bindSidebarShell(
  shell: HTMLElement | null,
  options: SidebarRuntimeOptions = {},
) {
  if (!(shell instanceof HTMLElement)) return null;
  const side = normalizeSide(shell.getAttribute(frontendDataAttr("sidebar-side")));
  const attrMinimized = shell.getAttribute(frontendDataAttr("sidebar-minimized"));
  const minimized = attrMinimized === "true" || (attrMinimized == null && isPersistent(shell) && readSavedMinimized(side));
  const state = applySidebarState(shell, {
      minimized,
      open: shell.getAttribute(frontendDataAttr("sidebar-open")) === "true",
  });
  void options;
  return state;
}

function setButtonBusy(button: HTMLElement, busy: boolean) {
  button.setAttribute("aria-busy", busy ? "true" : "false");
  setControlDisabled(button, busy);
}

function bindSidebarMinimizeButton(
  button: HTMLElement | null,
  root: BindRoot = document,
  options: SidebarRuntimeOptions = {},
) {
  if (!(button instanceof HTMLElement) || boundMinimizeButtons.has(button)) return null;
  const shell = resolveSidebarShell(root, button.getAttribute("aria-controls"));
  if (!(shell instanceof HTMLElement)) return null;
  const buttons = minimizeButtons.get(shell) || [];
  buttons.push(button);
  minimizeButtons.set(shell, buttons);
  boundMinimizeButtons.add(button);
  bindSidebarShell(shell, options);
  button.addEventListener("click", (event) => {
      event.preventDefault();
      setButtonBusy(button, true);
      void Promise.resolve(toggleSidebarMinimized(shell, options)).finally(() => {
          setButtonBusy(button, false);
      });
  });
  return shell;
}

function bindSidebarOpenButton(button: HTMLElement | null, root: BindRoot = document) {
  if (!(button instanceof HTMLElement) || boundOpenButtons.has(button)) return null;
  const shell = resolveSidebarShell(root, button.getAttribute("aria-controls"));
  if (!(shell instanceof HTMLElement)) return null;
  boundOpenButtons.add(button);
  button.addEventListener("click", (event) => {
      event.preventDefault();
      openSidebar(shell);
  });
  return shell;
}

function bindSidebarCloseButton(button: HTMLElement | null) {
  if (!(button instanceof HTMLElement) || boundCloseButtons.has(button)) return null;
  const shell = button.closest<HTMLElement>(SIDEBAR_SHELL_SELECTOR);
  if (!(shell instanceof HTMLElement)) return null;
  boundCloseButtons.add(button);
  button.addEventListener("click", (event) => {
      event.preventDefault();
      closeSidebar(shell);
  });
  return shell;
}

function closeOpenSidebarFromEvent(event: Event) {
  const target = event.target instanceof Node ? event.target : null;
  if (!target) return;
  for (const shell of queryAll<HTMLElement>(document, `${SIDEBAR_SHELL_SELECTOR}${frontendDataSelector("sidebar-open", "true")}`)) {
    if (shell.contains(target)) continue;
    if (target instanceof Element && target.closest(SIDEBAR_OPEN_SELECTOR)) continue;
    closeSidebar(shell);
  }
}

function installSharedSidebarListeners() {
  if (sharedListenersInstalled || typeof document === "undefined") return;
  sharedListenersInstalled = true;
  document.addEventListener("click", closeOpenSidebarFromEvent);
  document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      queryAll<HTMLElement>(document, `${SIDEBAR_SHELL_SELECTOR}${frontendDataSelector("sidebar-open", "true")}`)
      .forEach(closeSidebar);
  });
}

function bindSidebars(root: BindRoot = document, options: SidebarRuntimeOptions = {}) {
  queryAll<HTMLElement>(root, SIDEBAR_SHELL_SELECTOR).forEach((shell) => {
      bindSidebarShell(shell, options);
  });
  queryAll<HTMLElement>(root, SIDEBAR_MINIMIZE_SELECTOR).forEach((button) => {
      bindSidebarMinimizeButton(button, root, options);
  });
  queryAll<HTMLElement>(root, SIDEBAR_OPEN_SELECTOR).forEach((button) => {
      bindSidebarOpenButton(button, root);
  });
  queryAll<HTMLElement>(root, SIDEBAR_CLOSE_SELECTOR).forEach(bindSidebarCloseButton);
  queryAll<HTMLAnchorElement>(root, SIDEBAR_LINK_SELECTOR).forEach(bindSidebarLink);
  bindSidebarLiveSlots(root);
  bindDynamicSidebarLive(root, options.dynamicLive);
  installSharedSidebarListeners();
}

function createSidebarBootScript(sides: SidebarSide[] = ["left"]): string {
  const payload = JSON.stringify({
      attrPrefix: frontendDataAttr("sidebar-"),
      prefix: SIDEBAR_STORAGE_PREFIX,
      sides,
  }).replace(/</gu, "\\u003c");
  return [
    "(function(){try{",
    `var config=${payload};`,
    "var storage=window.localStorage;",
    "for(var i=0;i<config.sides.length;i++){",
    "var side=String(config.sides[i]||'left');",
    "var value=storage&&storage.getItem(config.prefix+side+':minimized');",
    "if(value==='1'||value==='0'){document.body.setAttribute(config.attrPrefix+side+'-minimized',value==='1'?'true':'false');}",
    "}",
    "}catch(e){}})();",
  ].join("");
}

export {
  SIDEBAR_BOOT_ATTRIBUTE,
  SIDEBAR_CLOSE_SELECTOR,
  SIDEBAR_MINIMIZE_SELECTOR,
  SIDEBAR_OPEN_SELECTOR,
  SIDEBAR_SHELL_SELECTOR,
  SIDEBAR_STATE_EVENT,
  bindSidebarCloseButton,
  bindSidebarMinimizeButton,
  bindSidebarOpenButton,
  bindSidebarShell,
  bindSidebars,
  closeSidebar,
  createSidebarBootScript,
  openSidebar,
  setSidebarMinimized,
  setSidebarOpen,
  toggleSidebarMinimized,
};
export *from "./live.js";
export *from "./dynamic/index.js";
export type { SidebarPersistenceAdapter, SidebarRuntimeOptions, SidebarSide, SidebarState };
