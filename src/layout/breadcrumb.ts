import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import {
  frontendDataAttr,
  frontendDataAttrs,
  frontendDataSelector,
  frontendElementClass,
  frontendEventName,
} from "#5vbaqj4pirp3";

const BREADCRUMB_SELECTOR = frontendDataSelector("breadcrumb");
const BREADCRUMB_CURRENT_SELECTOR = frontendDataSelector("breadcrumb-current");
const BREADCRUMB_EVENT = frontendEventName("breadcrumb");

type BreadcrumbItemModel = {
  current?: boolean;
  href?: string;
  icon?: string;
  key?: string;
  label: string;
};

type BreadcrumbState = {
  items: BreadcrumbItemModel[];
  root: HTMLElement;
};

function readBreadcrumbItems(root: HTMLElement): BreadcrumbItemModel[] {
  return Array.from(root.querySelectorAll<HTMLElement>(frontendDataSelector("breadcrumb-item"))).map((item) => ({
        current: item.getAttribute("aria-current") === "page" || item.hasAttribute(frontendDataAttr("breadcrumb-current")),
        href: item.getAttribute("href") || item.querySelector("a")?.getAttribute("href") || undefined,
        icon: item.getAttribute(frontendDataAttr("breadcrumb-icon")) || undefined,
        key: item.getAttribute(frontendDataAttr("breadcrumb-key")) || undefined,
        label: item.textContent?.trim() || "",
  }));
}

function applyBreadcrumbCurrent(root: HTMLElement) {
  const current = root.querySelector<HTMLElement>(BREADCRUMB_CURRENT_SELECTOR);
  if (current) current.setAttribute("aria-current", "page");
}

function dispatchBreadcrumbState(root: HTMLElement) {
  const state = { items: readBreadcrumbItems(root), root };
  root.dispatchEvent(new CustomEvent(BREADCRUMB_EVENT, {
        bubbles: true,
        detail: state,
  }));
  return state;
}

function setAttrs(element: HTMLElement, attrs: Record<string, unknown>) {
  for (const [name, value] of Object.entries(attrs)) {
    if (value !== undefined && value !== null && value !== false) element.setAttribute(name, String(value));
  }
}

function breadcrumbItemElement(item: BreadcrumbItemModel) {
  const li = document.createElement("li");
  li.className = frontendElementClass("breadcrumb", "item");
  const linked = Boolean(item.href) && item.current !== true;
  const host = document.createElement(linked ? "a" : "span");
  host.className = frontendElementClass("breadcrumb", linked ? "link" : "current");
  setAttrs(host, frontendDataAttrs({
        "breadcrumb-current": !linked && item.current ? "" : undefined,
        "breadcrumb-item": "",
        "breadcrumb-key": item.key,
  }));
  if (linked) host.setAttribute("href", String(item.href));
  if (item.current) host.setAttribute("aria-current", "page");
  const label = document.createElement("span");
  label.className = frontendElementClass("breadcrumb", "label");
  label.textContent = item.label;
  host.appendChild(label);
  li.appendChild(host);
  return li;
}

function setBreadcrumbItems(root: Element | null, items: BreadcrumbItemModel[], options: { copyValue?: string } = {}) {
  if (!(root instanceof HTMLElement)) return null;
  const list = root.querySelector<HTMLElement>(`.${frontendElementClass("breadcrumb", "list")}`);
  if (!list) return null;
  list.replaceChildren(...items.map(breadcrumbItemElement));
  const copyValue = root.querySelector<HTMLElement>(frontendDataSelector("breadcrumb-copy-value"));
  if (copyValue) copyValue.textContent = typeof options.copyValue === "string" ? options.copyValue : items.map((item) => item.label).join("/");
  return dispatchBreadcrumbState(root);
}

function bindBreadcrumb(root: HTMLElement | null) {
  if (!(root instanceof HTMLElement)) return null;
  applyBreadcrumbCurrent(root);
  root.setAttribute(frontendDataAttr("breadcrumb-bound"), "true");
  return dispatchBreadcrumbState(root);
}

function bindBreadcrumbs(root: BindRoot = document) {
  queryAll<HTMLElement>(root, BREADCRUMB_SELECTOR).forEach(bindBreadcrumb);
}

export {
  BREADCRUMB_CURRENT_SELECTOR,
  BREADCRUMB_EVENT,
  BREADCRUMB_SELECTOR,
  applyBreadcrumbCurrent,
  bindBreadcrumb,
  bindBreadcrumbs,
  dispatchBreadcrumbState,
  readBreadcrumbItems,
  setBreadcrumbItems,
};
export type { BreadcrumbItemModel, BreadcrumbState };
