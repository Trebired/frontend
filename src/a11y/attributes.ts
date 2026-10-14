import { frontendDataAttr, frontendDataSelector, frontendEventName, frontendToken } from "./../namespace/index.js";

const A11Y_MOTION_PREF_ATTR = frontendDataAttr("motion-pref");

const A11Y_REDUCE_MOTION_ATTR = frontendDataAttr("reduce-motion");

const A11Y_TEXT_SIZE_ATTR = frontendDataAttr("text-size");

const A11Y_HIGH_CONTRAST_ATTR = frontendDataAttr("high-contrast");

const A11Y_CONFIG_ATTR = frontendDataAttr("a11y-config");

const A11Y_BOUND_ATTR = frontendDataAttr("a11y-bound");

const A11Y_FIELD_ATTR = frontendDataAttr("a11y-field");

const A11Y_PANEL_SELECTOR = frontendDataSelector("a11y-panel");

const A11Y_STATUS_SELECTOR = frontendDataSelector("a11y-status");

const A11Y_CHANGE_EVENT = frontendEventName("a11ychange");

const A11Y_MAIN_ID = frontendToken("main-content");

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function readReduceMotionAttribute(doc?: Document | null): string {
  const owner = doc || (typeof document === "undefined" ? null : document);
  if (!owner) return "";
  return owner.documentElement.getAttribute(A11Y_REDUCE_MOTION_ATTR) || "";
}

function systemPrefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function motionReduced(doc?: Document | null): boolean {
  const attribute = readReduceMotionAttribute(doc);
  if (attribute === "on") return true;
  if (attribute === "off") return false;
  return systemPrefersReducedMotion();
}

export {
  A11Y_BOUND_ATTR,
  A11Y_CHANGE_EVENT,
  A11Y_CONFIG_ATTR,
  A11Y_FIELD_ATTR,
  A11Y_HIGH_CONTRAST_ATTR,
  A11Y_MAIN_ID,
  A11Y_MOTION_PREF_ATTR,
  A11Y_PANEL_SELECTOR,
  A11Y_REDUCE_MOTION_ATTR,
  A11Y_STATUS_SELECTOR,
  A11Y_TEXT_SIZE_ATTR,
  motionReduced,
  readReduceMotionAttribute,
  REDUCED_MOTION_QUERY,
  systemPrefersReducedMotion,
};
