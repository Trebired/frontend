import { applySpaOptions, spaConfig, type SpaOptions } from "./config.js";
import { seedLoadedScripts, softRedirect } from "./navigate.js";

let popstateBound = false;

function bindPopstate() {
  if (popstateBound || typeof window === "undefined") return;
  popstateBound = true;
  window.addEventListener("popstate", () => {
      void softRedirect(window.location.href, { history: "none" });
  });
}

function configureSpa(options: SpaOptions = {}) {
  applySpaOptions(options);
  seedLoadedScripts();
  bindPopstate();
}

function isFullReloadOptOut(element: Element | null) {
  return Boolean(element?.closest(spaConfig().fullReloadSelector));
}

function spaNavigationAdapter() {
  return {
    navigate(url: string) {
      return softRedirect(url);
    },
    shouldFullReload(trigger: HTMLElement) {
      return isFullReloadOptOut(trigger);
    },
  };
}

export { configureSpa, isFullReloadOptOut, spaNavigationAdapter };
export { registerPageCleanup } from "./cleanup.js";
export { createLiveOverlayState, removeStalePortaledOverlays } from "./overlays.js";
export { currentPage, onPageChange } from "./page.js";
export { rehydrate, softRedirect, softRefresh, softReload } from "./navigate.js";
export { setSpaRebind } from "./config.js";
export type { SpaOptions } from "./config.js";
export type { SpaPage } from "./page.js";
export type { PageCleanup } from "./cleanup.js";
export type { SoftRedirectOptions } from "./navigate.js";

const NON_SOFT_HREF = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/iu;

type SoftLinkInput = {
  disabled?: boolean;
  download?: unknown;
  href?: unknown;
  target?: string;
};

function isSoftNavigableHref(link: SoftLinkInput): boolean {
  const href = typeof link.href === "string" ? link.href.trim() : "";
  if (!href || link.disabled) return false;
  if (link.download !== undefined) return false;
  if (link.target && link.target !== "_self") return false;
  return !NON_SOFT_HREF.test(href);
}

export { isSoftNavigableHref };
export type { SoftLinkInput };
