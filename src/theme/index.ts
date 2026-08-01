import { queryAll, type BindRoot } from "#er0dlx1gtbzh";

type ThemeValue = "dark" | "light" | "";
type ThemePersistenceAdapter = {
  get?: () => Promise<string | null | undefined> | string | null | undefined;
  set?: (theme: ThemeValue) => Promise<unknown> | unknown;
};
type ThemeRuntimeOptions = {
  defaultTheme?: ThemeValue;
  persistence?: ThemePersistenceAdapter;
};

const THEME_TOGGLE_SELECTOR = "[data-tbf-theme-button]";
const THEME_ATTR = "data-tbf-theme";

function normalizeTheme(value: unknown): ThemeValue {
  const text = String(value || "").trim().toLowerCase();
  return text === "dark" || text === "light" ? text : "";
}

function systemThemeKey(): Exclude<ThemeValue, ""> {
  try {
    return window.matchMedia?.("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  } catch {
    return "dark";
  }
}

function currentDomTheme() {
  if (typeof document === "undefined") return "";
  return normalizeTheme(document.documentElement.getAttribute(THEME_ATTR));
}

function getEffectiveTheme(value?: unknown): Exclude<ThemeValue, ""> {
  return normalizeTheme(value) || currentDomTheme() || systemThemeKey();
}

function dispatchThemeChange(theme: ThemeValue, themeKey: Exclude<ThemeValue, "">) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("tbf:themechange", {
      detail: { theme, themeKey },
    }),
  );
}

function applyTheme(theme: ThemeValue) {
  if (typeof document === "undefined") return getEffectiveTheme(theme);
  const normalized = normalizeTheme(theme);
  const next = normalized || systemThemeKey();
  const previous = currentDomTheme();
  document.documentElement.setAttribute(THEME_ATTR, next);
  document.documentElement.style.colorScheme = next;
  document.body?.setAttribute(THEME_ATTR, next);
  if (previous !== next) dispatchThemeChange(normalized, next);
  syncThemeToggles(document);
  return next;
}

async function readPersistedTheme(adapter?: ThemePersistenceAdapter) {
  if (!adapter?.get) return "";
  try {
    return normalizeTheme(await adapter.get());
  } catch {
    return "";
  }
}

async function setTheme(theme: ThemeValue, options: ThemeRuntimeOptions = {}) {
  const normalized = normalizeTheme(theme);
  applyTheme(normalized);
  if (options.persistence?.set) {
    try {
      await options.persistence.set(normalized);
    } catch {}
  }
  return getEffectiveTheme(normalized);
}

function nextTheme() {
  return getEffectiveTheme() === "light" ? "dark" : "light";
}

function syncThemeToggle(button: HTMLElement) {
  const theme = getEffectiveTheme();
  button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  const label = button.getAttribute(`data-tbf-theme-${theme}-label`);
  if (label) button.setAttribute("aria-label", label);
  const text = button.querySelector("[data-tbf-theme-label]");
  if (text) text.textContent = label || theme;
}

function syncThemeToggles(root: BindRoot = document) {
  queryAll<HTMLElement>(root, THEME_TOGGLE_SELECTOR).forEach(syncThemeToggle);
}

function bindThemeToggle(
  button: HTMLElement | null,
  options: ThemeRuntimeOptions = {},
) {
  if (!(button instanceof HTMLElement) || button.hasAttribute("data-tbf-theme-bound")) {
    return false;
  }
  button.setAttribute("data-tbf-theme-bound", "true");
  button.addEventListener("click", async (event) => {
    event.preventDefault();
    await setTheme(nextTheme(), options);
  });
  syncThemeToggle(button);
  return true;
}

function bindThemeToggles(root: BindRoot = document, options: ThemeRuntimeOptions = {}) {
  queryAll<HTMLElement>(root, THEME_TOGGLE_SELECTOR).forEach((button) => {
    bindThemeToggle(button, options);
  });
}

async function bindThemeRuntime(root: BindRoot = document, options: ThemeRuntimeOptions = {}) {
  const persisted = await readPersistedTheme(options.persistence);
  applyTheme(persisted || normalizeTheme(options.defaultTheme));
  bindThemeToggles(root, options);
}

function createThemeBootScript(theme: ThemeValue = "") {
  return [
    "(function(){",
    "function n(v){v=String(v||'').trim().toLowerCase();return v==='dark'||v==='light'?v:''}",
    "function s(){try{return window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}catch{return 'dark'}}",
    `var t=n(${JSON.stringify(theme)});`,
    "var k=t||s();",
    "document.documentElement.setAttribute('data-tbf-theme',k);",
    "document.documentElement.style.colorScheme=k;",
    "})();",
  ].join("");
}

export {
  THEME_ATTR,
  THEME_TOGGLE_SELECTOR,
  applyTheme,
  bindThemeRuntime,
  bindThemeToggle,
  bindThemeToggles,
  createThemeBootScript,
  currentDomTheme,
  getEffectiveTheme,
  normalizeTheme,
  setTheme,
  syncThemeToggles,
  systemThemeKey,
};
export type { ThemePersistenceAdapter, ThemeRuntimeOptions, ThemeValue };
