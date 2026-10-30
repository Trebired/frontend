import { frontendDataAttr, frontendDataAttrs } from "#5vbaqj4pirp3";

const FRAME_ATTRIBUTE = frontendDataAttr("frame");

const FRAME_TAGS = ["iframe", "frame", "object", "embed"];

function frontendFrameAttrs(): ReturnType<typeof frontendDataAttrs> {
  return frontendDataAttrs({ frame: "" });
}

function unverifiedFrameSelector(): string {
  return FRAME_TAGS.map((tag) => `${tag}:not([${FRAME_ATTRIBUTE}])`).join(",");
}

function createUnverifiedFrameBootScript(): string {
  const selector = JSON.stringify(unverifiedFrameSelector());
  return [
    "(function(){try{",
    `var Q=${selector},d=document,s=d.createElement('style');`,
    "s.textContent=Q+'{display:none!important}';(d.head||d.documentElement).appendChild(s);",
    "function r(f){for(var k in f)if(k.indexOf('__react')===0)return true;return false}",
    "var w=new WeakSet();function v(f){if(w.has(f))return;w.add(f);",
    "var keep=d.readyState==='loading'||r(f);if(!keep)f.remove();",
    "console.warn('[tbf] Unverified '+f.tagName.toLowerCase()+' '+(keep?'hidden':'removed')",
    `+': it has no ${FRAME_ATTRIBUTE} attribute.',f)}`,
    "function x(n){if(n.nodeType!==1)return;if(n.matches(Q)){v(n);return}",
    "if(n.firstElementChild)n.querySelectorAll(Q).forEach(v)}",
    "new MutationObserver(function(m){for(var i=0;i<m.length;i++)m[i].addedNodes.forEach(x)})",
    ".observe(d.documentElement,{childList:true,subtree:true});",
    "}catch(e){}})();",
  ].join("");
}

export { FRAME_ATTRIBUTE, createUnverifiedFrameBootScript, frontendFrameAttrs };
