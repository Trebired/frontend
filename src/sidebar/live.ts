import { queryAll, type BindRoot } from "#er0dlx1gtbzh";

const SIDEBAR_LIVE_ROOT_SELECTOR = "[data-tbf-sidebar-live]";
const SIDEBAR_LIVE_SLOT_SELECTOR = "[data-tbf-sidebar-live-slot]";
const SIDEBAR_LIVE_EVENT = "tbf:sidebar-live";

type SidebarLiveSlotValue = {
  hidden?: boolean;
  state?: string;
  text?: string | number;
};

type SidebarLivePayload = {
  slots?: Record<string, SidebarLiveSlotValue>;
};

function normalizeLivePayload(value: unknown): SidebarLivePayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const payload = value as SidebarLivePayload;
  return payload.slots && typeof payload.slots === "object" ? payload : {};
}

function applySidebarLiveSlot(slot: HTMLElement, value: SidebarLiveSlotValue | undefined) {
  if (!value) return;
  if (value.text !== undefined) slot.textContent = String(value.text);
  if (value.state !== undefined) slot.setAttribute("data-tbf-sidebar-live-state", String(value.state));
  if (value.hidden !== undefined) slot.hidden = Boolean(value.hidden);
}

function applySidebarLivePayload(root: BindRoot, payload: SidebarLivePayload) {
  const slots = payload.slots || {};
  queryAll<HTMLElement>(root, SIDEBAR_LIVE_SLOT_SELECTOR).forEach((slot) => {
      const key = slot.getAttribute("data-tbf-sidebar-live-slot") || "";
      applySidebarLiveSlot(slot, slots[key]);
  });
}

async function refreshSidebarLive(root: HTMLElement) {
  const url = root.getAttribute("data-tbf-sidebar-live-url");
  if (!url || typeof fetch !== "function") return null;
  const response = await fetch(url, { credentials: "same-origin", headers: { Accept: "application/json" } });
  const payload = normalizeLivePayload(await response.json().catch (() => null));
  applySidebarLivePayload(root, payload);
  return payload;
}

function bindSidebarLiveRoot(root: HTMLElement | null) {
  if (!(root instanceof HTMLElement) || root.hasAttribute("data-tbf-sidebar-live-bound")) return null;
  root.setAttribute("data-tbf-sidebar-live-bound", "true");
  if (root.hasAttribute("data-tbf-sidebar-live-url")) void refreshSidebarLive(root);
  const interval = Number(root.getAttribute("data-tbf-sidebar-live-interval") || 0);
  if (interval > 0) window.setInterval(() => void refreshSidebarLive(root), interval);
  return root;
}

function handleSidebarLiveEvent(event: Event) {
  const custom = event as CustomEvent<unknown>;
  applySidebarLivePayload(document, normalizeLivePayload(custom.detail));
}

let sidebarLiveListenerInstalled = false;

function bindSidebarLiveSlots(root: BindRoot = document) {
  queryAll<HTMLElement>(root, SIDEBAR_LIVE_ROOT_SELECTOR).forEach(bindSidebarLiveRoot);
  if (!sidebarLiveListenerInstalled && typeof document !== "undefined") {
    sidebarLiveListenerInstalled = true;
    document.addEventListener(SIDEBAR_LIVE_EVENT, handleSidebarLiveEvent);
  }
}

export {
  SIDEBAR_LIVE_EVENT,
  SIDEBAR_LIVE_ROOT_SELECTOR,
  SIDEBAR_LIVE_SLOT_SELECTOR,
  applySidebarLivePayload,
  applySidebarLiveSlot,
  bindSidebarLiveRoot,
  bindSidebarLiveSlots,
  refreshSidebarLive,
};
export type { SidebarLivePayload, SidebarLiveSlotValue };
