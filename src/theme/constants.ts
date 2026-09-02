import { FRONTEND_PREFIX, frontendCssVar, frontendDataAttr, frontendDataSelector, frontendEventName } from "#5vbaqj4pirp3";

const THEME_ATTR = frontendDataAttr("theme");
const THEME_BOUND_ATTR = frontendDataAttr("theme-bound");
const THEME_CURRENT_ATTR = frontendDataAttr("theme-current");
const THEME_VALUE_ATTR = frontendDataAttr("theme-value");
const THEME_CHANGE_EVENT = frontendEventName("themechange");
const THEME_DEFAULT_CSS_VAR = frontendCssVar("theme-default");
const THEME_MODES_CSS_VAR = frontendCssVar("theme-modes");
const THEME_MODES_GLOBAL_KEY = `${FRONTEND_PREFIX}.frontend.theme.modes`;
const THEME_TOGGLE_SELECTOR = frontendDataSelector("theme-button");
const THEME_SELECT_SELECTOR = frontendDataSelector("theme-select");
const THEME_SWITCHING_ATTR = frontendDataAttr("theme-switching");
const THEME_OPTION_SELECTOR = frontendDataSelector("theme-value");
const THEME_LABEL_SELECTOR = frontendDataSelector("theme-label");

export {
  THEME_ATTR,
  THEME_BOUND_ATTR,
  THEME_CHANGE_EVENT,
  THEME_CURRENT_ATTR,
  THEME_DEFAULT_CSS_VAR,
  THEME_LABEL_SELECTOR,
  THEME_MODES_CSS_VAR,
  THEME_MODES_GLOBAL_KEY,
  THEME_OPTION_SELECTOR,
  THEME_SELECT_SELECTOR,
  THEME_SWITCHING_ATTR,
  THEME_TOGGLE_SELECTOR,
  THEME_VALUE_ATTR,
};
