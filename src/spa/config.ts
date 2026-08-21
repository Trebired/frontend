import { frontendDataSelector } from "#5vbaqj4pirp3";
import type { BindRoot } from "#er0dlx1gtbzh";

type SpaOptions = {
  chromeIds?: string[];
  closeOverlays?: () => void;
  contentSelector?: string;
  fullReloadSelector?: string;
  skip?: (element: Element) => boolean;
};

type ResolvedSpaOptions = {
  chromeIds: string[];
  closeOverlays: (() => void) | null;
  contentSelector: string;
  fullReloadSelector: string;
  skip: ((element: Element) => boolean) | null;
};

const DEFAULT_CONTENT_SELECTOR = `${frontendDataSelector("live-content")},#live_content`;
const DEFAULT_FULL_RELOAD_SELECTOR = frontendDataSelector("full-reload");
const PORTALED_SELECTOR = [
  `${frontendDataSelector("modal")}[id]`,
  `${frontendDataSelector("popover")}[id]`,
  "[data-dropdown-options][id]",
].join(",");

let resolved: ResolvedSpaOptions = normalizeSpaOptions();
let rebind: ((root: BindRoot) => void) | null = null;

function normalizeSpaOptions(options: SpaOptions = {}): ResolvedSpaOptions {
  return {
    chromeIds: Array.isArray(options.chromeIds) ? options.chromeIds.filter(Boolean) : [],
    closeOverlays: typeof options.closeOverlays === "function" ? options.closeOverlays : null,
    contentSelector: String(options.contentSelector || "").trim() || DEFAULT_CONTENT_SELECTOR,
    fullReloadSelector:
    String(options.fullReloadSelector || "").trim() || DEFAULT_FULL_RELOAD_SELECTOR,
    skip: typeof options.skip === "function" ? options.skip : null,
  };
}

function spaConfig(): ResolvedSpaOptions {
  return resolved;
}

function applySpaOptions(options: SpaOptions = {}): ResolvedSpaOptions {
  resolved = normalizeSpaOptions(options);
  return resolved;
}

function setSpaRebind(handler: ((root: BindRoot) => void) | null) {
  rebind = handler;
}

function runSpaRebind(root: BindRoot) {
  rebind?.(root);
}

export {
  DEFAULT_CONTENT_SELECTOR,
  DEFAULT_FULL_RELOAD_SELECTOR,
  PORTALED_SELECTOR,
  applySpaOptions,
  runSpaRebind,
  setSpaRebind,
  spaConfig,
};
export type { ResolvedSpaOptions, SpaOptions };
