import { applySpaOptions, spaConfig, type SpaOptions } from "./config.js";
import {
  isSamePathAsLastKnown,
  notePathChange,
  seedLoadedScripts,
  softRedirect,
} from "./navigate.js";

let popstateBound = false;

function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, "");
  const target = id ? document.getElementById(id) : null;
  if (target) target.scrollIntoView();
  else window.scrollTo({ left: 0, top: 0 });
}

function bindPopstate() {
  if (popstateBound || typeof window === "undefined") return;
  popstateBound = true;
  notePathChange();
  window.addEventListener("popstate", () => {
      if (isSamePathAsLastKnown()) {
        scrollToHash(window.location.hash);
        return;
      }
      notePathChange();
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
export { hasUnsavedWork, registerUnsavedWork } from "./guards.js";
export type { UnsavedWorkCheck } from "./guards.js";
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
export { runSpaRebind, setSpaRebind } from "./config.js";
export type { SpaOptions } from "./config.js";
export type { SpaPage } from "./page.js";
export type { PageCleanup } from "./cleanup.js";
export type { SoftRedirectOptions } from "./navigate.js";
