import {
  queryAll,
  setAriaExpanded,
  type BindRoot,
  type Cleanup,
} from "#er0dlx1gtbzh";
import {
  frontendCssVar,
  frontendDataAttr,
  frontendDataSelector,
  frontendElementClass,
  frontendEventName,
} from "#5vbaqj4pirp3";
import { softRedirect } from "#xhefk4bgh568";

const HEADER_SELECTOR = frontendDataSelector("header");
const HEADER_PRIMARY_SELECTOR = `${frontendDataSelector("header")}${frontendDataSelector("header-primary")}`;
const HEADER_SECONDARY_SELECTOR = `${frontendDataSelector("header")}${frontendDataSelector("header-secondary")}`;
const MOBILE_NAV_SELECTOR = frontendDataSelector("mobile-nav");
const MOBILE_NAV_PANEL_SELECTOR = frontendDataSelector("mobile-nav-panel");
const MOBILE_NAV_TOGGLE_SELECTOR = frontendDataSelector("mobile-nav-toggle");
const MOBILE_NAV_CLOSE_SELECTOR = frontendDataSelector("mobile-nav-close");
const HEADER_BRAND_LINK_SELECTOR = `a.${frontendElementClass("shell-header-brand", "link")}`;
const HEADER_BOUND_ATTR = frontendDataAttr("header-bound");
const MOBILE_NAV_BOUND_ATTR = frontendDataAttr("mobile-nav-bound");
const MOBILE_NAV_EVENT = frontendEventName("mobile-nav");

type HeaderRuntimeOptions = {
  breakpoint?: string;
};

type MobileNavState = {
  nav: HTMLElement;
  open: boolean;
  panel: HTMLElement | null;
};

const navStates = new WeakMap<HTMLElement, MobileNavState>();
const cleanupByRoot = new WeakMap<object, Cleanup>();
const boundHeaderBrandLinks = new WeakSet<HTMLAnchorElement>();

function elementHeight(element: Element | null) {
  if (!(element instanceof HTMLElement)) return 0;
  return Math.ceil(element.getBoundingClientRect().height || element.offsetHeight || 0);
}

function syncHeaderOffsets(root: ParentNode = document) {
  const primary = root.querySelector(HEADER_PRIMARY_SELECTOR) || document.querySelector(HEADER_PRIMARY_SELECTOR);
  const secondary = root.querySelector(HEADER_SECONDARY_SELECTOR) || document.querySelector(HEADER_SECONDARY_SELECTOR);
  const primaryHeight = elementHeight(primary);
  const secondaryHeight = elementHeight(secondary);
  const target = document.body || document.documentElement;
  target.setAttribute(frontendDataAttr("header-primary"), primary ? "true" : "false");
  target.setAttribute(frontendDataAttr("header-secondary"), secondary ? "true" : "false");
  target.style.setProperty(frontendCssVar("header-height"), `${primaryHeight}px`);
  target.style.setProperty(frontendCssVar("secondary-header-height"), `${secondaryHeight}px`);
  target.style.setProperty(frontendCssVar("layout-top-offset"), `${primaryHeight + secondaryHeight}px`);
  return { primaryHeight, secondaryHeight };
}

function dispatchMobileNavState(state: MobileNavState) {
  state.nav.dispatchEvent(new CustomEvent(MOBILE_NAV_EVENT, {
        bubbles: true,
        detail: { nav: state.nav, open: state.open, panel: state.panel },
  }));
}

function applyMobileNavState(nav: HTMLElement, open: boolean) {
  const panel = nav.querySelector<HTMLElement>(MOBILE_NAV_PANEL_SELECTOR);
  const state = { nav, open, panel };
  navStates.set(nav, state);
  nav.setAttribute(frontendDataAttr("mobile-nav-open"), open ? "true" : "false");
  panel?.setAttribute("aria-hidden", open ? "false" : "true");
  queryAll<HTMLElement>(document, MOBILE_NAV_TOGGLE_SELECTOR).forEach((button) => {
      if (button.getAttribute("aria-controls") === nav.id) setAriaExpanded(button, open);
  });
  document.body?.setAttribute(frontendDataAttr("mobile-nav-open"), open ? "true" : "false");
  dispatchMobileNavState(state);
  return state;
}

function openMobileNav(nav: HTMLElement) {
  return applyMobileNavState(nav, true);
}

function closeMobileNav(nav: HTMLElement) {
  return applyMobileNavState(nav, false);
}

function toggleMobileNav(nav: HTMLElement) {
  const state = navStates.get(nav);
  return applyMobileNavState(nav, !(state?.open === true));
}

