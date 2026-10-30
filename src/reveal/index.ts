import { frontendDataAttr, frontendDataSelector, frontendEventName } from "#5vbaqj4pirp3";
import { queryAll, touchOnly, type BindRoot } from "#er0dlx1gtbzh";

const REVEAL_ATTR = frontendDataAttr("reveal");
const SHOWN_ATTR = frontendDataAttr("reveal-shown");
const ROOT_ATTR = frontendDataAttr("reveal-root");
const REVEAL_LIVE = "live";
const REVEAL_SELECTOR = frontendDataSelector("reveal");

const DEFAULT_MARGIN = "0px 0px -12% 0px";

type RevealOptions = {
  margin?: string;
  selector?: string;
  threshold?: number;
};

const watched = new WeakSet<Element>();

const pending = new Set<HTMLElement>();

const PAGE_CHANGE_EVENT = frontendEventName("page-change");

let observer: IntersectionObserver | null = null;

function show(element: Element) {
  element.setAttribute(SHOWN_ATTR, "true");
  pending.delete(element as HTMLElement);
  observer?.unobserve(element);
}

function reached(element: Element): boolean {
  const box = element.getBoundingClientRect();
  return box.width > 0 && box.top < window.innerHeight;
}

function showNow(element: HTMLElement) {
  element.style.transition = "none";
  show(element);
  requestAnimationFrame(() => requestAnimationFrame(() => {
        element.style.transition = "";
  }));
}

function showReached() {
  for (const element of pending) {
    if (!element.isConnected) pending.delete(element);
    else if (reached(element)) showNow(element);
  }
}

let listening = false;

function listenForPages() {
  if (listening || typeof document === "undefined") return;
  listening = true;
  document.addEventListener(PAGE_CHANGE_EVENT, () => requestAnimationFrame(showReached));
}

function revealObserver(options: RevealOptions) {
  if (observer) return observer;
  if (typeof IntersectionObserver !== "function") return null;
  observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) show(entry.target);
      }
    }, {
      rootMargin: options.margin || DEFAULT_MARGIN,
      threshold: options.threshold ?? 0,
  });
  return observer;
}

function markRoot() {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute(ROOT_ATTR, REVEAL_LIVE);
}

function watch(element: HTMLElement, live: IntersectionObserver | null) {
  if (watched.has(element)) return;
  watched.add(element);
  element.setAttribute(REVEAL_ATTR, "");
  if (!live || element.getAttribute(SHOWN_ATTR) === "true") {
    show(element);
    return;
  }
  if (reached(element)) {
    showNow(element);
    return;
  }
  pending.add(element);
  live.observe(element);
}

function bindReveals(root: BindRoot = document, options: RevealOptions = {}) {
  if (typeof window === "undefined" || touchOnly()) return 0;
  const live = revealObserver(options);
  if (live) {
    markRoot();
    listenForPages();
  }
  const targets = [
    ...queryAll<HTMLElement>(root, REVEAL_SELECTOR),
    ...(options.selector ? queryAll<HTMLElement>(root, options.selector) : []),
  ];
  for (const element of targets) watch(element, live);
  return targets.length;
}

export { bindReveals, REVEAL_SELECTOR };
export type { RevealOptions };
