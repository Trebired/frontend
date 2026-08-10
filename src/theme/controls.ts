import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import {
  THEME_BOUND_ATTR,
  THEME_CURRENT_ATTR,
  THEME_LABEL_SELECTOR,
  THEME_OPTION_SELECTOR,
  THEME_SELECT_SELECTOR,
  THEME_TOGGLE_SELECTOR,
  THEME_VALUE_ATTR,
} from "./constants.js";
import { getEffectiveTheme, nextTheme, registerThemeSync, setTheme } from "./apply.js";
import type { ThemeRuntimeOptions } from "./apply.js";
import { configureThemeModes, findThemeMode, hasThemeModeOptions, themeModeKeyOf } from "./modes.js";

const THEME_ACTIVE_ATTR = "data-tbf-theme-active";

let themeSyncRegistered = false;

function ensureThemeSync(): void {
  if (themeSyncRegistered) return;
  themeSyncRegistered = true;
  registerThemeSync((root) => syncThemeControls(root));
}

function adoptThemeModes(options: ThemeRuntimeOptions): void {
  if (hasThemeModeOptions(options)) configureThemeModes(options);
}

function isTag(element: Element, tagName: string): boolean {
  return element.tagName.toLowerCase() === tagName;
}

function syncThemeToggle(button: HTMLElement, options: ThemeRuntimeOptions = {}): void {
  const key = getEffectiveTheme(undefined, options);
  const label = button.getAttribute(`data-tbf-theme-${key}-label`) || "";
  button.removeAttribute("aria-pressed");
  button.setAttribute(THEME_CURRENT_ATTR, key);
  if (label) button.setAttribute("aria-label", label);
  const text = button.querySelector(THEME_LABEL_SELECTOR);
  if (text) text.textContent = label || findThemeMode(key, options)?.label || key;
}

function syncThemeOption(option: HTMLElement, active: boolean): void {
  option.setAttribute(THEME_ACTIVE_ATTR, active ? "true" : "false");
  if (isTag(option, "input")) {
    (option as HTMLInputElement).checked = active;
    return;
  }
  if (option.getAttribute("role") === "radio") option.setAttribute("aria-checked", active ? "true" : "false");
  else option.setAttribute("aria-pressed", active ? "true" : "false");
}

function syncThemeSelect(element: HTMLElement, options: ThemeRuntimeOptions = {}): void {
  const key = getEffectiveTheme(undefined, options);
  element.setAttribute(THEME_CURRENT_ATTR, key);
  if (isTag(element, "select")) {
    (element as HTMLSelectElement).value = key;
    return;
  }
  queryAll<HTMLElement>(element, THEME_OPTION_SELECTOR).forEach((option) => {
      syncThemeOption(option, themeModeKeyOf(option.getAttribute(THEME_VALUE_ATTR)) === key);
  });
}

function syncThemeToggles(root: BindRoot = document, options: ThemeRuntimeOptions = {}): void {
  queryAll<HTMLElement>(root, THEME_TOGGLE_SELECTOR).forEach((button) => syncThemeToggle(button, options));
}

function syncThemeSelects(root: BindRoot = document, options: ThemeRuntimeOptions = {}): void {
  queryAll<HTMLElement>(root, THEME_SELECT_SELECTOR).forEach((element) => syncThemeSelect(element, options));
}

function syncThemeControls(root: BindRoot = document, options: ThemeRuntimeOptions = {}): void {
  syncThemeToggles(root, options);
  syncThemeSelects(root, options);
}

function claimThemeControl(element: HTMLElement | null): element is HTMLElement {
  if (!(element instanceof HTMLElement) || element.hasAttribute(THEME_BOUND_ATTR)) return false;
  ensureThemeSync();
  element.setAttribute(THEME_BOUND_ATTR, "true");
  return true;
}

function bindThemeToggle(button: HTMLElement | null, options: ThemeRuntimeOptions = {}): boolean {
  adoptThemeModes(options);
  if (!claimThemeControl(button)) return false;
  button.addEventListener("click", async (event) => {
      event.preventDefault();
      await setTheme(nextTheme(options), options);
  });
  syncThemeToggle(button, options);
  return true;
}

function resolveOptionValue(element: HTMLElement, event: Event): string {
  if (isTag(element, "select")) return (element as HTMLSelectElement).value;
  const target = event.target;
  const option = target instanceof Element ? target.closest(THEME_OPTION_SELECTOR) : null;
  return option ? option.getAttribute(THEME_VALUE_ATTR) || "" : "";
}

function bindThemeSelect(element: HTMLElement | null, options: ThemeRuntimeOptions = {}): boolean {
  adoptThemeModes(options);
  if (!claimThemeControl(element)) return false;
  const handle = async (event: Event) => {
    const value = resolveOptionValue(element, event);
    if (!value) return;
    if (event.type === "click") event.preventDefault();
    await setTheme(value, options);
  };
  element.addEventListener("change", handle);
  if (!isTag(element, "select")) element.addEventListener("click", handle);
  syncThemeSelect(element, options);
  return true;
}

function bindThemeToggles(root: BindRoot = document, options: ThemeRuntimeOptions = {}): void {
  queryAll<HTMLElement>(root, THEME_TOGGLE_SELECTOR).forEach((button) => {
      bindThemeToggle(button, options);
  });
}

function bindThemeSelects(root: BindRoot = document, options: ThemeRuntimeOptions = {}): void {
  queryAll<HTMLElement>(root, THEME_SELECT_SELECTOR).forEach((element) => {
      bindThemeSelect(element, options);
  });
}

function bindThemeControls(root: BindRoot = document, options: ThemeRuntimeOptions = {}): void {
  bindThemeToggles(root, options);
  bindThemeSelects(root, options);
}

export {
  THEME_ACTIVE_ATTR,
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
};
