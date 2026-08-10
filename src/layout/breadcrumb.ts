import { queryAll, type BindRoot } from "#er0dlx1gtbzh";

const BREADCRUMB_SELECTOR = "[data-tbf-breadcrumb]";
const BREADCRUMB_CURRENT_SELECTOR = "[data-tbf-breadcrumb-current]";
const BREADCRUMB_EVENT = "tbf:breadcrumb";

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
  return Array.from(root.querySelectorAll<HTMLElement>("[data-tbf-breadcrumb-item]")).map((item) => ({
        current: item.getAttribute("aria-current") === "page" || item.hasAttribute("data-tbf-breadcrumb-current"),
        href: item.getAttribute("href") || item.querySelector("a")?.getAttribute("href") || undefined,
        icon: item.getAttribute("data-tbf-breadcrumb-icon") || undefined,
        key: item.getAttribute("data-tbf-breadcrumb-key") || undefined,
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
  root.setAttribute("data-tbf-breadcrumb-bound", "true");
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
