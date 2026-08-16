import { cssEscape, queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { bindLiveCards, type LiveCardsOptions } from "./cards.js";
import {
  captureFormState,
  captureWizardSteps,
  importChildNodes,
  restoreFormState,
  restoreWizardSteps,
} from "./state.js";
import { frontendDataAttr, frontendDataSelector, frontendEventName, frontendToken } from "#5vbaqj4pirp3";

type LiveSkipAdapter = {
  shouldSkip?: (element: Element) => boolean;
};
type LiveOptions = {
  bind?: (root: BindRoot) => void;
  cards?: LiveCardsOptions | false;
  chromeIds?: string[];
  closeOverlays?: () => void;
  contentSelector?: string;
  fullReloadSelector?: string;
  skip?: LiveSkipAdapter;
};

const LIVE_REGION_SELECTOR = frontendDataSelector("live-region");
let refreshInflight = false;

function shouldSkipLiveElement(element: Element, options: LiveOptions = {}) {
  if (element.hasAttribute(frontendDataAttr("live-skip"))) return true;
  return options.skip?.shouldSkip?.(element) === true;
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
      document
      .querySelectorAll(`[id="${cssEscape(id)}"]`)
      .forEach((otherElement) => {
          if (otherElement === freshElement || root.contains(otherElement)) {
            return;
          }
          if (isOpenOverlay(otherElement)) {
            otherElement.innerHTML = freshElement.innerHTML;
            freshElement.remove();
            return;
          }
          otherElement.remove();
      });
  });
}

function rehydrate(root: BindRoot = document, options: LiveOptions = {}) {
  reconcilePortaledDuplicates(root);
  if (options.cards !== false) bindLiveCards(root, options.cards || {});
  options.bind?.(root);
  document.dispatchEvent(new CustomEvent(frontendEventName("rehydrate"), { detail: { root } }));
}

function replaceLiveRegions(doc: Document, options: LiveOptions = {}) {
  let changed = false;
  queryAll<HTMLElement>(document, LIVE_REGION_SELECTOR).forEach((current) => {
      if (shouldSkipLiveElement(current, options)) return;
      const next = findMatchingRegion(doc, current);
      if (!(next instanceof HTMLElement)) return;
      const formState = captureFormState(current);
      const wizardState = captureWizardSteps(current);
      current.replaceChildren(...importChildNodes(next));
      restoreWizardSteps(current, wizardState);
      restoreFormState(current, formState);
      rehydrate(current, options);
      changed = true;
  });
  return changed;
}

async function refreshLive(options: LiveOptions& { url?: string } = {}) {
  if (refreshInflight || typeof window === "undefined") return false;
  refreshInflight = true;
  const url = options.url || window.location.href;
  try {
    const response = await fetch(url, {
        credentials: "same-origin",
        headers: { Accept: "text/html", "X-Requested-With": frontendToken("live") },
    });
    if (!response.ok) return false;
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    return replaceLiveRegions(doc, options);
  } finally {
    refreshInflight = false;
  }
}

export {
  LIVE_REGION_SELECTOR,
  findMatchingRegion,
  refreshLive,
  rehydrate,
  replaceLiveRegions,
  shouldSkipLiveElement,
};
export type { LiveOptions, LiveSkipAdapter };
