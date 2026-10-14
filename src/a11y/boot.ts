import {
  A11Y_CONFIG_ATTR,
  A11Y_HIGH_CONTRAST_ATTR,
  A11Y_MOTION_PREF_ATTR,
  A11Y_REDUCE_MOTION_ATTR,
  A11Y_TEXT_SIZE_ATTR,
  REDUCED_MOTION_QUERY,
} from "./attributes.js";
import { A11Y_COOKIE_NAME, A11Y_STORAGE_KEY } from "./storage.js";
import { normalizeA11yRuntimeConfig } from "./config.js";

const HIGH_CONTRAST_QUERY = "(prefers-contrast: more)";

function bootJson(value: unknown): string {
  return JSON.stringify(value ?? null).replace(/</gu, "\\u003c");
}

function a11yBootSource(config: unknown): string[] {
  const resolved = normalizeA11yRuntimeConfig(config);
  return [
    `h.setAttribute(${bootJson(A11Y_CONFIG_ATTR)},${bootJson(bootJson(resolved))});`,
    `var AK=${bootJson(A11Y_STORAGE_KEY)},AC=${bootJson(A11Y_COOKIE_NAME)},`,
    `AD=${bootJson(resolved.defaults)},`,
    `AM=${bootJson(A11Y_MOTION_PREF_ATTR)},AR=${bootJson(A11Y_REDUCE_MOTION_ATTR)},`,
    `AT=${bootJson(A11Y_TEXT_SIZE_ATTR)},AH=${bootJson(A11Y_HIGH_CONTRAST_ATTR)};`,
    "var as=null;try{as=JSON.parse(localStorage.getItem(AK)||'null')}catch(e){as=null}",
    "if(!as){var am=document.cookie.match('(?:^|; )'+AC+'=([^;]*)');",
    "if(am){try{as=JSON.parse(decodeURIComponent(am[1]))}catch(e){as=null}}}",
    "as=as||AD;var ap=as.motion||'system',ac=as.contrast||'system',az=as.textSize||100;",
    `var ar=ap==='reduce'||(ap==='system'&&matchMedia(${bootJson(REDUCED_MOTION_QUERY)}).matches);`,
    `var ah=ac==='high'||(ac==='system'&&matchMedia(${bootJson(HIGH_CONTRAST_QUERY)}).matches);`,
    "h.setAttribute(AM,ap);h.setAttribute(AR,ar?'on':'off');",
    "h.setAttribute(AT,String(az));h.setAttribute(AH,ah?'on':'off');",
  ];
}

function createA11yBootScript(config: unknown): string {
  return ["(function(){var h=document.documentElement;", ...a11yBootSource(config), "})();"].join("");
}

export { a11yBootSource, createA11yBootScript };
