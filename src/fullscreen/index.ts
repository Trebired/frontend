import { queryAll, resolveDocumentTarget, type BindRoot } from "#er0dlx1gtbzh";
import {
  applyZIndex,
  clearZIndex,
  moveLayerElementToTop,
  portalElement,
} from "#ccvonx3uhbte";

const FULLSCREEN_BASE_Z_INDEX = 1120;
const FULLSCREEN_TRIGGER_SELECTOR = [
  "[data-tbf-fullscreen-trigger]",
  "[data-tbf-fullscreen-toggle]",
  "[data-tbf-fullscreen-enter]",
  "[data-tbf-fullscreen-exit]",
].join(",");
const FULLSCREEN_TARGET_SELECTOR = "[data-tbf-fullscreen-target][data-tbf-fullscreen-id][data-tbf-fullscreen-group]";
const FULLSCREEN_STORAGE_PREFIX = "tbf:fullscreen:";

type FullscreenRuntimeOptions = {
  target?: Element | string | null;
};

type FullscreenTriggerMode = "close" | "exit" | "open" | "toggle";

type FullscreenPanelState = {
  group: string;
  id: string;
  nextSibling: ChildNode | null;
  originalParent: Node | null;
  originalStyle: string | null;
  overlay: HTMLElement;
  placeholder: HTMLElement;
  target: HTMLElement;
  trigger: HTMLElement | null;
};

const targetRegistry = new Map<string, HTMLElement>();
const boundTriggers = new WeakSet<HTMLElement>();
let panelState: FullscreenPanelState | null = null;
let panelListenersInstalled = false;
let originalBodyOverflow = "";
let originalBodyPaddingRight = "";

function fullscreenElement(): Element | null {
  return typeof document === "undefined" ? null : document.fullscreenElement;
}

function fullscreenSupported(): boolean {
  return typeof document !== "undefined" && Boolean(document.fullscreenEnabled);
}

function resolveFullscreenTarget(target?: Element | string | null): Element | null {
  if (target instanceof Element) return target;
  if (target) return resolveDocumentTarget(target);
  return typeof document !== "undefined" ? document.documentElement : null;
}

async function enterFullscreen(target?: Element | string | null): Promise<boolean> {
  const element = resolveFullscreenTarget(target);
  if (!element || typeof element.requestFullscreen !== "function") return false;
  await element.requestFullscreen();
  document.dispatchEvent(new CustomEvent("tbf:fullscreen-enter", { bubbles: true, detail: { target: element } }));
  return true;
}

async function exitFullscreen(): Promise<boolean> {
  if (!fullscreenElement() || typeof document.exitFullscreen !== "function") return false;
  await document.exitFullscreen();
  document.dispatchEvent(new CustomEvent("tbf:fullscreen-exit", { bubbles: true }));
  return true;
}

async function toggleFullscreen(target?: Element | string | null): Promise<boolean> {
  return fullscreenElement() ? exitFullscreen() : enterFullscreen(target);
}

function readNativeTriggerTarget(trigger: HTMLElement, fallback?: Element | string | null): Element | string | null {
  const value = trigger.getAttribute("data-tbf-fullscreen-target");
  return value || fallback || null;
}

function fullscreenTargetKey(id: unknown, group: unknown) {
  return `${String(group || "default").trim() || "default"}:${String(id || "").trim()}`;
}

function readPanelId(element: HTMLElement) {
  return String(element.getAttribute("data-tbf-fullscreen-id") || "").trim();
}

function readPanelGroup(element: HTMLElement) {
  return String(element.getAttribute("data-tbf-fullscreen-group") || "default").trim() || "default";
}

function readPanelTriggerMode(trigger: HTMLElement): FullscreenTriggerMode {
  const explicit = String(trigger.getAttribute("data-tbf-fullscreen-mode") || "").trim().toLowerCase();
  if (explicit === "close" || explicit === "exit" || explicit === "open" || explicit === "toggle") {
    return explicit;
  }
  if (trigger.hasAttribute("data-tbf-fullscreen-exit")) return "exit";
  if (trigger.hasAttribute("data-tbf-fullscreen-enter")) return "open";
  return "toggle";
}

function targetShouldPersist(target: HTMLElement) {
  return target.getAttribute("data-tbf-fullscreen-persist") === "true";
}

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function readStoredPanelId(group: string) {
  return storage()?.getItem(`${FULLSCREEN_STORAGE_PREFIX}${group}`) || "";
}

function writeStoredPanelId(group: string, id: string) {
  storage()?.setItem(`${FULLSCREEN_STORAGE_PREFIX}${group}`, id);
}

function clearStoredPanelId(group: string) {
  storage()?.removeItem(`${FULLSCREEN_STORAGE_PREFIX}${group}`);
}

