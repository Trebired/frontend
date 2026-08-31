import { LAYER_ROOT_ID, layerPortalOrigin } from "#ccvonx3uhbte";
import { LAYOUT_PORTAL_ROOT_ID } from "#ieim4iimrwal";
import { frontendDataAttr } from "#5vbaqj4pirp3";
import { MODAL_SELECTOR, closeModal } from "#8rm3pzkj3gge";
import { hidePopover } from "#knbi1qla9fbx";

type LivePortaledOverlayOptions = {
  modalSelector?: string;
  portaledSelector?: string | string[];
};

const DEFAULT_MODAL_SELECTOR = `${MODAL_SELECTOR}[id]`;
const POPOVER_ATTR = frontendDataAttr("popover");

function resolvePortalElement(id: string) {
  if (typeof document === "undefined") return null;
  const root = document.getElementById(id);
  return root instanceof HTMLElement ? root : null;
}

function overlayPortalRoots() {
  const roots = [
    resolvePortalElement(LAYOUT_PORTAL_ROOT_ID),
    resolvePortalElement(LAYER_ROOT_ID),
  ].filter((root): root is HTMLElement => root instanceof HTMLElement);
  return Array.from(new Set(roots));
}

function queryElements(root: ParentNode | null | undefined, selector: string) {
  const value = String(selector || "").trim();
  if (!root || !value || typeof root.querySelectorAll !== "function") return [];
  try {
    return Array.from(root.querySelectorAll(value))
    .filter((node): node is HTMLElement => node instanceof HTMLElement);
  } catch {
    return [];
  }
}

function normalizeSelectorList(selector: string | string[] | undefined) {
  return (Array.isArray(selector) ? selector : [selector || ""])
  .map((item) => String(item || "").trim())
  .filter(Boolean)
  .join(", ");
}

function closeStaleOverlayNode(
  node: HTMLElement,
  options: LivePortaledOverlayOptions,
) {
  const modalSelector =
  String(options.modalSelector || DEFAULT_MODAL_SELECTOR).trim() ||
    DEFAULT_MODAL_SELECTOR;
  if (node.matches(modalSelector) || node.matches(MODAL_SELECTOR)) {
    closeModal(node);
  } else if (node.hasAttribute(POPOVER_ATTR)) {
    hidePopover(node);
  }
  node.remove();
}

/**
 * A portaled overlay is stale only when it was portaled *out of the root being
 * replaced* — that is what makes it an orphan once that root's content goes
 * away.
 *
 * Current position cannot answer this: every portaled node lives in a portal
 * root and is therefore never contained by the content root, so a
 * `!root.contains(node)` test matches all of them indiscriminately. That
 * deleted persistent app-shell overlays (a header's notifications modal, a
 * user menu) on every soft navigation, but only once they had been opened —
 * opening is what portals them — leaving their triggers bound to an element
 * that no longer existed and silently dead.
 *
 * `layerPortalOrigin` reports where the node actually came from, so ownership
 * decides. An overlay with no recorded origin was never portaled by us (it was
 * authored inside a portal root, or created detached) and is nobody's orphan,
 * so it is left alone.
 */
function isStalePortaledOverlay(node: HTMLElement, root: HTMLElement) {
  const origin = layerPortalOrigin(node);
  if (!origin) return false;
  return origin === root || root.contains(origin);
}

function removeStalePortaledOverlaysFromRoot(
  options: LivePortaledOverlayOptions = {},
  rootInput?: ParentNode,
) {
  const selector = normalizeSelectorList(options.portaledSelector);
  if (!selector || !(rootInput instanceof HTMLElement)) return;
  overlayPortalRoots().forEach((portal) => {
      queryElements(portal, selector).forEach((node) => {
          if (isStalePortaledOverlay(node, rootInput)) {
            closeStaleOverlayNode(node, options);
          }
      });
  });
}

export {
  overlayPortalRoots,
  queryElements,
  removeStalePortaledOverlaysFromRoot,
};
