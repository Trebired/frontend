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
export {
  bindGuardedReload,
  navigationAllowed,
  navigationPending,
  registerNavigationGuard,
} from "./guards.js";
export type { NavigationGuard, NavigationGuardOptions } from "./guards.js";
export {
  SOFT_REDIRECT_ATTR,
  SOFT_REDIRECT_BOUND_ATTR,
  SOFT_REDIRECT_SELECTOR,
  bindSoftRedirectLink,
  bindSoftRedirectLinks,
} from "./links.js";
export { createLiveOverlayState, removeStalePortaledOverlays } from "./overlays.js";
export { currentPage, onPageChange } from "./page.js";
export { rehydrate, softRedirect, softRefresh, softReload } from "./navigate.js";
export { setSpaRebind } from "./config.js";
export type { SpaOptions } from "./config.js";
export type { SpaPage } from "./page.js";
export type { PageCleanup } from "./cleanup.js";
export type { SoftRedirectOptions } from "./navigate.js";
