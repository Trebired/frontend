import type { BindRoot } from "#er0dlx1gtbzh";
import { applyTheme, normalizeTheme, readPersistedTheme } from "./apply.js";
import type { ThemeRuntimeOptions } from "./apply.js";
import { configureThemeBrowserSync } from "./browser-sync.js";
import { bindThemeControls } from "./controls.js";
import {
  configureThemeModes,
  configureThemeModesFromCss,
  hasThemeModeOptions,
} from "./modes.js";

let themeRuntimeApplied = false;

async function bindThemeRuntime(
  root: BindRoot = document,
  options: ThemeRuntimeOptions = {},
): Promise<void> {
  if (hasThemeModeOptions(options)) configureThemeModes(options);
  else configureThemeModesFromCss();
  if (options.sync !== undefined) configureThemeBrowserSync(options.sync, options);
  if (!themeRuntimeApplied) {
    themeRuntimeApplied = true;
    const persisted = await readPersistedTheme(options.persistence, options);
    applyTheme(persisted || normalizeTheme(options.defaultTheme, options), options);
  }
  bindThemeControls(root, options);
}

export {
  THEME_ATTR,
  THEME_CHANGE_EVENT,
  THEME_CURRENT_ATTR,
  THEME_OPTION_SELECTOR,
  THEME_SELECT_SELECTOR,
  THEME_TOGGLE_SELECTOR,
  THEME_VALUE_ATTR,
} from "./constants.js";
export {
  DEFAULT_THEME_MODE_KEYS,
  DEFAULT_THEME_MODE_REGISTRY,
  configureThemeModes,
  configureThemeModesFromCss,
  findThemeMode,
  getThemeModes,
  hasThemeModeOptions,
  isThemeMode,
  normalizeThemeMode,
  normalizeThemeModeRegistry,
  readCssThemeModeOptions,
  themeModeKeys,
} from "./modes.js";
export {
  applyTheme,
  currentDomTheme,
  getEffectiveTheme,
  nextTheme,
  normalizeTheme,
  registerThemeSync,
  setTheme,
  systemThemeKey,
  themeScheme,
} from "./apply.js";
export {
  bindThemeControls,
  bindThemeSelect,
  bindThemeSelects,
  bindThemeToggle,
  bindThemeToggles,
  syncThemeControls,
  syncThemeSelect,
  syncThemeSelects,
  syncThemeToggle,
  syncThemeToggles,
} from "./controls.js";
export { createThemeBootScript } from "./boot.js";
export { configureThemeBrowserSync, syncThemeBrowserState } from "./browser-sync.js";
export { bindThemeRuntime };
export type {
  ThemeMode,
  ThemeModeDescriptor,
  ThemeModeInput,
  ThemeModeOptions,
  ThemeModeRegistry,
  ThemeModeScheme,
} from "./modes.js";
export type { ThemePersistenceAdapter, ThemeRuntimeOptions, ThemeValue } from "./apply.js";
export type {
  ThemeBrowserSyncOptions,
  ThemeEffectiveCookieSyncOptions,
  ThemeFaviconSyncOptions,
} from "./browser-sync.js";
