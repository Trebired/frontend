import { cssEscape } from "#er0dlx1gtbzh";
import type { BindRoot } from "#er0dlx1gtbzh";
import { frontendDataAttr, frontendEventName } from "#5vbaqj4pirp3";
import { PORTALED_SELECTOR, runSpaRebind, spaConfig } from "./config.js";
import { runPageCleanups } from "./cleanup.js";
import { fetchDocument } from "./fetch-document.js";
import { hasUnsavedWork } from "./guards.js";
import { createLocalTranslator, documentLang } from "#dqy2d22qyujv";
import { confirm } from "#xt1nnckfzd7c";
import { closeAllOverlays } from "./close.js";
import {
  overlayPortalRoots,
  removeOrphanedPortaledOverlays,
  removeStalePortaledOverlaysFromRoot,
} from "./overlay-dom.js";
import { syncShell } from "./shell.js";
import { highlightWhenPresent, queueHighlight } from "#8xdkni5exuif";
import {
  beginNavigation,
  emitPageChange,
  emitPendingPage,
  retargetNavigation,
  type SpaHistoryMode,
  type SpaNavigation,
} from "./page.js";
import {
  captureFormState,
  captureWizardSteps,
  importChildNodes,
  restoreFormState,
  restoreWizardSteps,
} from "./state.js";

type SoftRedirectOptions = {
  force?: boolean;
  highlight?: string;
  history?: SpaHistoryMode;
  preserveState?: boolean;
};

const loadedScriptSrcs = new Set<string>();
let navigationInflight = false;
let lastKnownPath = "";

function seedLoadedScripts() {
  if (typeof document === "undefined") return;
  document.querySelectorAll<HTMLScriptElement>("script[src]").forEach((script) => {
      loadedScriptSrcs.add(script.src);
  });
}

function hashOf(url: string) {
  try {
    return new URL(url, window.location.href).hash;
  } catch {
    return "";
  }
}

function notePathChange(path?: string) {
  if (typeof window === "undefined") return;
  lastKnownPath = path ?? `${window.location.pathname}${window.location.search}`;
}

function isSamePathAsLastKnown() {
  if (typeof window === "undefined") return true;
  return lastKnownPath === `${window.location.pathname}${window.location.search}`;
}

function injectNewScripts(doc: Document) {
  doc.querySelectorAll<HTMLScriptElement>("script[src]").forEach((script) => {
      const src = script.src;
      if (!src || loadedScriptSrcs.has(src)) return;
      loadedScriptSrcs.add(src);
      const fresh = document.createElement("script");
      fresh.type = script.type ||"module";
      fresh.src = src;
      document.body.appendChild(fresh);
  });
}

function contentRoot(root: Document) {
  const element = root.querySelector(spaConfig().contentSelector);
  return element instanceof HTMLElement ? element : null;
}

function updateDocumentMeta(doc: Document) {
  const title = doc.querySelector("title");
  if (title?.textContent) document.title = title.textContent;
  const nextLang = doc.documentElement.lang;
  if (nextLang && nextLang !== document.documentElement.lang) {
    document.documentElement.lang = nextLang;
  }
}

function isOpenOverlay(element: Element) {
  return Boolean(
    element.getAttribute(frontendDataAttr("open")) === "true" ||
      element.getAttribute(frontendDataAttr("opening")) === "true",
  );
}

function reconcilePortaledDuplicates(root: ParentNode) {
  if (!root || typeof root.querySelectorAll !== "function") return;
  const portals = overlayPortalRoots();
  if (!portals.length) return;
  const isPortaled = (node: Element) => portals.some((portal) => portal.contains(node));
  root.querySelectorAll("[id]").forEach((freshElement) => {
      const id = (freshElement as HTMLElement).id;
      if (!id || isPortaled(freshElement)) return;
      document.querySelectorAll(`[id="${cssEscape(id)}"]`).forEach((otherElement) => {
          if (otherElement === freshElement || !isPortaled(otherElement)) return;
          if (isOpenOverlay(otherElement)) {
            otherElement.innerHTML = freshElement.innerHTML;
            freshElement.remove();
            return;
          }
          otherElement.remove();
      });
  });
}

function rebind(root: BindRoot = document) {
  reconcilePortaledDuplicates(root);
  runSpaRebind(root);
  document.dispatchEvent(
    new CustomEvent(frontendEventName("rebind"), { detail: { root } }),
  );
}

function releaseAfterPaint(release: () => void) {
  if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") {
    release();
    return;
  }
  window.requestAnimationFrame(() => window.requestAnimationFrame(release));
}

const PAGE_SWAP_ATTR = frontendDataAttr("page-swap");

function holdPageSwapMotion() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute(PAGE_SWAP_ATTR, "");
  const release = () => root.removeAttribute(PAGE_SWAP_ATTR);
  if (typeof requestAnimationFrame !== "function") {
    release();
    return;
  }
  requestAnimationFrame(() => requestAnimationFrame(release));
}