function lockDocumentScroll(lock: boolean) {
  if (!document.body) return;
  if (lock) {
    originalBodyOverflow = document.body.style.overflow;
    originalBodyPaddingRight = document.body.style.paddingRight;
    const scrollbarGap = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    if (scrollbarGap > 0) {
      const currentPadding = Number.parseFloat(window.getComputedStyle(document.body).paddingRight || "0") || 0;
      document.body.style.paddingRight = `${currentPadding + scrollbarGap}px`;
    }
    document.body.style.overflow = "hidden";
    document.documentElement.setAttribute("data-tbf-fullscreen-scroll-locked", "true");
    document.body.setAttribute("data-tbf-fullscreen-scroll-locked", "true");
    return;
  }
  document.body.style.overflow = originalBodyOverflow;
  document.body.style.paddingRight = originalBodyPaddingRight;
  document.documentElement.removeAttribute("data-tbf-fullscreen-scroll-locked");
  document.body.removeAttribute("data-tbf-fullscreen-scroll-locked");
}

function createPlaceholder(target: HTMLElement) {
  const rect = target.getBoundingClientRect();
  const placeholder = document.createElement("div");
  placeholder.className = "tbf-fullscreen-placeholder";
  placeholder.setAttribute("data-tbf-fullscreen-placeholder", "");
  placeholder.style.width = `${Math.max(0, rect.width)}px`;
  placeholder.style.height = `${Math.max(0, rect.height)}px`;
  return placeholder;
}

function createOverlay(id: string, group: string) {
  const overlay = document.createElement("div");
  overlay.className = "tbf-fullscreen-overlay";
  overlay.setAttribute("data-tbf-fullscreen-overlay", "");
  overlay.setAttribute("data-tbf-fullscreen-id", id);
  overlay.setAttribute("data-tbf-fullscreen-group", group);
  overlay.setAttribute("aria-hidden", "true");
  overlay.setAttribute("role", "presentation");
  return overlay;
}

function dispatchPanelEvent(name: string, state: FullscreenPanelState) {
  state.target.dispatchEvent(new CustomEvent(name, {
    bubbles: true,
    detail: {
      group: state.group,
      id: state.id,
      overlay: state.overlay,
      target: state.target,
      trigger: state.trigger,
    },
  }));
}

function syncPanelTriggers() {
  const active = panelState;
  queryAll<HTMLElement>(document, "[data-tbf-fullscreen-trigger]").forEach((trigger) => {
    const id = readPanelId(trigger);
    const group = readPanelGroup(trigger);
    const matches = Boolean(active && active.id === id && active.group === group);
    const mode = readPanelTriggerMode(trigger);
    trigger.setAttribute("data-tbf-fullscreen-active", matches ? "true" : "false");
    trigger.setAttribute(
      "data-tbf-fullscreen-hidden",
      (mode === "open" && matches) || ((mode === "close" || mode === "exit") && !matches) ? "true" : "false",
    );
  });
}

function registerFullscreenTarget(target: HTMLElement | null) {
  if (!(target instanceof HTMLElement)) return null;
  const id = readPanelId(target);
  if (!id) return null;
  const group = readPanelGroup(target);
  targetRegistry.set(fullscreenTargetKey(id, group), target);
  target.setAttribute("data-tbf-fullscreen-target", "");
  const storedId = readStoredPanelId(group);
  if (storedId && storedId === id && targetShouldPersist(target) && !panelState) {
    openFullscreenTarget(id, group);
  }
  return target;
}

function findRegisteredFullscreenTarget(id: string, group: string) {
  const existing = targetRegistry.get(fullscreenTargetKey(id, group));
  if (existing?.isConnected) return existing;
  const match = resolveDocumentTarget(`[data-tbf-fullscreen-target][data-tbf-fullscreen-id="${id}"][data-tbf-fullscreen-group="${group}"]`);
  return match instanceof HTMLElement ? registerFullscreenTarget(match) : null;
}

function openFullscreenTarget(
  id: string,
  group = "default",
  trigger: HTMLElement | null = null,
) {
  const target = findRegisteredFullscreenTarget(id, group);
  if (!(target instanceof HTMLElement)) return null;
  if (panelState?.target === target) return target;
  if (panelState) closeFullscreenTarget({ immediate: true });
  const placeholder = createPlaceholder(target);
  const overlay = createOverlay(id, group);
  const originalParent = target.parentNode;
  const nextSibling = target.nextSibling;
  const originalStyle = target.getAttribute("style");
  originalParent?.insertBefore(placeholder, target);
  portalElement(overlay);
  moveLayerElementToTop(overlay);
  moveLayerElementToTop(target);
  const overlayZ = applyZIndex(overlay, { fallback: FULLSCREEN_BASE_Z_INDEX });
  applyZIndex(target, { fallback: overlayZ == null ? FULLSCREEN_BASE_Z_INDEX + 1 : overlayZ + 1 });
  target.setAttribute("data-tbf-fullscreen-active", "true");
  target.setAttribute("aria-modal", "true");
  lockDocumentScroll(true);
  panelState = {
    group,
    id,
    nextSibling,
    originalParent,
    originalStyle,
    overlay,
    placeholder,
    target,
    trigger,
  };
  if (targetShouldPersist(target)) writeStoredPanelId(group, id);
  overlay.addEventListener("click", () => closeFullscreenTarget(), { once: true });
  window.requestAnimationFrame(() => {
    if (panelState?.target !== target) return;
    overlay.setAttribute("data-tbf-open", "true");
    overlay.setAttribute("aria-hidden", "false");
    target.setAttribute("data-tbf-fullscreen-full", "true");
    dispatchPanelEvent("tbf:fullscreen-open", panelState);
  });
  syncPanelTriggers();
  installPanelListeners();
  return target;
}

