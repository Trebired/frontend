import { cssEscape, queryAll } from "#er0dlx1gtbzh";
import { frontendDataAttr, frontendDataSelector, frontendEventName } from "#5vbaqj4pirp3";
import { PORTALED_SELECTOR, spaConfig } from "./config.js";
import { removeOrphanedPortaledOverlays } from "./overlay-dom.js";
import { layerPortalOrigin } from "#ccvonx3uhbte";
import { runCleanupsWithin } from "./cleanup.js";
import { fetchDocument } from "./fetch-document.js";
import { rebind } from "./navigate.js";
import {
  captureFormState,
  captureWizardSteps,
  importChildNodes,
  restoreFormState,
  restoreWizardSteps,
} from "./state.js";

const LIVE_REGION_SELECTOR = frontendDataSelector("live-region");
let refreshInflight = false;

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
      runCleanupsWithin(current);
      current.replaceChildren(...importChildNodes(next));
      restoreWizardSteps(current, wizardState);
      restoreFormState(current, formState);
      rebind(current);
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

const pendingElementRefreshes = new Set<HTMLElement>();
let elementRefreshTimer: ReturnType<typeof setTimeout>|null = null;
let elementRefreshRunning: Promise<void>|null = null;

function keepOpenDisclosures(current: HTMLElement, next: HTMLElement) {
  const openAttr = frontendDataAttr("disclosure-open");
  current.querySelectorAll<HTMLElement>(`${frontendDataSelector("disclosure")}[${openAttr}="true"][id]`).forEach((open) => {
      const fresh = next.querySelector(`#${cssEscape(open.id)}`);
      if (fresh) fresh.setAttribute(openAttr, "true");
  });
}

function replaceLiveElement(doc: Document, current: HTMLElement) {
  if (!current.isConnected || shouldSkipLiveElement(current)) return false;
  const next = findMatchingRegion(doc, current);
  if (!(next instanceof HTMLElement)) return false;
  keepOpenDisclosures(current, next);
  const formState = captureFormState(current);
  const wizardState = captureWizardSteps(current);
  runCleanupsWithin(current);
  current.replaceChildren(...importChildNodes(next));
  if (next.className !== current.className) current.className = next.className;
  restoreWizardSteps(current, wizardState);
  restoreFormState(current, formState);
  rebind(current);
  current.dispatchEvent(new CustomEvent(frontendEventName("live-region-refresh"), { bubbles: true, detail: { region: current } }));
  return true;
}

const waitingForOverlay = new Set<HTMLElement>();
let overlayCloseListener = false;

function ownsOpenOverlay(region: HTMLElement) {
  return Array.from(document.querySelectorAll<HTMLElement>(`${frontendDataSelector("modal")}[aria-hidden="false"]`)).some((modal) => {
      if (region.contains(modal)) return false;
      const origin = layerPortalOrigin(modal);
      return Boolean(origin && region.contains(origin));
  });
}

function waitForOverlayClose(element: HTMLElement) {
  waitingForOverlay.add(element);
  if (overlayCloseListener) return;
  overlayCloseListener = true;
  document.addEventListener(frontendEventName("modal-close"), () => {
      const waiting = Array.from(waitingForOverlay).filter((region) => !ownsOpenOverlay(region));
      waiting.forEach((region) => waitingForOverlay.delete(region));
      if (waiting.length) refreshElements(waiting);
  });
}

async function runElementRefreshes() {
  const elements = Array.from(pendingElementRefreshes);
  pendingElementRefreshes.clear();
  const targets = elements.filter((element) => element.isConnected && liveRegionKey(element));
  const ready = targets.filter((element) => {
      if (!ownsOpenOverlay(element)) return true;
      waitForOverlayClose(element);
      return false;
  });
  if (!ready.length) return;
  const fetched = await fetchDocument(window.location.href, "live");
  if (!fetched) return;
  ready.forEach((element) => replaceLiveElement(fetched.doc, element));
  removeOrphanedPortaledOverlays({ portaledSelector: PORTALED_SELECTOR });
}

function flushElementRefreshes() {
  elementRefreshTimer = null;
  if (elementRefreshRunning) {
    void elementRefreshRunning.then(() => scheduleElementRefresh());
    return;
  }
  elementRefreshRunning = runElementRefreshes()
  .catch (() => undefined)
  .finally(() => {
      elementRefreshRunning = null;
  });
}

function scheduleElementRefresh() {
  if (!pendingElementRefreshes.size || elementRefreshTimer) return;
  elementRefreshTimer = setTimeout(flushElementRefreshes, 60);
}

function refreshElements(elements: Iterable<Element|null|undefined>) {
  if (typeof window === "undefined") return;
  for (const element of elements) {
    if (element instanceof HTMLElement) pendingElementRefreshes.add(element);
  }
  scheduleElementRefresh();
}

export { LIVE_REGION_SELECTOR, refreshElements, softRefresh };
