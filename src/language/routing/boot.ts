import { normalizeLocaleRouting } from "./options.js";
import type { LocaleRoutingOptions } from "./options.js";

function scriptJson(value: unknown): string {
  return JSON.stringify(value ?? null).replace(/</gu, "\\u003c");
}

function readStoredLocaleSource(): string[] {
  return [
    "var r='';try{r=window.localStorage.getItem(K)||''}catch(e){}",
    "if(L.indexOf(r)<0)r='';",
  ];
}

function explicitPrefixSource(): string[] {
  return [
    "var s=p.split('/');var u=L.indexOf(s[1])>=0?s[1]:'';",
    "if(u){try{window.localStorage.setItem(K,u)}catch(e){}d.lang=u;return}",
  ];
}

function navigatorLocaleSource(): string[] {
  return [
    "if(!n){try{var g=navigator.languages||[navigator.language||''];",
    "for(var i=0;i<g.length;i++){var t=String(g[i]||'').trim().toLowerCase().replace(/_/g,'-');",
    "var b=t.split('-')[0];",
    "if(L.indexOf(t)>=0){n=t;break}if(L.indexOf(b)>=0){n=b;break}}}catch(e){}}",
  ];
}

function createLocaleBootScript(options: LocaleRoutingOptions = {}): string {
  const routing = normalizeLocaleRouting(options);
  return [
    "(function(){",
    `var L=${scriptJson(routing.locales)},D=${scriptJson(routing.defaultLocale)},`,
    `K=${scriptJson(routing.storageKey)};`,
    "var d=document.documentElement;var p=location.pathname||'/';",
    ...explicitPrefixSource(),
    ...readStoredLocaleSource(),
    "var n=r;",
    ...navigatorLocaleSource(),
    "if(n&&n!==D){location.replace('/'+n+(p==='/'?'':p)+location.search+location.hash);return}",
    "d.lang=D;",
    "})();",
  ].join("");
}

export { createLocaleBootScript };
