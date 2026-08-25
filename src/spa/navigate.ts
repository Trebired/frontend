import { cssEscape, queryAll } from "#er0dlx1gtbzh";
import type { BindRoot } from "#er0dlx1gtbzh";
import {
  frontendDataAttr,
  frontendDataSelector,
  frontendEventName,
  frontendToken,
} from "#5vbaqj4pirp3";
import { PORTALED_SELECTOR, runSpaRebind, spaConfig } from "./config.js";
import { runPageCleanups } from "./cleanup.js";
import { removeStalePortaledOverlaysFromRoot } from "./overlay-dom.js";
import { progress } from "#hmj29rrpgtsh";
import {
  beginNavigation,
  emitPageChange,
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
  history?: SpaHistoryMode;
  preserveState?: boolean;
};

const LIVE_REGION_SELECTOR = frontendDataSelector("live-region");
const loadedScriptSrcs = new Set<string>();
let navigationInflight = false;
let refreshInflight = false;

function seedLoadedScripts() {
  if (typeof document === "undefined") return;
  document.querySelectorAll<HTMLScriptElement>("script[src]").forEach((script) => {
      loadedScriptSrcs.add(script.src);
  });
}

function injectNewScripts(doc: Document) {
  doc.querySelectorAll<HTMLScriptElement>("script[src]").forEach((script) => {
      const src = script.src;
      if (!src || loadedScriptSrcs.has(src)) return;
      loadedScriptSrcs.add(src);
      const fresh = document.createElement("script");
      fresh.type = script.type || "module";
      fresh.src = src;
      document.body.appendChild(fresh);
  });
}

function contentRoot(root: Document) {
  const element = root.querySelector(spaConfig().contentSelector);
  return element instanceof HTMLElement ? element : null;
}

function swapChrome(doc: Document) {
  spaConfig().chromeIds.forEach((id) => {
      const current = document.getElementById(id);
      const next = doc.getElementById(id);
      if (!current && !next) return;
      if (current && next) {
        current.replaceWith(document.importNode(next, true));
      } else if (current) {
        current.remove();
      } else if (next) {
        document.body.insertBefore(
          document.importNode(next, true),
          document.body.firstChild,
        );
      }
  });
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
  root.querySelectorAll("[id]").forEach((freshElement) => {
      if (!(root instanceof Node) || !root.contains(freshElement)) return;
      const id = (freshElement as HTMLElement).id;
      if (!id) return;
      document.querySelectorAll(`[id="${cssEscape(id)}"]`).forEach((otherElement) => {
          if (otherElement === freshElement || root.contains(otherElement)) return;
          if (isOpenOverlay(otherElement)) {
            otherElement.innerHTML = freshElement.innerHTML;
            freshElement.remove();
            return;
          }
          otherElement.remove();
      });
  });
}

function rehydrate(root: BindRoot = document) {
  reconcilePortaledDuplicates(root);
  runSpaRebind(root);
  document.dispatchEvent(
    new CustomEvent(frontendEventName("rehydrate"), { detail: { root } }),
  );
}

function replaceContent(
  doc: Document,
  navigation: SpaNavigation,
  preserveState: boolean,
) {
  const config = spaConfig();
  const currentRoot = contentRoot(document);
  const nextRoot = contentRoot(doc);
  if (!currentRoot || !nextRoot) return false;
  const formState = preserveState ? captureFormState(currentRoot) : null;
  const wizardState = preserveState ? captureWizardSteps(currentRoot) : null;
  config.closeOverlays?.();
  removeStalePortaledOverlaysFromRoot(
    { portaledSelector: PORTALED_SELECTOR },
    currentRoot,
  );
  runPageCleanups(currentRoot);
  document.dispatchEvent(
    new CustomEvent(frontendEventName("live-navigation"), {
        detail: { url: window.location.href },
    }),
  );
  currentRoot.replaceChildren(...importChildNodes(nextRoot));
  swapChrome(doc);
  if (wizardState) restoreWizardSteps(currentRoot, wizardState);
  if (formState) restoreFormState(currentRoot, formState);
  updateDocumentMeta(doc);
  injectNewScripts(doc);
  if (!preserveState) window.scrollTo(0, 0);
  rehydrate(document);
  void navigation;
  return true;
}

