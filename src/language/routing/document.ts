import { cleanLocale } from "./options.js";
import {
  LOCALE_END_MARK,
  LOCALE_META_ATTR,
  LOCALE_PENDING_ATTR,
  LOCALE_RENDERED_ATTR,
  LOCALE_START_MARK,
  LOCALE_VIEW_ATTR,
} from "./view.js";
import type { LocaleMeta } from "./view.js";

type LocaleDocumentBodyOptions = {
  bodies: Record<string, string>;
  defaultLocale: string;
  meta?: Record<string, LocaleMeta>;
};

function scriptJson(value: unknown): string {
  return JSON.stringify(value ?? null).replace(/</gu, "\\u003c");
}

function attributeValue(value: string): string {
  return value.replace(/&/gu, "&amp;").replace(/"/gu, "&quot;").replace(/</gu, "&lt;");
}

function swapNodesSource(): string[] {
  return [
    "var t=null,q=d.querySelectorAll('template['+V+']');",
    "for(var i=0;i<q.length;i++)if(q[i].getAttribute(V)===l)t=q[i];",
    "var s=null,e=null,c=b.childNodes;",
    "for(var k=0;k<c.length;k++){if(c[k].nodeType!==8)continue;",
    "if(c[k].nodeValue===S)s=c[k];if(c[k].nodeValue===E)e=c[k]}",
    "if(t&&s&&e){while(s.nextSibling&&s.nextSibling!==e)b.removeChild(s.nextSibling);",
    "b.insertBefore(d.importNode(t.content,true),e);h.setAttribute(R,l);",
  ];
}

function swapMetaSource(): string[] {
  return [
    "var m=d.querySelector('script['+M+']'),x=m?JSON.parse(m.textContent||'{}')[l]:null;",
    "if(x&&x.title)d.title=x.title;",
    "var n=d.querySelector('meta[name=\"description\"]');",
    "if(x&&x.description&&n)n.setAttribute('content',x.description)",
  ];
}

function localeSwapScript(): string {
  return [
    "(function(){",
    `var V=${scriptJson(LOCALE_VIEW_ATTR)},M=${scriptJson(LOCALE_META_ATTR)},`,
    `R=${scriptJson(LOCALE_RENDERED_ATTR)},P=${scriptJson(LOCALE_PENDING_ATTR)},`,
    `S=${scriptJson(LOCALE_START_MARK)},E=${scriptJson(LOCALE_END_MARK)};`,
    "var d=document,h=d.documentElement,b=d.body,l=h.lang;",
    "try{if(h.getAttribute(R)!==l){",
    ...swapNodesSource(),
    ...swapMetaSource(),
    "}else h.lang=h.getAttribute(R)||l}}catch(err){h.lang=h.getAttribute(R)||l}",
    "h.removeAttribute(P);h.style.visibility='';",
    "})();",
  ].join("");
}

function createLocaleDocumentBody(options: LocaleDocumentBodyOptions): string {
  const defaultLocale = cleanLocale(options.defaultLocale);
  const entries = Object.entries(options.bodies).map(([locale, body]) => [cleanLocale(locale), String(body ?? "")]);
  const primary = entries.find(([locale]) => locale === defaultLocale)?.[1] ?? "";
  const templates = entries
  .filter(([locale]) => locale !== defaultLocale)
  .map(([locale, body]) => `<template ${LOCALE_VIEW_ATTR}="${attributeValue(locale)}">${body}</template>`);
  const meta = options.meta
  ? `<script type="application/json" ${LOCALE_META_ATTR}>${scriptJson(options.meta)}</script>`
  : "";
  return [
    `<!--${LOCALE_START_MARK}-->`,
    primary,
    `<!--${LOCALE_END_MARK}-->`,
    ...templates,
    meta,
    `<script>${localeSwapScript()}</script>`,
  ].join("");
}

export { createLocaleDocumentBody };
export type { LocaleDocumentBodyOptions };
