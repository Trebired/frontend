import { escapeHtml } from "#ndsvdqv80epr";

const INTERACTIVE_TARGET_SELECTOR = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "summary",
  '[contenteditable="true"]',
].join(",");

type BindRoot = Document | DocumentFragment | Element;
type Cleanup = () => void;

function bindRoot(root: BindRoot | null | undefined): BindRoot {
  if (root && "querySelectorAll" in root) return root;
  return document;
}

function asElement(value: unknown): Element | null {
  return value instanceof Element ? value : null;
}

function asHTMLElement(value: unknown): HTMLElement | null {
  return value instanceof HTMLElement ? value : null;
}

function onReady(callback: () => void) {
  if (typeof document === "undefined") return;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
    return;
  }
  callback();
}

function queryAll<T extends Element = Element>(
  root: BindRoot | null | undefined,
  selector: string,
): T[] {
  const scope = bindRoot(root);
  const items: T[] = [];
  if (scope instanceof Element && scope.matches(selector)) {
    items.push(scope as T);
  }
  scope.querySelectorAll<T>(selector).forEach((node) => items.push(node));
  return items;
}

function closestElement<T extends Element = Element>(
  value: unknown,
  selector: string,
): T | null {
  const element = asElement(value);
  if (!element || typeof element.closest !== "function") return null;
  return element.closest<T>(selector);
}

function cssEscape(value: unknown) {
  const text = String(value || "");
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(text);
  }
  return text.replace(/[^a-zA-Z0-9_-]/g, (char) => {
      return `\\${char.charCodeAt(0).toString(16)} `;
  });
}

function clampNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function resolveDocumentTarget(target: unknown): HTMLElement | null {
  if (target instanceof HTMLElement) return target;
  const value = String(target || "").trim();
  if (!value || typeof document === "undefined") return null;
  if (value.startsWith("#")) return document.getElementById(value.slice(1));
  if (/^[A-Za-z][A-Za-z0-9_-]*$/u.test(value)) {
    return document.getElementById(value);
  }
  if (value.startsWith("[data-")) {
    try {
      const match = document.querySelector(value);
      return match instanceof HTMLElement ? match : null;
    } catch {
      return null;
    }
  }
  return null;
}

function jsonElementText(element: HTMLElement) {
  if (
    typeof HTMLTemplateElement !== "undefined" &&
      element instanceof HTMLTemplateElement
  ) {
    return element.content?.textContent || "";
  }
  return element.textContent || "";
}

function readJsonScript<T>(id: string, fallback: T): T {
  const element =
  typeof document !== "undefined" ? document.getElementById(id) : null;
  if (!element) return fallback;
  return parseJsonText<T>(jsonElementText(element), fallback);
}

function parseJsonText<T>(text: string, fallback: T): T {
  try {
    const parsed = JSON.parse(String(text || ""));
    return parsed == null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function readElementJson<T>(host: ParentNode | null, selector: string, fallback: T): T {
  if (!host || typeof host.querySelector !== "function") return fallback;
  const element = host.querySelector(selector);
  return element instanceof HTMLElement
  ? parseJsonText<T>(jsonElementText(element), fallback)
  : fallback;
}

function readDataJson<T>(
  host: Element | null,
  attrName: string,
  fallback: T,
): T {
  const value =
  host && typeof host.getAttribute === "function"
  ? host.getAttribute(attrName)
  : "";
  return value ? parseJsonText<T>(value, fallback) : fallback;
}

function readTextAttribute(element: Element | null | undefined, attrName: string) {
  return String(element?.getAttribute(attrName) || "").trim();
}

function documentLanguageTag() {
  return typeof document === "undefined"
  ? ""
  : String(document.documentElement.getAttribute("lang") || "").trim();
}

function browserLocalStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function connectedElementsFromSet<T extends Element>(set: Set<T> | undefined): T[] {
  const elements = Array.from(set || []).filter((element) => element.isConnected);
  if (set) {
    set.forEach((element) => {
        if (!element.isConnected) set.delete(element);
    });
  }
  return elements;
}

function firstNonScriptHTMLElementChild(host: Element) {
  return Array.from(host.children).find((child) => {
      return child instanceof HTMLElement && child.tagName.toLowerCase() !== "script";
  }) as HTMLElement | undefined;
}

function isInUnhydratedIsland(node: unknown) {
  const element = node instanceof Element ? node : null;
  return Boolean(
    element?.closest("[data-live-island-root][data-live-island-hydrated='false']"),
  );
}

function setHidden(element: Element | null | undefined, hidden: boolean) {
  if (element instanceof HTMLElement) element.hidden = hidden;
}

function setAriaExpanded(element: Element | null | undefined, expanded: boolean) {
  element?.setAttribute("aria-expanded", expanded ? "true" : "false");
}

function dispatchInputChange(input: Element | null | undefined) {
  input?.dispatchEvent(new Event("input", { bubbles: true }));
  input?.dispatchEvent(new Event("change", { bubbles: true }));
}

function isInteractiveTarget(target: unknown, extraSelector = "") {
  const element = asElement(target);
  if (!element) return false;
  const selector = extraSelector
  ? `${INTERACTIVE_TARGET_SELECTOR},${extraSelector}`
  : INTERACTIVE_TARGET_SELECTOR;
  return Boolean(element.closest(selector));
}

function setControlDisabled(element: HTMLElement | null, disabled: boolean) {
  if (!element) return;
  if ("disabled" in element) {
    (element as HTMLButtonElement).disabled = disabled;
    return;
  }
  if (disabled) element.setAttribute("disabled", "true");
  else element.removeAttribute("disabled");
}

function formDataFlatRecord(data: FormData) {
  const out: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};
  data.forEach((value, key) => {
      const current = out[key];
      if (current === undefined) {
        out[key] = value;
        return;
      }
      out[key] = Array.isArray(current) ? [...current, value] : [current, value];
  });
  return out;
}

function formDataRecord(data: FormData): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  data.forEach((value, key) => {
      const next =
      typeof value === "string" ? value : String(value == null ? "" : value);
      const current = out[key];
      if (current === undefined) {
        out[key] = next;
        return;
      }
      out[key] = Array.isArray(current) ? current.concat(next) : [current, next];
  });
  return out;
}

function formDataStringRecord(data: FormData): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  data.forEach((value, key) => {
      const next = typeof value === "string" ? value : "";
      const current = out[key];
      if (current === undefined) {
        out[key] = next;
        return;
      }
      out[key] = Array.isArray(current) ? current.concat(next) : [current, next];
  });
  return out;
}

function formDataSearchParams(data: FormData) {
  const params = new URLSearchParams();
  data.forEach((value, key) => {
      if (typeof value === "string") params.append(key, value);
  });
  return params;
}

export {
  INTERACTIVE_TARGET_SELECTOR,
  asElement,
  asHTMLElement,
  bindRoot,
  browserLocalStorage,
  clampNumber,
  closestElement,
  connectedElementsFromSet,
  cssEscape,
  cssEscape as cssEscapeId,
  documentLanguageTag,
  dispatchInputChange,
  escapeHtml,
  firstNonScriptHTMLElementChild,
  formDataFlatRecord,
  formDataRecord,
  formDataSearchParams,
  formDataStringRecord,
  isInteractiveTarget,
  isInUnhydratedIsland,
  onReady,
  parseJsonText,
  queryAll,
  readDataJson,
  readElementJson,
  readJsonScript,
  readTextAttribute,
  resolveDocumentTarget,
  setAriaExpanded,
  setControlDisabled,
  setHidden,
};
export type { BindRoot, Cleanup };
export * from "./binding.js";
export * from "./element-helpers.js";
