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
import { hasUnsavedWork } from "./guards.js";
import {
  overlayPortalRoots,
  removeStalePortaledOverlaysFromRoot,
} from "./overlay-dom.js";
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
  force?: boolean;
  history?: SpaHistoryMode;
  preserveState?: boolean;
};

const LIVE_REGION_SELECTOR = frontendDataSelector("live-region");
const loadedScriptSrcs = new Set<string>();
let navigationInflight = false;
let refreshInflight = false;
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

/**
 * `replaceChildren()` swaps a swap zone's contents but never its own
 * attributes, so if an app points `LiveIslandMount`'s `rootId` at the SPA's
 * own content selector (or a live-region root), the wrapper node is never
 * replaced — only its children are — and `data-live-island-hydrated` stays
 * "true" from the first navigation onward. Every later swap then inherits a
 * stale "true" on brand-new unhydrated children: `watchIslandRemount` never
 * re-mounts, and the tabs/dropdown/checkbox/search/soft-redirect binders
 * treat the fresh markup as already hydrated and bind it immediately.
 */
function syncIslandRootHydration(current: Element, next: Element) {
  if (!current.hasAttribute("data-live-island-root")) return;
  const attr = "data-live-island-hydrated";
  const nextValue = next.getAttribute(attr);
  if (nextValue === null) current.removeAttribute(attr);
  else current.setAttribute(attr, nextValue);
}

/**
 * Freshly rendered markup can collide with a copy of itself that an earlier
 * page portaled into a layer root — chrome that `swapChrome` re-renders (a
 * sidebar's theme/language menus) brings back an inline copy of an overlay
 * whose previous incarnation is still parked in the layer root.
 *
 * The discriminator has to be "is this copy portaled?", not "is it outside
 * `root`?": this runs as `rehydrate(document)` during soft navigation, and
 * `document.contains()` is true of every node in the page, which made the
 * whole reconcile a no-op there and let those duplicates pile up one per
 * navigation.
 */
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
  targetHash: string,
) {
  const config = spaConfig();
  const currentRoot = contentRoot(document);
  const nextRoot = contentRoot(doc);
  if (!currentRoot || !nextRoot) return false;
  const formState = preserveState ? captureFormState(currentRoot) : null;
  const wizardState = preserveState ? captureWizardSteps(currentRoot) : null;
  config.closeOverlays?.();
  /**
   * React roots must unmount before the stale-overlay sweep. A portaled modal
   * or popover lives in the layer root, which is never inside the content root,
   * so the sweep would remove every React-owned overlay node and the following
   * unmount would then fail with NotFoundError on removeChild.
   */
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
  syncIslandRootHydration(currentRoot, nextRoot);
  swapChrome(doc);
  if (wizardState) restoreWizardSteps(currentRoot, wizardState);
  if (formState) restoreFormState(currentRoot, formState);
  updateDocumentMeta(doc);
  injectNewScripts(doc);
  if (!preserveState) applyLandingScroll(targetHash);
  rehydrate(document);
  void navigation;
  return true;
}

/**
 * Explicitly instant, never inheriting the root `scroll-behavior`.
 *
 * Soft navigation stands in for a document load, and a real load always lands
 * at the top immediately. Both `scrollTo(0, 0)` and the object form default to
 * the CSS value, so under `scroll-behavior: smooth` the fresh page painted at
 * the previous page's offset and then visibly glided upward — an effect no
 * real navigation produces. This is a scroll *reset*, not a scroll the user
 * asked for, so it opts out rather than leaving it to `design.scrollBehavior`.
 */
function resetWindowScroll() {
  try {
    window.scrollTo({ behavior: "instant" as ScrollBehavior, left: 0, top: 0 });
  } catch {
    window.scrollTo(0, 0);
  }
}

/**
 * A real document load at `/page#section` lands on the fragment, not the top,
 * so a soft navigation carrying one has to do the same. Instant for the same
 * reason `resetWindowScroll` is: the page just changed underneath, and gliding
 * to the anchor is an effect no real navigation produces. Falls back to the top
 * when the fragment matches nothing, which is also what a real load does.
 */
function applyLandingScroll(targetHash: string) {
  const id = String(targetHash || "").replace(/^#/, "");
  const target = id ? document.getElementById(id) : null;
  if (!target) {
    resetWindowScroll();
    return;
  }
  try {
    target.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
  } catch {
    target.scrollIntoView();
  }
}

function applyHistoryMode(mode: SpaHistoryMode, resolvedUrl: string, targetHash = "") {
  const parsed = new URL(resolvedUrl, window.location.href);
  notePathChange(`${parsed.pathname}${parsed.search}`);
  if (mode === "none") return;
  const path = `${parsed.pathname}${parsed.search}${parsed.hash || targetHash}`;
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
  const targetUrl = String(url || window.location.href).trim();
  navigationInflight = true;
  const historyMode: SpaHistoryMode = options.history || "push";
  const targetHash = hashOf(targetUrl);
  let navigation: ReturnType<typeof beginNavigation> | null = null;
  try {
    if (options.force !== true && hasUnsavedWork()) {
      return fallbackNavigate(targetUrl, historyMode !== "none");
    }
    navigation = beginNavigation(targetUrl, historyMode);
    const fetched = await fetchDocument(targetUrl, "router");
    if (!fetched) return fallbackNavigate(targetUrl, historyMode !== "none");
    navigation = retargetNavigation(navigation, fetched.url);
    if (!replaceContent(fetched.doc, navigation, options.preserveState === true, targetHash)) {
      return fallbackNavigate(targetUrl, historyMode !== "none");
    }
    applyHistoryMode(historyMode, fetched.url, targetHash);
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
      syncIslandRootHydration(current, next);
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
  isSamePathAsLastKnown,
  notePathChange,
  rehydrate,
  seedLoadedScripts,
  softRedirect,
  softRefresh,
  softReload,
};
export type { SoftRedirectOptions };
