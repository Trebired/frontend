const DEFAULT_SIDEBAR_COOKIE_PREFIX = "sidebar_";
const DEFAULT_SIDEBAR_COOKIE_SUFFIX = "_minimized";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function defaultSidebarCookieName(side: string) {
  return `${DEFAULT_SIDEBAR_COOKIE_PREFIX}${side}${DEFAULT_SIDEBAR_COOKIE_SUFFIX}`;
}

export {
  DEFAULT_SIDEBAR_COOKIE_PREFIX,
  DEFAULT_SIDEBAR_COOKIE_SUFFIX,
  SIDEBAR_COOKIE_MAX_AGE,
  defaultSidebarCookieName,
};
