import { THEME_ATTR, THEME_MODES_GLOBAL_KEY } from "./constants.js";
import { getThemeModes, themeModeKeyOf } from "./modes.js";
import type { ThemeModeOptions } from "./modes.js";

function scriptJson(value: unknown): string {
  return JSON.stringify(value ?? null).replace(/</gu, "\\u003c");
}

function createThemeBootScript(theme: string = "", options: ThemeModeOptions = {}): string {
  const registry = getThemeModes(options);
  const schemes = Object.fromEntries(registry.modes.map((mode) => [mode.key, mode.scheme]));
  return [
    "(function(){",
    `var r=${scriptJson(registry)},s=${scriptJson(schemes)};`,
    `try{window[Symbol.for(${scriptJson(THEME_MODES_GLOBAL_KEY)})]=r}catch(e){}`,
    `var t=${scriptJson(themeModeKeyOf(theme))};`,
    "if(!s[t])t='';",
    "var p=false;try{p=!!(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches)}catch(e){}",
    "var k=t||(p?r.light:r.dark);",
    `document.documentElement.setAttribute(${scriptJson(THEME_ATTR)},k);`,
    "document.documentElement.style.colorScheme=s[k]||'light';",
    "})();",
  ].join("");
}

export { createThemeBootScript };
