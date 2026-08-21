import {
  applyDeviceScheme,
  getEffectiveTheme,
  onDeviceSchemeChange,
  registerThemeSync,
  systemThemeKey,
  type ThemeRuntimeOptions,
} from "./apply.js";

type ThemeEffectiveCookieSyncOptions = {
  name?: string;
  path?: string;
  sameSite?: string;
};

type ThemeFaviconSyncOptions = {
  elementId?: string;
  href?: string | ((themeKey: string) => string);
};

type ThemeBrowserSyncOptions = {
  effectiveCookie?: boolean | ThemeEffectiveCookieSyncOptions;
  favicon?: boolean | string | ThemeFaviconSyncOptions | ((themeKey: string) => string);
};

let browserSyncOptions: ThemeBrowserSyncOptions = {};
let browserSyncThemeOptions: ThemeRuntimeOptions = {};
let browserSyncRegistered = false;

function syncCookieValue(themeKey: string, options: ThemeEffectiveCookieSyncOptions) {
  const name = String(options.name || "theme_effective").trim();
  if (!name) return;
  const path = String(options.path || "/").trim() || "/";
  const sameSite = String(options.sameSite || "Lax").trim() || "Lax";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(themeKey)}; Path=${path}; SameSite=${sameSite}`;
}

function normalizeCookieSyncOptions(
  input: ThemeBrowserSyncOptions["effectiveCookie"],
) {
  if (input === true) return {};
  return input && typeof input === "object" ? input : null;
}

function faviconHref(themeKey: string, input: ThemeBrowserSyncOptions["favicon"]) {
  if (typeof input === "function") return input(themeKey);
  if (typeof input === "string") return input.replace(/\{theme\}/gu, encodeURIComponent(themeKey));
  if (input && typeof input === "object") {
    const href = input.href;
    if (typeof href === "function") return href(themeKey);
    if (typeof href === "string") return href.replace(/\{theme\}/gu, encodeURIComponent(themeKey));
  }
  return `/favicon.svg?theme=${encodeURIComponent(themeKey)}`;
}

function syncFavicon(themeKey: string, input: ThemeBrowserSyncOptions["favicon"]) {
  if (!input) return;
  const elementId =
  input && typeof input === "object" && "elementId"in input
  ? String(input.elementId || "app_favicon")
  : "app_favicon";
  const favicon = document.getElementById(elementId);
  if (
    !favicon ||
      typeof favicon.getAttribute !== "function" ||
      typeof favicon.setAttribute !== "function"
  )
  return;
  const href = faviconHref(themeKey, input);
  if (favicon.getAttribute("href") !== href) favicon.setAttribute("href", href);
}

function syncThemeBrowserState() {
  if (typeof document === "undefined") return;
  const cookieOptions = normalizeCookieSyncOptions(browserSyncOptions.effectiveCookie);
  try {
    if (cookieOptions) {
      syncCookieValue(
        getEffectiveTheme(undefined, browserSyncThemeOptions),
        cookieOptions,
      );
    }
  } catch {}
  syncFavicon(systemThemeKey(browserSyncThemeOptions), browserSyncOptions.favicon);
}

function configureThemeBrowserSync(
  options: ThemeBrowserSyncOptions | undefined,
  themeOptions: ThemeRuntimeOptions = {},
) {
  browserSyncThemeOptions = themeOptions;
  if (options !== undefined) browserSyncOptions = options || {};
  if (!browserSyncRegistered) {
    browserSyncRegistered = true;
    registerThemeSync(syncThemeBrowserState);
    onDeviceSchemeChange(() => {
        applyDeviceScheme();
        syncThemeBrowserState();
    });
  }
}

export { configureThemeBrowserSync, syncThemeBrowserState };
export type {
  ThemeBrowserSyncOptions,
  ThemeEffectiveCookieSyncOptions,
  ThemeFaviconSyncOptions,
};
