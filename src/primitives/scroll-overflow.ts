import { bindElementsOnReady, firstHTMLElementChild } from "#er0dlx1gtbzh";

const SCROLL_OVERFLOW_TAG = "scroll-overflow";
const SCROLL_OVERFLOW_ATTR = "data-scroll-overflow-x";
const EPSILON = 1;
const observed = new Set<HTMLElement>();
let resizeObserver: ResizeObserver | null = null;
let runtimeBound = false;
let syncQueued = false;

function canHaveHorizontalScrollbar(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  return style.overflowX === "auto" || style.overflowX === "scroll";
}

function syncScrollOverflow(element: HTMLElement) {
  const hasHorizontalScroll =
  canHaveHorizontalScrollbar(element) &&
    element.scrollWidth > element.clientWidth + EPSILON;
  if (hasHorizontalScroll) {
    element.setAttribute(SCROLL_OVERFLOW_ATTR, "true");
  } else {
    element.removeAttribute(SCROLL_OVERFLOW_ATTR);
  }
}

function scheduleScrollOverflowSync() {
  if (syncQueued) return;
  syncQueued = true;
  requestAnimationFrame(() => {
      syncQueued = false;
      Array.from(observed).forEach((element) => {
          if (!element.isConnected) {
            observed.delete(element);
            resizeObserver?.unobserve(element);
            return;
          }
          syncScrollOverflow(element);
      });
  });
}

function ensureScrollOverflowRuntime() {
  if (runtimeBound || typeof window === "undefined") return;
  runtimeBound = true;
  if (typeof ResizeObserver === "function") {
    resizeObserver = new ResizeObserver(scheduleScrollOverflowSync);
  }
  window.addEventListener("resize", scheduleScrollOverflowSync);
}

function bindScrollOverflow(element: HTMLElement | null | undefined) {
  if (!(element instanceof HTMLElement) || observed.has(element)) return false;
  ensureScrollOverflowRuntime();
  observed.add(element);
  resizeObserver?.observe(element);
  syncScrollOverflow(element);
  return true;
}

function bindScrollOverflowHost(host: Element | null | undefined) {
  if (!(host instanceof Element)) return false;
  return bindScrollOverflow(firstHTMLElementChild(host));
}

function bindScrollOverflows() {
  return bindElementsOnReady(SCROLL_OVERFLOW_TAG, bindScrollOverflowHost);
}

export {
  SCROLL_OVERFLOW_ATTR,
  SCROLL_OVERFLOW_TAG,
  bindScrollOverflow,
  bindScrollOverflowHost,
  bindScrollOverflows,
  syncScrollOverflow,
};
