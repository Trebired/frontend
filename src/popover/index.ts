import {
  clampNumber,
  cssEscape,
  queryAll,
  setAriaExpanded,
  type BindRoot,
} from "#er0dlx1gtbzh";
import {
  moveLayerElementToTop,
  portalElement,
  promoteZIndex,
} from "#ccvonx3uhbte";

const POPOVER_BASE_Z_INDEX = 1040;
const POPOVER_TRIGGER_SELECTOR = "[data-tbf-popover-trigger][aria-controls]";
const POPOVER_CLOSE_SELECTOR = "[data-tbf-popover-close]";

type PopoverEntry = {
  hover: boolean;
  popover: HTMLElement;
  trigger: HTMLElement;
};

const entries = new Map<HTMLElement, PopoverEntry>();
const cleanups = new WeakMap<HTMLElement, ()=>void>();
let openEntry: PopoverEntry | null = null;
let listenersInstalled = false;

function findPopoverTarget(root: BindRoot, id: string) {
  const scoped = root.querySelector(`#${cssEscape(id)}`);
  if (scoped instanceof HTMLElement) return scoped;
  const global = document.getElementById(id);
  return global instanceof HTMLElement ? global : null;
}

function placePopover(trigger: HTMLElement, popover: HTMLElement) {
  const anchor = trigger.getBoundingClientRect();
  const rect = popover.getBoundingClientRect();
  const gap = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const below = anchor.bottom + gap + rect.height <= vh;
  const top = below
  ? anchor.bottom + gap
  : clampNumber(anchor.top - gap - rect.height, gap, vh - rect.height - gap);
  const left = clampNumber(
    anchor.left + anchor.width / 2 - rect.width / 2,
    gap,
    vw - rect.width - gap,
  );
  popover.style.top = `${top}px`;
  popover.style.left = `${left}px`;
  popover.setAttribute("data-tbf-position", below ? "below" : "above");
}

function setPopoverExpanded(entry: PopoverEntry, open: boolean) {
  setAriaExpanded(entry.trigger, open);
  if (open) {
    entry.popover.removeAttribute("inert");
    entry.trigger.setAttribute("data-tbf-popover-open", "true");
  } else {
    entry.popover.setAttribute("inert", "");
    entry.trigger.removeAttribute("data-tbf-popover-open");
  }
  entry.popover.setAttribute("aria-hidden", open ? "false" : "true");
}

function showPopover(entry: PopoverEntry) {
  if (openEntry && openEntry !== entry) hidePopover(openEntry.popover);
  portalElement(entry.popover);
  moveLayerElementToTop(entry.popover);
  promoteZIndex(entry.popover, { fallback: POPOVER_BASE_Z_INDEX });
  entry.popover.setAttribute("data-tbf-popover", "");
  placePopover(entry.trigger, entry.popover);
  entry.popover.setAttribute("data-tbf-open", "true");
  setPopoverExpanded(entry, true);
  openEntry = entry;
}

function hidePopover(popoverOrTrigger?: HTMLElement | null) {
  const entry = popoverOrTrigger
  ? entries.get(popoverOrTrigger) ||
    Array.from(entries.values()).find((item) => item.popover === popoverOrTrigger)
  : openEntry;
  if (!entry) return false;
  entry.popover.removeAttribute("data-tbf-open");
  releasePopoverFocus(entry);
  setPopoverExpanded(entry, false);
  if (openEntry === entry) openEntry = null;
  return true;
}

function releasePopoverFocus(entry: PopoverEntry): void {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement) || !entry.popover.contains(active)) return;
  if (entry.trigger.isConnected) {
    entry.trigger.focus({ preventScroll: true });
    return;
  }
  active.blur();
}

function togglePopover(entry: PopoverEntry) {
  if (openEntry === entry) hidePopover(entry.popover);
  else showPopover(entry);
}

function bindPopoverClose(entry: PopoverEntry) {
  const onClick = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    const close = target?.closest(POPOVER_CLOSE_SELECTOR);
    if (close && entry.popover.contains(close)) hidePopover(entry.popover);
  };
  entry.popover.addEventListener("click", onClick);
  return () => entry.popover.removeEventListener("click", onClick);
}

function bindPopoverTrigger(trigger: HTMLElement | null, root: BindRoot = document) {
  if (!(trigger instanceof HTMLElement)) return null;
  const id = String(trigger.getAttribute("aria-controls") || "").trim();
  const popover = id ? findPopoverTarget(root, id) : null;
  if (!(popover instanceof HTMLElement)) return null;
  const existing = entries.get(trigger);
  if (existing?.popover === popover) return existing;
  cleanups.get(trigger)?.();
  const entry = {
    hover: trigger.getAttribute("data-tbf-popover-hover") === "true",
    popover,
    trigger,
  };
  popover.setAttribute("data-tbf-popover", "");
  setPopoverExpanded(entry, false);
  const onClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    togglePopover(entry);
  };
  trigger.addEventListener("click", onClick);
  const closeCleanup = bindPopoverClose(entry);
  cleanups.set(trigger, () => {
      trigger.removeEventListener("click", onClick);
      closeCleanup();
  });
  entries.set(trigger, entry);
  installPopoverListeners();
  return entry;
}

function bindPopovers(root: BindRoot = document) {
  queryAll<HTMLElement>(root, POPOVER_TRIGGER_SELECTOR).forEach((trigger) => {
      bindPopoverTrigger(trigger, root);
  });
}

function installPopoverListeners() {
  if (listenersInstalled) return;
  listenersInstalled = true;
  document.addEventListener("click", (event) => {
      const target = event.target instanceof Node ? event.target : null;
      if (!openEntry || !target) return;
      if (openEntry.popover.contains(target) || openEntry.trigger.contains(target)) return;
      hidePopover();
  });
  document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") hidePopover();
  });
  window.addEventListener("resize", () => {
      if (openEntry) placePopover(openEntry.trigger, openEntry.popover);
  });
}

export {
  POPOVER_CLOSE_SELECTOR,
  POPOVER_TRIGGER_SELECTOR,
  bindPopoverTrigger,
  bindPopovers,
  hidePopover,
  showPopover,
  togglePopover,
};
export type { PopoverEntry };
