import { queryAll, type BindRoot } from "#er0dlx1gtbzh";

type LiveSkipAdapter = {
  shouldSkip?: (element: Element) => boolean;
};
type LiveOptions = {
  bind?: (root: BindRoot) => void;
  contentSelector?: string;
  skip?: LiveSkipAdapter;
};

const LIVE_REGION_SELECTOR = "[data-tbf-live-region]";
const LIVE_REFRESH_SELECTOR = "[data-tbf-live-refresh]";
let inflight = false;

function shouldSkipLiveElement(element: Element, options: LiveOptions = {}) {
  if (element.hasAttribute("data-tbf-live-skip")) return true;
  return options.skip?.shouldSkip?.(element) === true;
}

function captureFormState(root: ParentNode) {
  const state = new Map<string, { checked: boolean; value: string }>();
  root.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    "input,select,textarea",
  ).forEach((element) => {
      const key = element.name || element.id;
      if (!key) return;
      state.set(key, {
          checked: element instanceof HTMLInputElement ? element.checked : false,
          value: element.value,
      });
  });
  return state;
}

function restoreFormState(
  root: ParentNode,
  state: Map<string, { checked: boolean; value: string }>,
) {
  root.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    "input,select,textarea",
  ).forEach((element) => {
      const snapshot = state.get(element.name || element.id);
      if (!snapshot) return;
      element.value = snapshot.value;
      if (element instanceof HTMLInputElement) element.checked = snapshot.checked;
  });
}

function liveRegionKey(element: Element) {
  return (
    element.getAttribute("data-tbf-live-region") ||
      element.id ||
      element.getAttribute("data-tbf-live-key") ||
      ""
  ).trim();
}

function findMatchingRegion(doc: Document, current: Element) {
  const key = liveRegionKey(current);
  if (!key) return null;
  const byId = doc.getElementById(key);
  if (byId) return byId;
  return doc.querySelector(`[data-tbf-live-region="${CSS.escape(key)}"]`);
}

function rehydrate(root: BindRoot = document, options: LiveOptions = {}) {
  options.bind?.(root);
  document.dispatchEvent(new CustomEvent("tbf:rehydrate", { detail: { root } }));
}

function replaceLiveRegions(doc: Document, options: LiveOptions = {}) {
  let changed = false;
  queryAll<HTMLElement>(document, LIVE_REGION_SELECTOR).forEach((current) => {
      if (shouldSkipLiveElement(current, options)) return;
      const next = findMatchingRegion(doc, current);
      if (!(next instanceof HTMLElement)) return;
      const state = captureFormState(current);
      current.replaceChildren(...Array.from(next.childNodes).map((node) => {
            return document.importNode(node, true);
      }));
      restoreFormState(current, state);
      rehydrate(current, options);
      changed = true;
  });
  return changed;
}

async function refreshLive(options: LiveOptions & { url?: string } = {}) {
  if (inflight || typeof window === "undefined") return false;
  inflight = true;
  const url = options.url || window.location.href;
  try {
    const response = await fetch(url, {
        credentials: "same-origin",
        headers: { Accept: "text/html", "X-Requested-With": "tbf-live" },
    });
    if (!response.ok) return false;
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    return replaceLiveRegions(doc, options);
  } finally {
    inflight = false;
  }
}

function bindLiveRefresh(root: BindRoot = document, options: LiveOptions = {}) {
  queryAll<HTMLElement>(root, LIVE_REFRESH_SELECTOR).forEach((trigger) => {
      if (trigger.hasAttribute("data-tbf-live-bound")) return;
      trigger.setAttribute("data-tbf-live-bound", "true");
      trigger.addEventListener("click", (event) => {
          event.preventDefault();
          const url = trigger.getAttribute("data-tbf-live-url") || undefined;
          void refreshLive({ ...options, url });
      });
  });
}

export {
  LIVE_REFRESH_SELECTOR,
  LIVE_REGION_SELECTOR,
  bindLiveRefresh,
  captureFormState,
  refreshLive,
  rehydrate,
  replaceLiveRegions,
  restoreFormState,
  shouldSkipLiveElement,
};
export type { LiveOptions, LiveSkipAdapter };
