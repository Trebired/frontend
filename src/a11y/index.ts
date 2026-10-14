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
} from "./attributes.js";
export { ANNOUNCER_ATTR, announce, announcerElement } from "./announce.js";
export { ensureSkipTarget } from "./skip.js";
export { a11yBootSource, createA11yBootScript } from "./boot.js";
export { configureFrontendA11y, getFrontendA11y } from "./config.js";
export type { FrontendA11yRuntimeConfig } from "./config.js";
export { bindA11yControls, syncA11yControls } from "./controls.js";
export { bindA11yRuntime } from "./runtime.js";
export type { A11yRuntimeOptions } from "./runtime.js";
export {
  applyA11ySettings,
  configureA11yDefaults,
  getA11ySettings,
  registerA11ySync,
  resolveA11ySettings,
  setA11ySettings,
} from "./apply.js";
export { A11Y_COOKIE_NAME, A11Y_STORAGE_KEY } from "./storage.js";
export {
  contrastRatio,
  LARGE_TEXT_RATIO,
  meetsContrast,
  NON_TEXT_RATIO,
  parseColor,
  relativeLuminance,
  TEXT_RATIO,
} from "./ratio.js";
export {
  CONTRAST_VALUES,
  EMPTY_A11Y_SETTINGS,
  mergeA11ySettings,
  MOTION_VALUES,
  normalizeA11ySettings,
  TEXT_SIZES,
} from "./settings.js";
export type {
  A11yContrastPreference,
  A11yMotionPreference,
  A11yTextSize,
  FrontendA11ySettings,
  ResolvedFrontendA11ySettings,
} from "./types.js";
