import { frontendDataAttr, frontendDataSelector, frontendEventName } from "#5vbaqj4pirp3";

const HEADER_SELECTOR = frontendDataSelector("site-header");
const FOOTER_SELECTOR = frontendDataSelector("site-footer");
const DARK_ATTRIBUTE = frontendDataAttr("dark");
const LIGHT_ATTRIBUTE = frontendDataAttr("light");
const TONE_ATTRIBUTE = frontendDataAttr("header-tone");
const PAGE_CHANGE_EVENT = frontendEventName("page-change");
const BAND_SELECTOR = `main > *, ${FOOTER_SELECTOR}`;
const TONE_STORAGE_PREFIX = "tbf.header-tone:";

function toneMeasureSource(): string[] {
  return [
    `var H=${JSON.stringify(HEADER_SELECTOR)},D=${JSON.stringify(DARK_ATTRIBUTE)};`,
    `var L=${JSON.stringify(LIGHT_ATTRIBUTE)},B=${JSON.stringify(BAND_SELECTOR)};`,
    "var u=function(){var h=document.querySelector(H);if(!h)return;",
    "var r=h.getBoundingClientRect(),l=r.top+r.height/2,b=null,n=-Infinity,s=document.querySelectorAll(B);",
    "for(var i=0;i<s.length;i++){var t=s[i].getBoundingClientRect().top;if(t>l||t<=n)continue;n=t;b=s[i]}",
    "if(!b)return;if(b.hasAttribute(D)){h.setAttribute(D,'');h.removeAttribute(L)}",
    "else{h.removeAttribute(D);h.setAttribute(L,'')}};",
  ];
}

function toneHoldSource(): string[] {
  return [
    "var e=document.createElement('style');",
    `e.textContent=${JSON.stringify(`${HEADER_SELECTOR},${HEADER_SELECTOR} *{transition-duration:0s !important}`)};`,
    "(document.head||document.documentElement).appendChild(e);",
    "u();",
    "var f=function(){if(e.parentNode)e.parentNode.removeChild(e)};",
    "if(window.requestAnimationFrame)requestAnimationFrame(function(){requestAnimationFrame(f)});else setTimeout(f,32);",
  ];
}

function toneListenerSource(): string[] {
  return [
    "addEventListener('scroll',u,{passive:true});",
    "addEventListener('resize',u,{passive:true});",
    "addEventListener('pageshow',u);",
    "addEventListener('load',u);",
    `document.addEventListener(${JSON.stringify(PAGE_CHANGE_EVENT)},function(){requestAnimationFrame(u)});`,
  ];
}

function toneStoreSource(): string[] {
  return [
    `var K=${JSON.stringify(TONE_STORAGE_PREFIX)}+location.pathname+location.search;`,
    "addEventListener('pagehide',function(){try{",
    `var h=document.querySelector(${JSON.stringify(HEADER_SELECTOR)});`,
    `if(h)sessionStorage.setItem(K,h.hasAttribute(${JSON.stringify(DARK_ATTRIBUTE)})?'dark':'light');`,
    "}catch(e){}});",
  ];
}

function createSiteHeaderToneScript(): string {
  return [
    "(function(){try{",
    ...toneMeasureSource(),
    ...toneHoldSource(),
    ...toneListenerSource(),
    ...toneStoreSource(),
    "}catch(e){}})();",
  ].join("");
}

function createSiteHeaderToneBootScript(): string {
  return [
    "(function(){try{",
    `var K=${JSON.stringify(TONE_STORAGE_PREFIX)}+location.pathname+location.search,N='',T='';`,
    "try{N=(performance.getEntriesByType('navigation')[0]||{}).type||''}catch(e){}",
    "if(N==='reload'||N==='back_forward'){try{T=sessionStorage.getItem(K)||''}catch(e){}}",
    `if(T==='dark'||T==='light')document.documentElement.setAttribute(${JSON.stringify(TONE_ATTRIBUTE)},T);`,
    "}catch(e){}})();",
  ].join("");
}

export { createSiteHeaderToneBootScript, createSiteHeaderToneScript };
