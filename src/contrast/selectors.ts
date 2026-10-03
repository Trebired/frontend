import { FRONTEND_PREFIX, frontendClassName, frontendDataAttr, frontendDataSelector, frontendElementClass } from "#5vbaqj4pirp3";

const CONTRAST_ATTR = frontendDataAttr("contrast");
const CONTRAST_SELECTOR = frontendDataSelector("contrast");
const MIRROR_ATTR = frontendDataAttr("contrast-mirror");
const MIRROR_SELECTOR = frontendDataSelector("contrast-mirror");
const ON_DARK_ATTR = frontendDataAttr("on-dark");
const SURFACE_ATTR = frontendDataAttr("contrast-surface");
const SETTLING_ATTR = frontendDataAttr("contrast-settling");
const SURFACE_SELECTOR = frontendDataSelector("contrast-surface");
const SEED_ATTR = frontendDataAttr("contrast-seed");
const SEED_STORAGE_PREFIX = `${FRONTEND_PREFIX}:contrast:`;
const DARK_BELOW = 0.5;
const OPAQUE_ABOVE = 0.5;

function headerPart(part: string): string {
  return `.${frontendElementClass("site-header", part)}`;
}

function cls(name: string): string {
  return `.${frontendClassName(name)}`;
}

const DEFAULT_ITEMS = [
  `${headerPart("bar")} ${headerPart("link")}`,
  `${headerPart("bar")} ${cls("site-header-brand-button")}`,
  `${headerPart("actions")} ${cls("locale-trigger")}`,
  `${headerPart("actions")} ${cls("btn")}`,
  headerPart("toggle"),
  `${headerPart("menu")} ${headerPart("link")}`,
  `${headerPart("menu-footer")} ${cls("locale-trigger")}`,
  `${headerPart("menu-footer")} ${cls("btn")}`,
  headerPart("brand"),
  headerPart("menu"),
  cls("popover"),
  `.${frontendElementClass("dropdown", "menu")}`,
].join(",");

const BAR_SAMPLE = `${headerPart("bar")} ${cls("site-header-brand-button")},${headerPart("toggle")}`;

const DEFAULT_SURFACES = [cls("site-footer")].join(",");

const DEFAULT_MIRRORS: Array<[string, string]> = [];

export {
  BAR_SAMPLE,
  CONTRAST_ATTR,
  CONTRAST_SELECTOR,
  DARK_BELOW,
  DEFAULT_ITEMS,
  DEFAULT_MIRRORS,
  DEFAULT_SURFACES,
  MIRROR_ATTR,
  MIRROR_SELECTOR,
  ON_DARK_ATTR,
  OPAQUE_ABOVE,
  SEED_ATTR,
  SEED_STORAGE_PREFIX,
  SETTLING_ATTR,
  SURFACE_ATTR,
  SURFACE_SELECTOR,
};
