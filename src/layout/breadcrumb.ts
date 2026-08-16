import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { frontendDataAttr, frontendDataSelector, frontendEventName } from "#5vbaqj4pirp3";

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
};
export type { BreadcrumbItemModel, BreadcrumbState };