function applyHistoryMode(mode: SpaHistoryMode, resolvedUrl: string) {
  if (mode === "none") return;
  const parsed = new URL(resolvedUrl, window.location.href);
  const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
  if (mode === "replace") history.replaceState({ tbfSpa: true }, "", path);
  else history.pushState({ tbfSpa: true }, "", path);
}

function fallbackNavigate(url: string, updateUrl: boolean) {
  if (updateUrl && url) {
    window.location.assign(url);
    return false;
  }
  window.location.reload();
  return false;
}

/**
 * Soft navigation replaces a full page load, so it shows the same progress bar
 * a document load would. The handle is refcounted, so overlapping requests
 * keep the bar up until the last one settles.
 */
async function fetchDocument(url: string, token: string) {
  progress.begin();
  try {
    const response = await fetch(url, {
        credentials: "same-origin",
        headers: { Accept: "text/html", "X-Requested-With": frontendToken(token) },
    });
    if (!response.ok) return null;
    const html = await response.text();
    return {
      doc: new DOMParser().parseFromString(html, "text/html"),
      url: response.url || url,
    };
  } finally {
    progress.end();
  }
}

async function softRedirect(url: string, options: SoftRedirectOptions = {}) {
  if (navigationInflight || typeof window === "undefined") return false;
  navigationInflight = true;
  const targetUrl = String(url || window.location.href).trim();
  const historyMode: SpaHistoryMode = options.history || "push";
  let navigation = beginNavigation(targetUrl, historyMode);
  try {
    const fetched = await fetchDocument(targetUrl, "router");
    if (!fetched) return fallbackNavigate(targetUrl, historyMode !== "none");
    navigation = retargetNavigation(navigation, fetched.url);
    if (!replaceContent(fetched.doc, navigation, options.preserveState === true)) {
      return fallbackNavigate(targetUrl, historyMode !== "none");
    }
    applyHistoryMode(historyMode, fetched.url);
    emitPageChange(navigation);
    return true;
  } catch {
    return fallbackNavigate(targetUrl, historyMode !== "none");
  } finally {
    navigationInflight = false;
  }
}

function softReload(options: { preserveState?: boolean } = {}) {
  if (typeof window === "undefined") return Promise.resolve(false);
  return softRedirect(window.location.href, {
      history: "none",
      preserveState: options.preserveState === true,
  });
}

function shouldSkipLiveElement(element: Element) {
  if (element.hasAttribute(frontendDataAttr("live-skip"))) return true;
  return spaConfig().skip?.(element) === true;
}

function liveRegionKey(element: Element) {
  return (
    element.getAttribute(frontendDataAttr("live-region")) ||
      element.id ||
      element.getAttribute(frontendDataAttr("live-key")) ||
      ""
  ).trim();
}

function findMatchingRegion(doc: Document, current: Element) {
  const key = liveRegionKey(current);
  if (!key) return null;
  const byId = doc.getElementById(key);
  if (byId) return byId;
  return doc.querySelector(frontendDataSelector("live-region", key));
}

function replaceLiveRegions(doc: Document) {
  let changed = false;
  queryAll<HTMLElement>(document, LIVE_REGION_SELECTOR).forEach((current) => {
      if (shouldSkipLiveElement(current)) return;
      const next = findMatchingRegion(doc, current);
      if (!(next instanceof HTMLElement)) return;
      const formState = captureFormState(current);
      const wizardState = captureWizardSteps(current);
      runPageCleanups(current);
      current.replaceChildren(...importChildNodes(next));
      restoreWizardSteps(current, wizardState);
      restoreFormState(current, formState);
      rehydrate(current);
      changed = true;
  });
  return changed;
}

async function softRefresh(options: { url?: string } = {}) {
  if (refreshInflight || typeof window === "undefined") return false;
  refreshInflight = true;
  try {
    const fetched = await fetchDocument(options.url || window.location.href, "live");
    if (!fetched) return false;
    return replaceLiveRegions(fetched.doc);
  } finally {
    refreshInflight = false;
  }
}

export {
  LIVE_REGION_SELECTOR,
  contentRoot,
  rehydrate,
  seedLoadedScripts,
  softRedirect,
  softRefresh,
  softReload,
};
export type { SoftRedirectOptions };