function replaceContent(
  doc: Document,
  navigation: SpaNavigation,
  preserveState: boolean,
  targetHash: string,
) {
  const config = spaConfig();
  const currentRoot = contentRoot(document);
  const nextRoot = contentRoot(doc);
  if (!currentRoot || !nextRoot) return false;
  const formState = preserveState ? captureFormState(currentRoot) : null;
  const wizardState = preserveState ? captureWizardSteps(currentRoot) : null;
  holdPageSwapMotion();
  closeAllOverlays();
  config.closeOverlays?.();
  runPageCleanups(currentRoot);
  removeStalePortaledOverlaysFromRoot(
    { portaledSelector: PORTALED_SELECTOR },
    currentRoot,
  );
  document.dispatchEvent(
    new CustomEvent(frontendEventName("live-navigation"), {
        detail: { url: window.location.href },
    }),
  );
  currentRoot.replaceChildren(...importChildNodes(nextRoot));
  syncShell(doc);
  removeOrphanedPortaledOverlays({ portaledSelector: PORTALED_SELECTOR });
  if (wizardState) restoreWizardSteps(currentRoot, wizardState);
  if (formState) restoreFormState(currentRoot, formState);
  updateDocumentMeta(doc);
  injectNewScripts(doc);
  if (!preserveState) applyLandingScroll(targetHash);
  rebind(document);
  void navigation;
  return true;
}

function resetWindowScroll() {
  try {
    window.scrollTo({ behavior: "instant"as ScrollBehavior, left: 0, top: 0 });
  } catch {
    window.scrollTo(0, 0);
  }
}

function applyLandingScroll(targetHash: string) {
  const id = String(targetHash || "").replace(/^#/, "");
  const target = id ? document.getElementById(id) : null;
  if (!target) {
    resetWindowScroll();
    return;
  }
  try {
    target.scrollIntoView({ behavior: "instant"as ScrollBehavior, block: "start" });
  } catch {
    target.scrollIntoView();
  }
}

function pathOf(url: string) {
  const parsed = new URL(url, window.location.href);
  return `${parsed.pathname}${parsed.search}`;
}

function applyHistoryMode(mode: SpaHistoryMode, resolvedUrl: string, targetHash = "", requestedUrl = resolvedUrl) {
  const parsed = new URL(resolvedUrl, window.location.href);
  notePathChange(`${parsed.pathname}${parsed.search}`);
  const redirected = pathOf(requestedUrl) !== pathOf(resolvedUrl);
  if (mode === "none" && !redirected) return;
  const path = `${parsed.pathname}${parsed.search}${parsed.hash || targetHash}`;
  if (mode === "push") history.pushState({ tbfSpa: true }, "", path);
  else history.replaceState({ tbfSpa: true }, "", path);
}

async function confirmLeavingUnsavedWork() {
  const localT = createLocalTranslator(import.meta.url, documentLang());
  try {
    return await confirm(localT("unsaved.title"), localT("unsaved.description"), {
        cancelText: localT("unsaved.stay"),
        confirmButtonText: localT("unsaved.leave"),
        type: "warn",
    });
  } catch {
    return false;
  }
}

function restoreKnownPath() {
  const current = `${window.location.pathname}${window.location.search}`;
  if (lastKnownPath && lastKnownPath !== current) history.pushState({ tbfSpa: true }, "", lastKnownPath);
}

function fallbackNavigate(url: string, updateUrl: boolean, highlight = "") {
  if (highlight) queueHighlight(updateUrl && url ? url : window.location.href, highlight);
  if (updateUrl && url) {
    window.location.assign(url);
    return false;
  }
  window.location.reload();
  return false;
}

async function softRedirect(url: string, options: SoftRedirectOptions = {}) {
  if (navigationInflight || typeof window === "undefined") return false;
  const targetUrl = String(url || window.location.href).trim();
  navigationInflight = true;
  const historyMode: SpaHistoryMode = options.history || "push";
  const targetHash = hashOf(targetUrl);
  let navigation: ReturnType<typeof beginNavigation>|null = null;
  try {
    if (options.force !== true && hasUnsavedWork() && !(await confirmLeavingUnsavedWork())) {
      if (historyMode === "none") restoreKnownPath();
      return false;
    }
    navigation = beginNavigation(targetUrl, historyMode);
    const fetched = await fetchDocument(targetUrl, "router");
    if (!fetched) return fallbackNavigate(targetUrl, historyMode !== "none", options.highlight || "");
    navigation = retargetNavigation(navigation, fetched.url);
    if (!replaceContent(fetched.doc, navigation, options.preserveState === true, targetHash)) {
      return fallbackNavigate(targetUrl, historyMode !== "none", options.highlight || "");
    }
    applyHistoryMode(historyMode, fetched.url, targetHash, targetUrl);
    emitPageChange(navigation);
    if (options.highlight) highlightWhenPresent(options.highlight);
    return true;
  } catch {
    return fallbackNavigate(targetUrl, historyMode !== "none", options.highlight || "");
  } finally {
    navigationInflight = false;
    emitPendingPage("");
  }
}

function softReload(options: { preserveState?: boolean } = {}) {
  if (typeof window === "undefined") return Promise.resolve(false);
  return softRedirect(window.location.href, {
      history: "none",
      preserveState: options.preserveState === true,
  });
}

export {
  contentRoot,
  isSamePathAsLastKnown,
  notePathChange,
  rebind,
  seedLoadedScripts,
  softRedirect,
  softReload,
};
export type { SoftRedirectOptions };
