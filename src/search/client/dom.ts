import type { BindRoot } from "#er0dlx1gtbzh";
import { tagName } from "./config.js";

function scopeRoot(target: unknown): BindRoot | null {
  if (target && typeof (target as ParentNode).querySelectorAll === "function") {
    return target as BindRoot;
  }
  return typeof document === "undefined" ? null : document;
}

function firstNonScriptHTMLElementChild(host: Element) {
  return Array.from(host.children).find((child) => {
    return child instanceof HTMLElement && tagName(child) !== "script";
  }) as HTMLElement | undefined;
}

function isInUnhydratedIsland(node: unknown) {
  const element = node instanceof Element ? node : null;
  return Boolean(
    element?.closest("[data-live-island-root][data-live-island-hydrated='false']"),
  );
}

export { firstNonScriptHTMLElementChild, isInUnhydratedIsland, scopeRoot };
