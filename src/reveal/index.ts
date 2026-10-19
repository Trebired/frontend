import { frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";
import { queryAll, type BindRoot } from "#er0dlx1gtbzh";

const REVEAL_ATTR = frontendDataAttr("reveal");
const SHOWN_ATTR = frontendDataAttr("reveal-shown");
const ROOT_ATTR = frontendDataAttr("reveal-root");
const REVEAL_SELECTOR = frontendDataSelector("reveal");

const DEFAULT_MARGIN = "0px 0px -12% 0px";

type RevealOptions = {
  margin?: string;
  selector?: string;
  threshold?: number;
};

const watched = new WeakSet<Element>();

let observer: IntersectionObserver | null = null;

function show(element: Element) {
  element.setAttribute(SHOWN_ATTR, "true");
  observer?.unobserve(element);
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
  document.documentElement.setAttribute(ROOT_ATTR, "on");
}

function watch(element: Element, live: IntersectionObserver | null) {
  if (watched.has(element)) return;
  watched.add(element);
  element.setAttribute(REVEAL_ATTR, "");
  if (!live) {
    show(element);
    return;
  }
  live.observe(element);
}

function bindReveals(root: BindRoot = document, options: RevealOptions = {}) {
  if (typeof window === "undefined") return 0;
  const live = revealObserver(options);
  if (live) markRoot();
  const targets = [
    ...queryAll<HTMLElement>(root, REVEAL_SELECTOR),
    ...(options.selector ? queryAll<HTMLElement>(root, options.selector) : []),
  ];
  for (const element of targets) watch(element, live);
  return targets.length;
}

export { bindReveals, REVEAL_SELECTOR };
export type { RevealOptions };
