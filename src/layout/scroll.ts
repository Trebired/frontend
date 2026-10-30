import { FRONTEND_PREFIX, frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";

const SCROLL_STATE_ATTRIBUTE = frontendDataAttr("scrolled");
const SCROLL_STATE_SELECTOR = frontendDataSelector("scrolled", "true");
const SCROLL_SETTLING_ATTRIBUTE = frontendDataAttr("scroll-settling");
const SCROLL_SETTLING_SELECTOR = frontendDataSelector("scroll-settling");
const SCROLL_STORAGE_PREFIX = `${FRONTEND_PREFIX}:scroll:`;
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
    const state = scrolled ? "true" : "false";
    const root = document.documentElement;
    if (root.getAttribute(SCROLL_STATE_ATTRIBUTE) !== state) root.setAttribute(SCROLL_STATE_ATTRIBUTE, state);
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

function scrollStateSeedSource(): string[] {
  return [
    `var P=${JSON.stringify(SCROLL_STORAGE_PREFIX)},N='',S=0;`,
    "try{N=(performance.getEntriesByType('navigation')[0]||{}).type||''}catch(e){}",
    "if(N==='reload'||N==='back_forward'){try{S=parseFloat(sessionStorage.getItem(P+location.pathname+location.search))||0}catch(e){}}",
    "window.addEventListener('pagehide',function(){",
    "try{sessionStorage.setItem(P+location.pathname+location.search,String(window.scrollY||window.pageYOffset||0))}catch(e){}});",
  ];
}

function scrollStateUpdateSource(): string[] {
  return [
    "var u=function(){var v=window.scrollY||window.pageYOffset||0;",
    "if(S){if(v)S=0;else v=S}",
    "var n=v>T?'true':'false';if(h.getAttribute(A)!==n)h.setAttribute(A,n)};",
  ];
}

function scrollStateSettleSource(): string[] {
  return [
    "h.setAttribute(G,'');",
    "var r=function(){h.removeAttribute(G)};",
    "['pointerdown','keydown','wheel','touchstart'].forEach(function(n){",
    "window.addEventListener(n,r,{capture:true,once:true,passive:true})});",
    "window.addEventListener('load',function(){S=0;u()});",
  ];
}

function scrollStateListenerSource(): string[] {
  return [
    "window.addEventListener('scroll',u,{passive:true});",
    "window.addEventListener('resize',u,{passive:true});",
    "window.addEventListener('pageshow',u);",
    "document.addEventListener('DOMContentLoaded',u);",
    "if(window.requestAnimationFrame)window.requestAnimationFrame(u);",
  ];
}

function scrollRestoreSource(): string[] {
  return [
    "if(S>0&&!location.hash&&'scrollRestoration' in history){",
    "history.scrollRestoration='manual';h.style.visibility='hidden';",
    "var Y=S,z=function(){if(!Y)return;window.scrollTo(0,Y);Y=0;",
    "h.style.visibility='';history.scrollRestoration='auto'};",
    "document.addEventListener('DOMContentLoaded',z,{once:true});setTimeout(z,3000)}",
  ];
}

function createScrollStateBootScript(options: ScrollStateOptions = {}): string {
  return [
    "(function(){try{",
    `var A=${JSON.stringify(SCROLL_STATE_ATTRIBUTE)},G=${JSON.stringify(SCROLL_SETTLING_ATTRIBUTE)};`,
    `var T=${scrollStateThreshold(options)},h=document.documentElement;`,
    ...scrollStateSeedSource(),
    ...scrollRestoreSource(),
    ...scrollStateUpdateSource(),
    "u();",
    ...scrollStateSettleSource(),
    ...scrollStateListenerSource(),
    "}catch(e){}})();",
  ].join("");
}

export {
  DEFAULT_SCROLL_THRESHOLD,
  SCROLL_SETTLING_ATTRIBUTE,
  SCROLL_SETTLING_SELECTOR,
  SCROLL_STATE_ATTRIBUTE,
  SCROLL_STATE_SELECTOR,
  applyScrollState,
  bindScrollState,
  createScrollStateBootScript,
  readScrollState,
};
export type { ScrollStateOptions };
