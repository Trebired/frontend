import { normalizeLocaleRouting } from "./options.js";
import type { LocaleRoutingOptions, LocaleStrategy } from "./options.js";
import { LOCALE_PENDING_ATTR, LOCALE_RENDERED_ATTR } from "./view.js";

function scriptJson(value: unknown): string {
  return JSON.stringify(value ?? null).replace(/</gu, "\\u003c");
}

function matchSource(): string[] {
  return [
    "function m(v){var t=String(v||'').trim().toLowerCase().replace(/_/g,'-');",
    "if(L.indexOf(t)>=0)return t;var b=t.split('-')[0];return L.indexOf(b)>=0?b:''}",
  ];
}

function storedLocaleSource(): string[] {
  return [
    "var n='';try{n=m(window.localStorage.getItem(K))}catch(e){}",
    "if(!n){try{var c=('; '+d.cookie).split('; '+C+'=');",
    "if(c.length>1)n=m(decodeURIComponent(c[1].split(';')[0]))}catch(e){}}",
  ];
}

function navigatorLocaleSource(): string[] {
  return [
    "if(!n){try{var g=navigator.languages||[navigator.language||''];",
    "for(var i=0;i<g.length&&!n;i++)n=m(g[i])}catch(e){}}",
  ];
}

function pendingSource(): string[] {
  return [
    "if(n!==r){h.setAttribute(P,'');h.style.visibility='hidden';",
    "d.addEventListener('DOMContentLoaded',function(){h.removeAttribute(P);h.style.visibility=''})}",
  ];
}

type LocaleBootOptions = {
  strategy?: LocaleStrategy;
};

function createLocaleBootScript(options: LocaleRoutingOptions = {}, boot: LocaleBootOptions = {}): string {
  const routing = normalizeLocaleRouting(options);
  const detectBrowser = boot.strategy !== "prefix";
  return [
    "(function(){",
    `var L=${scriptJson(routing.locales)},D=${scriptJson(routing.defaultLocale)},`,
    `K=${scriptJson(routing.storageKey)},C=${scriptJson(routing.cookieName)},`,
    `R=${scriptJson(LOCALE_RENDERED_ATTR)},P=${scriptJson(LOCALE_PENDING_ATTR)};`,
    "var d=document,h=d.documentElement,r=h.lang||D;h.setAttribute(R,r);",
    ...matchSource(),
    ...storedLocaleSource(),
    ...(detectBrowser ? navigatorLocaleSource() : []),
    "n=n||r;h.lang=n;",
    ...pendingSource(),
    "})();",
  ].join("");
}

export { createLocaleBootScript };
export type { LocaleBootOptions };
