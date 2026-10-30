import { FRONTEND_PREFIX, frontendDataAttr, frontendDataAttrs } from "#5vbaqj4pirp3";

const FRAME_ATTRIBUTE = frontendDataAttr("frame");

const FRAME_TAGS = ["iframe", "frame", "object", "embed"];

const FRAME_LOG_GROUP = "trebired.frontend.frames";

function frontendFrameAttrs(): ReturnType<typeof frontendDataAttrs> {
  return frontendDataAttrs({ frame: "" });
}

function unverifiedFrameSelector(): string {
  return FRAME_TAGS.map((tag) => `${tag}:not([${FRAME_ATTRIBUTE}])`).join(",");
}

function createUnverifiedFrameBootScript(): string {
  const selector = JSON.stringify(unverifiedFrameSelector());
  const group = JSON.stringify(FRAME_LOG_GROUP);
  return [
    "(function(){try{",
    `var Q=${selector},d=document,s=d.createElement('style');`,
    "s.textContent=Q+'{display:none!important}';(d.head||d.documentElement).appendChild(s);",
    "function r(f){for(var k in f)if(k.indexOf('__react')===0)return true;return false}",
    "function lb(f){var t=f.getAttribute('title'),u=f.getAttribute('src')||f.getAttribute('data')||'';",
    `return f.tagName.toLowerCase()+(f.id?'#'+f.id:'')+(t?' "'+t.slice(0,60)+'"':'')`,
    "+(u?' '+u.split('?')[0].slice(0,80):f.hasAttribute('srcdoc')?' srcdoc':'')}",
    "function o(m){var g=typeof globalThis!=='undefined'?globalThis:window,l=g.__logger_adapter_logger__||g.loggerAdapterLogger;",
    "if(typeof l==='function'){try{l=l()}catch(e){l=null}}",
    `if(l&&typeof l.warn==='function'){l.warn(${group},m);return}console.warn('[WARN, '+${group}+'] '+m)}`,
    "var w=new WeakSet();function v(f){if(w.has(f))return;w.add(f);",
    "var p=f.parentNode,top=p===d.body||p===d.documentElement||p===d.head;",
    "var keep=r(f)||(d.readyState==='loading'&&!top);if(!keep)f.remove();",
    `o((keep?'Hid':'Removed')+' ${FRONTEND_PREFIX}-unverified '+lb(f))}`,
    "function x(n){if(n.nodeType!==1)return;if(n.matches(Q)){v(n);return}",
    "if(n.firstElementChild)n.querySelectorAll(Q).forEach(v)}",
    "new MutationObserver(function(m){for(var i=0;i<m.length;i++)m[i].addedNodes.forEach(x)})",
    ".observe(d.documentElement,{childList:true,subtree:true});",
    "}catch(e){}})();",
  ].join("");
}

export { FRAME_ATTRIBUTE, createUnverifiedFrameBootScript, frontendFrameAttrs };
