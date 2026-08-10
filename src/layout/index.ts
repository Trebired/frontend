import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { bindBreadcrumbs } from "./breadcrumb.js";
import {
  HEADER_PRIMARY_SELECTOR,
  HEADER_SECONDARY_SELECTOR,
  bindHeaders,
  type HeaderRuntimeOptions,
} from "./header.js";

const LAYOUT_ROOT_SELECTOR = "[data-tbf-layout-root]";
const LAYOUT_MAIN_SELECTOR = "[data-tbf-layout-main]";
const LAYOUT_CONTENT_SELECTOR = "[data-tbf-layout-content]";
const LAYOUT_PORTAL_ROOT_ID = "tbf_layout_portal_root";
const LAYOUT_PORTAL_ROOT_SELECTOR = "[data-tbf-layout-portal-root]";
const LAYOUT_BODY_ATTRIBUTE = "data-tbf-layout";
const LAYOUT_MOBILE_BODY_ATTRIBUTE = "data-tbf-layout-mobile";

type LayoutSide = "left" | "right";

type LayoutBodyState = {
  hasHeader: boolean;
  hasLeftSidebar: boolean;
  hasMobileBottomBar: boolean;
  hasRightSidebar: boolean;
  hasSecondaryHeader: boolean;
};

type LayoutRuntimeOptions = {
  header?: HeaderRuntimeOptions;
  mobile?: boolean;
};

function layoutSideSelector(side: LayoutSide) {
  return `[data-tbf-sidebar-shell][data-tbf-sidebar-side="${side}"]`;
}

function hasSidebar(root: ParentNode, side: LayoutSide) {
  return Boolean(root.querySelector(layoutSideSelector(side)));
}

function readLayoutBodyState(root: ParentNode = document): LayoutBodyState {
  return {
    hasHeader: Boolean(root.querySelector(HEADER_PRIMARY_SELECTOR)),
    hasLeftSidebar: hasSidebar(root, "left"),
    hasMobileBottomBar: Boolean(root.querySelector("[data-tbf-layout-bottom-bar]")),
    hasRightSidebar: hasSidebar(root, "right"),
    hasSecondaryHeader: Boolean(root.querySelector(HEADER_SECONDARY_SELECTOR)),
  };
}

function applyLayoutBodyState(state: LayoutBodyState, options: LayoutRuntimeOptions = {}) {
  const body = typeof document !== "undefined" ? document.body : null;
  if (!body) return state;
  body.setAttribute(LAYOUT_BODY_ATTRIBUTE, "true");
  body.setAttribute("data-tbf-header-primary", state.hasHeader ? "true" : "false");
  body.setAttribute(
    "data-tbf-header-secondary",
    state.hasSecondaryHeader ? "true" : "false",
  );
  body.setAttribute("data-tbf-sidebar-left", state.hasLeftSidebar ? "true" : "false");
  body.setAttribute("data-tbf-sidebar-right", state.hasRightSidebar ? "true" : "false");
  body.setAttribute(
    LAYOUT_MOBILE_BODY_ATTRIBUTE,
    options.mobile === true || state.hasMobileBottomBar ? "true" : "false",
  );
  return state;
}

function syncLayoutBodyState(root: ParentNode = document, options: LayoutRuntimeOptions = {}) {
  return applyLayoutBodyState(readLayoutBodyState(root), options);
}

function bindLayoutRoot(root: HTMLElement | null, options: LayoutRuntimeOptions = {}) {
  if (!(root instanceof HTMLElement)) return null;
  root.setAttribute("data-tbf-layout-bound", "true");
  syncLayoutBodyState(root, options);
  return root;
}

function bindLayouts(root: BindRoot = document, options: LayoutRuntimeOptions = {}) {
  queryAll<HTMLElement>(root, LAYOUT_ROOT_SELECTOR).forEach((layoutRoot) => {
    bindLayoutRoot(layoutRoot, options);
  });
  bindHeaders(root, options.header || {});
  bindBreadcrumbs(root);
  if (root === document) syncLayoutBodyState(document, options);
}

function ensureLayoutPortalRoot() {
  if (typeof document === "undefined") return null;
  const existing = document.getElementById(LAYOUT_PORTAL_ROOT_ID);
  if (existing instanceof HTMLElement) return existing;
  const root = document.createElement("div");
  root.id = LAYOUT_PORTAL_ROOT_ID;
  root.setAttribute("data-tbf-layout-portal-root", "");
  document.body?.appendChild(root);
  return root;
}

function createLayoutBootScript(state: Partial<LayoutBodyState> = {}) {
  const payload = JSON.stringify({
    hasHeader: state.hasHeader === true,
    hasLeftSidebar: state.hasLeftSidebar === true,
    hasMobileBottomBar: state.hasMobileBottomBar === true,
    hasRightSidebar: state.hasRightSidebar === true,
    hasSecondaryHeader: state.hasSecondaryHeader === true,
  }).replace(/</gu, "\\u003c");
  return [
    "(function(){try{",
    `var state=${payload};`,
    "var body=document.body;",
    "if(!body)return;",
    "body.setAttribute('data-tbf-layout','true');",
    "body.setAttribute('data-tbf-header-primary',state.hasHeader?'true':'false');",
    "body.setAttribute('data-tbf-header-secondary',state.hasSecondaryHeader?'true':'false');",
    "body.setAttribute('data-tbf-sidebar-left',state.hasLeftSidebar?'true':'false');",
    "body.setAttribute('data-tbf-sidebar-right',state.hasRightSidebar?'true':'false');",
    "body.setAttribute('data-tbf-layout-mobile',state.hasMobileBottomBar?'true':'false');",
    "}catch(e){}})();",
  ].join("");
}

export {
  LAYOUT_BODY_ATTRIBUTE,
  LAYOUT_CONTENT_SELECTOR,
  LAYOUT_MAIN_SELECTOR,
  LAYOUT_MOBILE_BODY_ATTRIBUTE,
  LAYOUT_PORTAL_ROOT_ID,
  LAYOUT_PORTAL_ROOT_SELECTOR,
  LAYOUT_ROOT_SELECTOR,
  applyLayoutBodyState,
  bindLayoutRoot,
  bindLayouts,
  createLayoutBootScript,
  ensureLayoutPortalRoot,
  readLayoutBodyState,
  syncLayoutBodyState,
};
export * from "./breadcrumb.js";
export * from "./header.js";
export * from "./state.js";
export type { LayoutBodyState, LayoutRuntimeOptions, LayoutSide };
