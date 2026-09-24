import { frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";

const SCROLL_STATE_ATTRIBUTE = frontendDataAttr("scrolled");
const SCROLL_STATE_SELECTOR = frontendDataSelector("scrolled", "true");
const DEFAULT_SCROLL_THRESHOLD = 24;

type ScrollStateOptions = {
  threshold?: number;
};

function scrollStateThreshold(options: ScrollStateOptions = {}): number {
  const value = Number(options.threshold);
  return Number.isFinite(value) && value >= 0 ? value : DEFAULT_SCROLL_THRESHOLD;
}

function readScrollState(options: ScrollStateOptions = {}): boolean {
  if (typeof window === "undefined") return false;
  return (window.scrollY || window.pageYOffset || 0) > scrollStateThreshold(options);
}

function applyScrollState(options: ScrollStateOptions = {}): boolean {
  const scrolled = readScrollState(options);
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute(SCROLL_STATE_ATTRIBUTE, scrolled ? "true" : "false");
  }
  return scrolled;
}

function scrollStateBound(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.hasAttribute(SCROLL_STATE_ATTRIBUTE);
}

function bindScrollState(options: ScrollStateOptions = {}): () => void {
  if (typeof window === "undefined" || scrollStateBound()) return () => undefined;
  const update = () => {
    applyScrollState(options);
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  return () => {
    window.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
  };
}

function createScrollStateBootScript(options: ScrollStateOptions = {}): string {
  return [
    "(function(){try{",
    `var A=${JSON.stringify(SCROLL_STATE_ATTRIBUTE)},T=${scrollStateThreshold(options)};`,
    "var h=document.documentElement;",
    "var u=function(){h.setAttribute(A,(window.scrollY||window.pageYOffset||0)>T?'true':'false')};",
    "u();",
    "window.addEventListener('scroll',u,{passive:true});",
    "window.addEventListener('resize',u,{passive:true});",
    "}catch(e){}})();",
  ].join("");
}

export {
  DEFAULT_SCROLL_THRESHOLD,
  SCROLL_STATE_ATTRIBUTE,
  SCROLL_STATE_SELECTOR,
  applyScrollState,
  bindScrollState,
  createScrollStateBootScript,
  readScrollState,
};
export type { ScrollStateOptions };
