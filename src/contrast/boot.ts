import { BAR_SAMPLE, ON_DARK_ATTR, SEED_ATTR, SEED_STORAGE_PREFIX } from "./selectors.js";

function contrastSeedSource(): string[] {
  return [
    "var K=S+location.pathname+location.search,N='';",
    "try{N=(performance.getEntriesByType('navigation')[0]||{}).type||''}catch(e){}",
    "if(N==='reload'||N==='back_forward'){",
    "var v='';try{v=sessionStorage.getItem(K)||''}catch(e){}",
    "if(v==='true'||v==='false')document.documentElement.setAttribute(A,v)}",
  ];
}

function contrastRememberSource(): string[] {
  return [
    "window.addEventListener('pagehide',function(){try{",
    "var bar=document.querySelector(B);",
    "if(!bar)return;",
    `sessionStorage.setItem(K,bar.getAttribute(${JSON.stringify(ON_DARK_ATTR)})==='true'?'true':'false')`,
    "}catch(e){}});",
  ];
}

function createContrastBootScript(): string {
  return [
    "(function(){try{",
    `var A=${JSON.stringify(SEED_ATTR)},S=${JSON.stringify(SEED_STORAGE_PREFIX)};`,
    `var B=${JSON.stringify(BAR_SAMPLE)};`,
    ...contrastSeedSource(),
    ...contrastRememberSource(),
    "}catch(e){}})();",
  ].join("");
}

export { createContrastBootScript };
