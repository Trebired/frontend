import type { DynamicSidebarRuntimeRenderContext } from "./types.js";
import { textValue } from "#yv4ubgils4dc";
import {
  clearChildren,
  firstNonScriptHTMLElementChild as liveRootContent,
} from "#er0dlx1gtbzh";
import { frontendDataAttr } from "#5vbaqj4pirp3";

function rootDocument(root: HTMLElement) {
  return root.ownerDocument || document;
}

function slotActive(slot: HTMLElement, visibilityAttr: string) {
  const visibility = textValue(slot.getAttribute(visibilityAttr), "always");
  return visibility !== "active" ||
    slot.getAttribute(frontendDataAttr("sidebar-active")) === "1";
}

function slotDisabled(slot: HTMLElement) {
  return slot.getAttribute(frontendDataAttr("sidebar-disabled")) === "1";
}

function runtimeContext(
  root: HTMLElement,
  counts: unknown,
  slot: HTMLElement,
): DynamicSidebarRuntimeRenderContext {
  return {
    active: slot.getAttribute(frontendDataAttr("sidebar-active")) === "1",
    counts,
    disabled: slotDisabled(slot),
    document: rootDocument(root),
  };
}

export {
  clearChildren,
  liveRootContent,
  rootDocument,
  runtimeContext,
  slotActive,
  slotDisabled,
};