function restoreFullscreenTarget(state: FullscreenPanelState) {
  state.target.removeAttribute("data-tbf-fullscreen-active");
  state.target.removeAttribute("data-tbf-fullscreen-full");
  state.target.removeAttribute("aria-modal");
  clearZIndex(state.target);
  if (state.originalStyle == null) state.target.removeAttribute("style");
  else state.target.setAttribute("style", state.originalStyle);
  if (state.placeholder.parentNode) {
    state.placeholder.parentNode.insertBefore(state.target, state.placeholder);
  } else if (state.originalParent) {
    state.originalParent.insertBefore(state.target, state.nextSibling);
  }
  state.placeholder.remove();
  state.overlay.remove();
  clearZIndex(state.overlay);
}

function closeFullscreenTarget(options: { immediate?: boolean } = {}) {
  const state = panelState;
  if (!state) return false;
  panelState = null;
  state.overlay.removeAttribute("data-tbf-open");
  state.overlay.setAttribute("aria-hidden", "true");
  clearStoredPanelId(state.group);
  const finish = () => {
    restoreFullscreenTarget(state);
    lockDocumentScroll(false);
    state.trigger?.focus({ preventScroll: true });
    dispatchPanelEvent("tbf:fullscreen-close", state);
    syncPanelTriggers();
  };
  if (options.immediate) finish();
  else window.setTimeout(finish, 180);
  return true;
}

function toggleFullscreenTarget(id: string, group = "default", trigger: HTMLElement | null = null) {
  if (panelState?.id === id && panelState.group === group) {
    closeFullscreenTarget();
    return null;
  }
  return openFullscreenTarget(id, group, trigger);
}

function bindFullscreenTrigger(trigger: HTMLElement | null, options: FullscreenRuntimeOptions = {}): boolean {
  if (!(trigger instanceof HTMLElement) || trigger.hasAttribute("data-tbf-fullscreen-bound")) return false;
  trigger.setAttribute("data-tbf-fullscreen-bound", "true");
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    const id = readPanelId(trigger);
    const group = readPanelGroup(trigger);
    const mode = readPanelTriggerMode(trigger);
    if (id) {
      if (mode === "close" || mode === "exit") {
        closeFullscreenTarget();
        return;
      }
      if (mode === "open") {
        openFullscreenTarget(id, group, trigger);
        return;
      }
      toggleFullscreenTarget(id, group, trigger);
      return;
    }
    const target = readNativeTriggerTarget(trigger, options.target);
    if (mode === "exit" || mode === "close") void exitFullscreen();
    else if (mode === "open") void enterFullscreen(target);
    else void toggleFullscreen(target);
  });
  boundTriggers.add(trigger);
  return true;
}

function bindFullscreen(root: BindRoot = document, options: FullscreenRuntimeOptions = {}): void {
  queryAll<HTMLElement>(root, FULLSCREEN_TARGET_SELECTOR).forEach(registerFullscreenTarget);
  queryAll<HTMLElement>(root, FULLSCREEN_TRIGGER_SELECTOR).forEach((trigger) => {
    bindFullscreenTrigger(trigger, options);
  });
  syncPanelTriggers();
  installPanelListeners();
}

function installPanelListeners() {
  if (panelListenersInstalled || typeof document === "undefined") return;
  panelListenersInstalled = true;
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeFullscreenTarget();
  });
}

export {
  FULLSCREEN_BASE_Z_INDEX,
  FULLSCREEN_STORAGE_PREFIX,
  FULLSCREEN_TARGET_SELECTOR,
  FULLSCREEN_TRIGGER_SELECTOR,
  bindFullscreen,
  bindFullscreenTrigger,
  enterFullscreen,
  exitFullscreen,
  fullscreenElement,
  fullscreenSupported,
  openFullscreenTarget,
  closeFullscreenTarget,
  registerFullscreenTarget,
  toggleFullscreen,
  toggleFullscreenTarget,
};
export type { FullscreenPanelState, FullscreenRuntimeOptions, FullscreenTriggerMode };
