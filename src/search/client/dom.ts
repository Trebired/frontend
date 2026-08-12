import {
  firstNonScriptHTMLElementChild,
  isInUnhydratedIsland,
  type BindRoot,
} from "#er0dlx1gtbzh";

function scopeRoot(target: unknown): BindRoot | null {
  if (target && typeof(target as ParentNode).querySelectorAll === "function") {
    return target as BindRoot;
  }
  return typeof document === "undefined" ? null : document;
}

export { firstNonScriptHTMLElementChild, isInUnhydratedIsland, scopeRoot };
