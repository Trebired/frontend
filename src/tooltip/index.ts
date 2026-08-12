import { clampNumber, queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { portalElement, promoteZIndex } from "#ccvonx3uhbte";

const TOOLTIP_BASE_Z_INDEX = 1100;
const TOOLTIP_LAYER_ID = "tbf_tooltip";
const TOOLTIP_SELECTOR = [
  "[data-tbf-tooltip]",
  "[title]",
  "[data-tbf-status-icon][aria-label]",
].join(",");

type TooltipState = {
  layer: HTMLElement | null;
  openTrigger: HTMLElement | null;
  shown: boolean;
};

const tooltipState: TooltipState = {
  layer: null,
  openTrigger: null,
  shown: false,
};
const tooltipTexts = new WeakMap<HTMLElement, string>();
const tooltipCleanups = new WeakMap<HTMLElement, ()=>void>();
let listenersInstalled = false;

function readTooltipText(trigger: HTMLElement | null) {
  if (!trigger) return "";
  if (tooltipTexts.has(trigger)) return String(tooltipTexts.get(trigger) || "").trim();
  const configured = String(trigger.getAttribute("data-tbf-tooltip") || "").trim();
  const title = String(trigger.getAttribute("title") || "").trim();
  const status = trigger.hasAttribute("data-tbf-status-icon")
  ? String(trigger.getAttribute("aria-label") || "").trim()
  : "";
  const text = configured || title || status;
  if (title) trigger.removeAttribute("title");
  if (text && !trigger.getAttribute("aria-description")) {
    trigger.setAttribute("aria-description", text);
  }
  tooltipTexts.set(trigger, text);
  return text;
}

function ensureTooltipLayer() {
  if (tooltipState.layer?.isConnected) return tooltipState.layer;
  const existing = document.getElementById(TOOLTIP_LAYER_ID);
  if (existing instanceof HTMLElement) {
    existing.setAttribute("role", "tooltip");
    tooltipState.layer = existing;
    portalElement(existing);
    return existing;
  }
  const layer = document.createElement("div");
  layer.id = TOOLTIP_LAYER_ID;
  layer.className = "tbf-tooltip";
  layer.setAttribute("role", "tooltip");
  layer.setAttribute("aria-hidden", "true");
  layer.setAttribute("data-tbf-tooltip-layer", "");
  portalElement(layer);
  tooltipState.layer = layer;
  return layer;
}

function measureLayer(layer: HTMLElement) {
  const wasOpen = layer.hasAttribute("data-tbf-open");
  const previous = {
    left: layer.style.left,
    opacity: layer.style.opacity,
    top: layer.style.top,
    transform: layer.style.transform,
    transition: layer.style.transition,
    visibility: layer.style.visibility,
  };
  layer.style.transition = "none";
  layer.style.transform = "translate3d(0, 0, 0) scale(1)";
  layer.style.visibility = "hidden";
  layer.style.opacity = "0";
  layer.style.left = "0px";
  layer.style.top = "0px";
  layer.setAttribute("data-tbf-open", "true");
  const rect = layer.getBoundingClientRect();
  layer.style.visibility = previous.visibility;
  layer.style.opacity = previous.opacity;
  layer.style.left = previous.left;
  layer.style.top = previous.top;
  layer.style.transform = previous.transform;
  layer.style.transition = previous.transition;
  if (!wasOpen) layer.removeAttribute("data-tbf-open");
  return rect;
}

function placeTooltip(trigger: HTMLElement, layer: HTMLElement) {
  const anchor = trigger.getBoundingClientRect();
  const tip = measureLayer(layer);
  const gap = 8;
  const gutter = 12;
  const vw = document.documentElement.clientWidth || window.innerWidth;
  const vh = document.documentElement.clientHeight || window.innerHeight;
  const fitsTop = anchor.top - gap - tip.height >= gutter;
  const top = fitsTop
  ? anchor.top - gap - tip.height
  : Math.min(anchor.bottom + gap, vh - tip.height - gutter);
  const left = clampNumber(anchor.left + anchor.width / 2 - tip.width / 2, gutter, vw - tip.width - gutter);
  layer.style.top = `${Math.max(gutter, top)}px`;
  layer.style.left = `${left}px`;
  layer.setAttribute("data-tbf-placement", fitsTop ? "top" : "bottom");
  layer.style.setProperty("--tbf-arrow-x", `${anchor.left + anchor.width / 2 - left}px`);
}

function showTooltip(trigger: HTMLElement) {
  const text = readTooltipText(trigger);
  if (!text) return false;
  const layer = ensureTooltipLayer();
  layer.textContent = text;
  if (tooltipState.openTrigger === trigger && tooltipState.shown) return true;
  promoteZIndex(layer, { fallback: TOOLTIP_BASE_Z_INDEX });
  placeTooltip(trigger, layer);
  layer.setAttribute("aria-hidden", "false");
  layer.setAttribute("data-tbf-open", "true");
  tooltipState.openTrigger = trigger;
  tooltipState.shown = true;
  return true;
}

function hideTooltip() {
  const layer = tooltipState.layer;
  if (layer) {
    layer.removeAttribute("data-tbf-open");
    layer.setAttribute("aria-hidden", "true");
  }
  tooltipState.openTrigger = null;
  tooltipState.shown = false;
}

function bindTooltip(trigger: HTMLElement | null) {
  if (!(trigger instanceof HTMLElement) || tooltipCleanups.has(trigger)) return false;
  readTooltipText(trigger);
  const showBoundTooltip = () => showTooltip(trigger);
  const hideBoundTooltip = () => hideTooltip();
  trigger.addEventListener("mouseenter", showBoundTooltip);
  trigger.addEventListener("mouseleave", hideBoundTooltip);
  trigger.addEventListener("focusin", showBoundTooltip);
  trigger.addEventListener("focusout", hideBoundTooltip);
  tooltipCleanups.set(trigger, () => {
      trigger.removeEventListener("mouseenter", showBoundTooltip);
      trigger.removeEventListener("mouseleave", hideBoundTooltip);
      trigger.removeEventListener("focusin", showBoundTooltip);
      trigger.removeEventListener("focusout", hideBoundTooltip);
  });
  installTooltipListeners();
  return true;
}

function bindTooltips(root: BindRoot = document) {
  queryAll<HTMLElement>(root, TOOLTIP_SELECTOR).forEach(bindTooltip);
}

function installTooltipListeners() {
  if (listenersInstalled || typeof document === "undefined") return;
  listenersInstalled = true;
  document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") hideTooltip();
  });
  window.addEventListener("resize", () => {
      if (tooltipState.shown && tooltipState.openTrigger && tooltipState.layer) {
        placeTooltip(tooltipState.openTrigger, tooltipState.layer);
      }
  });
}

function setTooltipText(trigger: HTMLElement | null, text: string) {
  if (!(trigger instanceof HTMLElement)) return false;
  tooltipTexts.set(trigger, String(text || "").trim());
  if (tooltipState.openTrigger === trigger && tooltipState.layer) {
    tooltipState.layer.textContent = tooltipTexts.get(trigger) || "";
    placeTooltip(trigger, tooltipState.layer);
  }
  return true;
}

export {
  TOOLTIP_LAYER_ID,
  TOOLTIP_SELECTOR,
  bindTooltip,
  bindTooltips,
  hideTooltip,
  setTooltipText,
  showTooltip,
};
