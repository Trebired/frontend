import { cssEscape, queryAll, type BindRoot } from "#er0dlx1gtbzh";

const LAYER_ROOT_ID = "tbf_layer_root";
const Z_INDEX_STEP = 10;
const resolvedZIndexElements = new Set<HTMLElement>();
let fullscreenListenerInstalled = false;

type ZIndexOptions = {
  ahead?: Element | number | string | null;
  behind?: Element | number | string | null;
  fallback?: number;
};

function ensureLayerRoot() {
  if (typeof document === "undefined") return null;
  const existing = document.getElementById(LAYER_ROOT_ID);
  const container = resolveLayerContainer();
  if (existing instanceof HTMLElement) {
    if (container && existing.parentNode !== container) container.appendChild(existing);
    installFullscreenLayerListener();
    return existing;
  }

  const root = document.createElement("div");
  root.id = LAYER_ROOT_ID;
  root.className = "tbf-layer-root";
  root.setAttribute("data-tbf-layer-root", "");
  container?.appendChild(root);
  installFullscreenLayerListener();
  return root;
}

function resolveLayerContainer(): HTMLElement | null {
  const fullscreen = document.fullscreenElement;
  if (fullscreen instanceof HTMLElement) return fullscreen;
  return document.body || document.documentElement;
}

function installFullscreenLayerListener(): void {
  if (fullscreenListenerInstalled || typeof document === "undefined") return;
  fullscreenListenerInstalled = true;
  document.addEventListener("fullscreenchange", () => {
    const root = document.getElementById(LAYER_ROOT_ID);
    const container = resolveLayerContainer();
    if (root instanceof HTMLElement && container && root.parentNode !== container) {
      container.appendChild(root);
    }
  });
}

function portalElement(element: HTMLElement | null) {
  if (!element) return null;
  const root = ensureLayerRoot();
  if (!root || element === root) return root;
  if (element.parentNode !== root) root.appendChild(element);
  return root;
}

function moveLayerElementToTop(element: HTMLElement | null) {
  const root = portalElement(element);
  if (root && element && element.parentNode === root) root.appendChild(element);
  return root;
}

function parseNumber(value: unknown) {
  const parsed = Number.parseInt(String(value || "").trim(), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function stackZIndex(base = 0, depth = 0) {
  const safeBase = Number.isFinite(base) ? Number(base) : 0;
  const safeDepth = Number.isFinite(depth) ? Number(depth) : 0;
  return safeBase + safeDepth * Z_INDEX_STEP;
}

function readComputedZIndex(element: HTMLElement | null) {
  if (!element || typeof window === "undefined") return null;
  let raw = "";
  try {
    raw = window.getComputedStyle(element).zIndex;
  } catch {}
  if (!raw || raw === "auto") return null;
  return parseNumber(raw);
}

function resolveElementZIndex(element: HTMLElement | null, fallback = null) {
  if (!element) return fallback;
  const direct = readComputedZIndex(element);
  if (direct !== null) return direct;
  const attrValue = parseNumber(element.getAttribute("data-tbf-z-resolved"));
  return attrValue === null ? fallback : attrValue;
}

function findReferenceElement(value: unknown, current: HTMLElement | null) {
  const token = String(value || "").trim();
  if (!token || typeof document === "undefined") return null;
  if (/^(self|this)$/iu.test(token)) return current;
  if (token.startsWith("#")) return document.getElementById(token.slice(1));
  if (token.startsWith("[data-")) {
    try {
      const element = document.querySelector(token);
      return element instanceof HTMLElement ? element : null;
    } catch {
      return null;
    }
  }
  return document.getElementById(token);
}

function resolveReferenceValue(
  value: unknown,
  current: HTMLElement | null,
  fallback = null,
) {
  if (value instanceof HTMLElement) return resolveElementZIndex(value, fallback);
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const numeric = parseNumber(value);
  if (numeric !== null) return numeric;
  return resolveElementZIndex(findReferenceElement(value, current), fallback);
}

function resolveZIndexSpec(element: HTMLElement | null, options: ZIndexOptions = {}) {
  const fallback = Number.isFinite(options.fallback) ? Number(options.fallback) : 0;
  const behind = resolveReferenceValue(options.behind, element, fallback);
  if (behind !== null) return behind - Z_INDEX_STEP;
  const ahead = resolveReferenceValue(options.ahead, element, fallback);
  if (ahead !== null) return ahead + Z_INDEX_STEP;
  const rawSpec = String(element?.getAttribute("data-tbf-z") || "").trim();
  const direct = parseNumber(rawSpec);
  if (direct !== null) return direct;
  const reference = rawSpec ? resolveReferenceValue(rawSpec, element, fallback) : null;
  return reference !== null ? reference : fallback;
}

function applyZIndex(element: HTMLElement | null, options: ZIndexOptions = {}) {
  if (!element) return null;
  const value = resolveZIndexSpec(element, options);
  element.style.zIndex = String(value);
  element.setAttribute("data-tbf-z-resolved", String(value));
  resolvedZIndexElements.add(element);
  return value;
}

function highestResolvedZIndex(current: HTMLElement | null, fallback = null) {
  let max = fallback;
  for (const element of Array.from(resolvedZIndexElements)) {
    if (!element.isConnected) {
      resolvedZIndexElements.delete(element);
      continue;
    }
    if (current && (element === current || element.contains(current))) continue;
    const value = resolveElementZIndex(element, null);
    if (value !== null) max = max === null ? value : Math.max(max, value);
  }
  return max;
}

function promoteZIndex(element: HTMLElement | null, options: ZIndexOptions = {}) {
  if (!element) return null;
  const fallback = Number.isFinite(options.fallback) ? Number(options.fallback) : 0;
  const max = highestResolvedZIndex(element, fallback);
  const value = max === null ? fallback : Math.max(fallback, max + Z_INDEX_STEP);
  element.style.zIndex = String(value);
  element.setAttribute("data-tbf-z-resolved", String(value));
  resolvedZIndexElements.add(element);
  return value;
}

function clearZIndex(element: HTMLElement | null) {
  if (!element) return;
  element.style.removeProperty("z-index");
  element.removeAttribute("data-tbf-z-resolved");
  resolvedZIndexElements.delete(element);
}

function bindPortals(root: BindRoot = document) {
  queryAll<HTMLElement>(root, "[data-tbf-portal]").forEach((element) => {
    portalElement(element);
  });
}

function elementBySafeId(id: string) {
  return document.querySelector(`#${cssEscape(id)}`);
}

export {
  LAYER_ROOT_ID,
  Z_INDEX_STEP,
  applyZIndex,
  bindPortals,
  clearZIndex,
  elementBySafeId,
  ensureLayerRoot,
  moveLayerElementToTop,
  portalElement,
  promoteZIndex,
  resolveElementZIndex,
  resolveZIndexSpec,
  stackZIndex,
};
export type { ZIndexOptions };
