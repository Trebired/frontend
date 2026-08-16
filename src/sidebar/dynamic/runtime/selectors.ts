import { frontendDataSelector } from "#5vbaqj4pirp3";

const DYNAMIC_SIDEBAR_LIVE_SELECTOR = frontendDataSelector("sidebar-dynamic-live");
const DYNAMIC_SIDEBAR_LIVE_CONFIG_SELECTOR =
`script[type="application/json"]${frontendDataSelector("sidebar-dynamic-live-config")}`;
const DYNAMIC_SIDEBAR_COUNT_SLOT_SELECTOR = frontendDataSelector("sidebar-count-slot");
const DYNAMIC_SIDEBAR_LOADER_SLOT_SELECTOR = frontendDataSelector("sidebar-loader-slot");
const DYNAMIC_SIDEBAR_STATE_SLOT_SELECTOR = frontendDataSelector("sidebar-state-slot");
const DYNAMIC_SIDEBAR_DYNAMIC_LINK_SELECTOR =
`a${frontendDataSelector("sidebar-link-dynamic", "1")}`;
const DYNAMIC_SIDEBAR_DISABLED_LINK_SELECTOR =
`a${frontendDataSelector("sidebar-link-disabled", "1")}`;

export {
  DYNAMIC_SIDEBAR_COUNT_SLOT_SELECTOR,
  DYNAMIC_SIDEBAR_DISABLED_LINK_SELECTOR,
  DYNAMIC_SIDEBAR_DYNAMIC_LINK_SELECTOR,
  DYNAMIC_SIDEBAR_LIVE_CONFIG_SELECTOR,
  DYNAMIC_SIDEBAR_LIVE_SELECTOR,
  DYNAMIC_SIDEBAR_LOADER_SLOT_SELECTOR,
  DYNAMIC_SIDEBAR_STATE_SLOT_SELECTOR,
};