function resolveMobileNav(button: HTMLElement) {
  const controls = button.getAttribute("aria-controls") || button.getAttribute(frontendDataAttr("mobile-nav-target"));
  if (controls) {
    const target = document.getElementById(controls.replace(/^#/u, ""));
    if (target instanceof HTMLElement && target.matches(MOBILE_NAV_SELECTOR)) return target;
  }
  return document.querySelector<HTMLElement>(MOBILE_NAV_SELECTOR);
}

function bindMobileNav(nav: HTMLElement | null) {
  if (!(nav instanceof HTMLElement) || nav.hasAttribute(MOBILE_NAV_BOUND_ATTR)) return null;
  nav.setAttribute(MOBILE_NAV_BOUND_ATTR, "true");
  applyMobileNavState(nav, nav.getAttribute(frontendDataAttr("mobile-nav-open")) === "true");
  nav.querySelectorAll<HTMLElement>(MOBILE_NAV_CLOSE_SELECTOR).forEach((button) => {
      button.addEventListener("click", (event) => {
          event.preventDefault();
          closeMobileNav(nav);
      });
  });
  return nav;
}

function bindMobileNavToggle(button: HTMLElement | null) {
  if (!(button instanceof HTMLElement) || button.hasAttribute(frontendDataAttr("mobile-nav-toggle-bound"))) {
    return null;
  }
  const nav = resolveMobileNav(button);
  if (!nav) return null;
  button.setAttribute(frontendDataAttr("mobile-nav-toggle-bound"), "true");
  button.addEventListener("click", (event) => {
      event.preventDefault();
      toggleMobileNav(nav);
  });
  return nav;
}

function installLayoutChromeListeners(root: BindRoot, options: HeaderRuntimeOptions) {
  const key = root as object;
  if (cleanupByRoot.has(key)) return cleanupByRoot.get(key) || null;
  let frame = 0;
  const sync = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
        frame = 0;
        syncHeaderOffsets(document);
    });
  };
  const observer = typeof ResizeObserver === "function" ? new ResizeObserver(sync) : null;
  queryAll<HTMLElement>(root, `${HEADER_PRIMARY_SELECTOR},${HEADER_SECONDARY_SELECTOR}`).forEach((header) => {
      observer?.observe(header);
  });
  const media = window.matchMedia?.(options.breakpoint || "(max-width: 900px)");
  const closeOnDesktop = () => {
    if (media && media.matches) return;
    queryAll<HTMLElement>(document, `${MOBILE_NAV_SELECTOR}${frontendDataSelector("mobile-nav-open", "true")}`)
    .forEach(closeMobileNav);
  };
  media?.addEventListener?.("change", closeOnDesktop);
  document.addEventListener("keydown", closeOnEscape);
  const cleanup = () => {
    observer?.disconnect();
    media?.removeEventListener?.("change", closeOnDesktop);
    document.removeEventListener("keydown", closeOnEscape);
  };
  cleanupByRoot.set(key, cleanup);
  return cleanup;
}

function closeOnEscape(event: KeyboardEvent) {
  if (event.key !== "Escape") return;
  queryAll<HTMLElement>(document, `${MOBILE_NAV_SELECTOR}${frontendDataSelector("mobile-nav-open", "true")}`)
  .forEach(closeMobileNav);
}

function bindHeaders(root: BindRoot = document, options: HeaderRuntimeOptions = {}) {
  queryAll<HTMLElement>(root, HEADER_SELECTOR).forEach((header) => {
      header.setAttribute(HEADER_BOUND_ATTR, "true");
  });
  queryAll<HTMLAnchorElement>(root, HEADER_BRAND_LINK_SELECTOR).forEach((link) => {
      if (boundHeaderBrandLinks.has(link)) return;
      boundHeaderBrandLinks.add(link);
      link.addEventListener("click", (event) => {
          if (
            event.defaultPrevented ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey ||
              event.button !== 0 ||
              link.hasAttribute("download") ||
              (link.target && link.target !== "_self") ||
              link.getAttribute("aria-disabled") === "true" ||
              link.getAttribute(frontendDataAttr("disabled")) === "true" ||
              link.closest(frontendDataSelector("full-reload"))
          ) {
            return;
          }
          const href = String(link.getAttribute("href") || "").trim();
          if (!href || href.startsWith("#")) return;
          let url: URL;
          try {
            url = new URL(href, window.location.href);
          } catch {
            return;
          }
          if (url.origin !== window.location.origin) return;
          if (
            url.hash &&
              url.pathname === window.location.pathname &&
              url.search === window.location.search
          ) {
            return;
          }
          event.preventDefault();
          void softRedirect(`${url.pathname}${url.search}${url.hash}`);
      });
  });
  queryAll<HTMLElement>(root, MOBILE_NAV_SELECTOR).forEach(bindMobileNav);
  queryAll<HTMLElement>(root, MOBILE_NAV_TOGGLE_SELECTOR).forEach(bindMobileNavToggle);
  syncHeaderOffsets(root);
  installLayoutChromeListeners(root, options);
}

export {
  HEADER_PRIMARY_SELECTOR,
  HEADER_SECONDARY_SELECTOR,
  HEADER_SELECTOR,
  MOBILE_NAV_CLOSE_SELECTOR,
  MOBILE_NAV_EVENT,
  MOBILE_NAV_PANEL_SELECTOR,
  MOBILE_NAV_SELECTOR,
  MOBILE_NAV_TOGGLE_SELECTOR,
  bindHeaders,
  bindMobileNav,
  bindMobileNavToggle,
  closeMobileNav,
  openMobileNav,
  syncHeaderOffsets,
  toggleMobileNav,
};
export type { HeaderRuntimeOptions, MobileNavState };
