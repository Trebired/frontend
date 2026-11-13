import { frontendCssVar, frontendDataAttr, frontendEventName } from "#5vbaqj4pirp3";

type HighlightOptions = {
  duration?: number;
  scroll?: boolean;
};

type ActiveHighlight = {
  frame: number;
  ring: HTMLElement;
  timer: ReturnType<typeof setTimeout>;
};

const HIGHLIGHT_ATTR = frontendDataAttr("highlight");
const HIGHLIGHT_RING_ATTR = frontendDataAttr("highlight-ring");
const HIGHLIGHT_DURATION_VAR = frontendCssVar("highlight-duration");
const HIGHLIGHT_QUEUE_KEY = "tbf.highlight.pending";
const DEFAULT_DURATION_MS = 1600;
const QUEUE_MAX_AGE_MS = 20000;
const TARGET_WAIT_MS = 1500;
const TARGET_POLL_MS = 50;
const RING_GAP_PX = 4;
const VIEWPORT_MARGIN_PX = 24;

let active: ActiveHighlight | null = null;
let navigationListenerBound = false;

function normalizeHighlightId(value: unknown) {
  const id = typeof value === "string" ? value.trim() : "";
  return id && !/\s/u.test(id) ? id : "";
}

function highlightAttrs(id: unknown): Record<string, string> {
  const value = normalizeHighlightId(id);
  return value ? {[HIGHLIGHT_ATTR]: value } : {};
}

function highlightTargetOf(trigger: Element | null | undefined) {
  return trigger ? normalizeHighlightId(trigger.getAttribute(HIGHLIGHT_ATTR)) : "";
}

function prefersReducedMotion() {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clearHighlight() {
  if (!active) return;
  cancelAnimationFrame(active.frame);
  clearTimeout(active.timer);
  active.ring.remove();
  active = null;
}

function bindNavigationClear() {
  if (navigationListenerBound) return;
  navigationListenerBound = true;
  document.addEventListener(frontendEventName("live-navigation"), clearHighlight);
}

function isOutsideViewport(target: HTMLElement) {
  const rect = target.getBoundingClientRect();
  const height = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < VIEWPORT_MARGIN_PX || rect.bottom > height - VIEWPORT_MARGIN_PX;
}

function scrollToTarget(target: HTMLElement) {
  if (!isOutsideViewport(target)) return;
  target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
}

function ringRadius(target: HTMLElement) {
  const radius = Number.parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0;
  return `${radius + RING_GAP_PX}px`;
}

function placeRing(ring: HTMLElement, target: HTMLElement) {
  const rect = target.getBoundingClientRect();
  ring.style.top = `${rect.top - RING_GAP_PX}px`;
  ring.style.left = `${rect.left - RING_GAP_PX}px`;
  ring.style.width = `${rect.width + RING_GAP_PX * 2}px`;
  ring.style.height = `${rect.height + RING_GAP_PX * 2}px`;
}

function createRing(target: HTMLElement, duration: number) {
  const ring = document.createElement("div");
  ring.setAttribute(HIGHLIGHT_RING_ATTR, "");
  ring.setAttribute("aria-hidden", "true");
  ring.style.setProperty(HIGHLIGHT_DURATION_VAR, `${duration}ms`);
  ring.style.borderRadius = ringRadius(target);
  placeRing(ring, target);
  document.body.append(ring);
  return ring;
}

function followTarget(target: HTMLElement) {
  if (!active) return;
  if (!target.isConnected) {
    clearHighlight();
    return;
  }
  placeRing(active.ring, target);
  active.frame = requestAnimationFrame(() => followTarget(target));
}

function highlightElement(id: unknown, options: HighlightOptions = {}) {
  if (typeof document === "undefined") return false;
  const target = document.getElementById(normalizeHighlightId(id));
  if (!target) return false;
  clearHighlight();
  bindNavigationClear();
  if (options.scroll !== false) scrollToTarget(target);
  const duration = Math.max(200, Number(options.duration) || DEFAULT_DURATION_MS);
  const ring = createRing(target, duration);
  active = { frame: 0, ring, timer: setTimeout(clearHighlight, duration) };
  active.frame = requestAnimationFrame(() => followTarget(target));
  return true;
}

function highlightWhenPresent(id: unknown, options: HighlightOptions = {}) {
  const value = normalizeHighlightId(id);
  if (!value || typeof document === "undefined") return;
  const deadline = Date.now() + TARGET_WAIT_MS;
  const attempt = () => {
    if (highlightElement(value, options) || Date.now() > deadline) return;
    setTimeout(attempt, TARGET_POLL_MS);
  };
  requestAnimationFrame(() => requestAnimationFrame(attempt));
}

function routeOf(url: string) {
  try {
    const parsed = new URL(url, window.location.href);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return "";
  }
}

function queueHighlight(url: string, id: unknown) {
  const value = normalizeHighlightId(id);
  const route = routeOf(url);
  if (!value || !route) return;
  try {
    sessionStorage.setItem(HIGHLIGHT_QUEUE_KEY, JSON.stringify({ at: Date.now(), id: value, route }));
  } catch {}
}

function readQueuedHighlight() {
  try {
    const raw = sessionStorage.getItem(HIGHLIGHT_QUEUE_KEY);
    sessionStorage.removeItem(HIGHLIGHT_QUEUE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function applyQueuedHighlight() {
  if (typeof window === "undefined") return;
  const queued = readQueuedHighlight();
  if (!queued || Date.now() - Number(queued.at) > QUEUE_MAX_AGE_MS) return;
  const here = `${window.location.pathname}${window.location.search}`;
  if (queued.route !== here) return;
  highlightWhenPresent(queued.id);
}

export type { HighlightOptions };
export {
  HIGHLIGHT_ATTR,
  HIGHLIGHT_RING_ATTR,
  applyQueuedHighlight,
  clearHighlight,
  highlightAttrs,
  highlightElement,
  highlightTargetOf,
  highlightWhenPresent,
  queueHighlight,
};
