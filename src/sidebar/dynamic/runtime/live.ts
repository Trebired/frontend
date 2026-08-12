import {
  queryAll,
  readElementJson,
  type BindRoot,
} from "#er0dlx1gtbzh";
import { applyDynamicSidebarCounts } from "./apply.js";
import {
  bindDynamicSidebarDisabledLinkGuard,
} from "./guards.js";
import { liveRootContent } from "./dom.js";
import {
  DYNAMIC_SIDEBAR_LIVE_CONFIG_SELECTOR,
  DYNAMIC_SIDEBAR_LIVE_SELECTOR,
} from "./selectors.js";
import type {
  DynamicSidebarCleanup,
  DynamicSidebarLiveOptions,
} from "./types.js";
import type {
  DynamicSidebarDescriptor,
  DynamicSidebarLiveConfig,
  DynamicSidebarResponseItem,
} from "#9w9ch5jtlv9e";
import { textValue } from "#yv4ubgils4dc";

const liveRoots = new Set<HTMLElement>();
const liveConfigs = new WeakMap<HTMLElement, DynamicSidebarLiveConfig>();
let liveOptions: DynamicSidebarLiveOptions = {};
let unsubscribeRooms: DynamicSidebarCleanup[] = [];
let refreshTimer = 0;
let refreshInFlight = false;
let refreshQueued = false;

function mergeLiveOptions(options?: DynamicSidebarLiveOptions) {
  if (!options) return liveOptions;
  liveOptions = {
    ...liveOptions,
    ...options,
    renderers: {
      ...(liveOptions.renderers || {}),
      ...(options.renderers || {}),
    },
  };
  return liveOptions;
}

function visibleLiveRoots() {
  return Array.from(liveRoots).filter((node) => node.isConnected);
}

function descriptorKeyFromConfig(config: DynamicSidebarLiveConfig) {
  const side = textValue(config.side, "left");
  const type = textValue(config.type);
  const path = textValue(config.path);
  const params = JSON.stringify(
    config.params && typeof config.params === "object" ? config.params : {},
  );
  return `${side}:${type}:${path}:${params}`;
}

function descriptorFromRoot(root: HTMLElement): DynamicSidebarDescriptor | null {
  const config = liveConfigs.get(root) || {};
  const type = textValue(config.type);
  const path = textValue(config.path);
  if (!type ||!path) return null;
  return {
    key: descriptorKeyFromConfig(config),
    params: config.params && typeof config.params === "object" ? config.params : {},
    path,
    rooms: Array.isArray(config.rooms)
    ? config.rooms.map((item) => textValue(item)).filter(Boolean)
    : [],
    side: textValue(config.side, "left"),
    type,
  };
}

function collectDynamicSidebarDescriptors() {
  const out: DynamicSidebarDescriptor[] = [];
  const seen = new Set<string>();
  for (const root of visibleLiveRoots()) {
    const descriptor = descriptorFromRoot(root);
    if (!descriptor || seen.has(descriptor.key)) continue;
    seen.add(descriptor.key);
    out.push(descriptor);
  }
  return out;
}

function collectDynamicSidebarRooms() {
  const rooms: string[] = [];
  const seen = new Set<string>();
  for (const descriptor of collectDynamicSidebarDescriptors()) {
    for (const room of descriptor.rooms) {
      if (!room || seen.has(room)) continue;
      seen.add(room);
      rooms.push(room);
    }
  }
  return rooms;
}

async function requestDynamicSidebarCounts() {
  const descriptors = collectDynamicSidebarDescriptors();
  if (!descriptors.length || typeof liveOptions.request !== "function") return [];
  return await liveOptions.request(descriptors);
}

function applyDynamicSidebarResponse(itemsInput: unknown) {
  const items = Array.isArray(itemsInput) ? itemsInput : [];
  const countsByKey = new Map<string, unknown>();
  items.forEach((itemInput) => {
      const item = itemInput && typeof itemInput === "object"
      ? itemInput as DynamicSidebarResponseItem
      : null;
      const key = textValue(item?.key);
      if (!key || item?.resolved !== true) return;
      countsByKey.set(key, item.entity_counts || {});
  });
  for (const root of visibleLiveRoots()) {
    const key = descriptorKeyFromConfig(liveConfigs.get(root) || {});
    if (!countsByKey.has(key)) continue;
    applyDynamicSidebarCounts(root, countsByKey.get(key) || {}, liveOptions.renderers || {});
  }
}

async function refreshDynamicSidebarLive() {
  if (refreshInFlight) {
    refreshQueued = true;
    return;
  }
  refreshInFlight = true;
  try {
    const items = await requestDynamicSidebarCounts();
    if (items != null) applyDynamicSidebarResponse(items);
  } finally {
    refreshInFlight = false;
    if (!refreshQueued) return;
    refreshQueued = false;
    scheduleDynamicSidebarRefresh(liveOptions.refreshDelayMs || 120);
  }
}

function scheduleDynamicSidebarRefresh(delayMs = liveOptions.refreshDelayMs || 120) {
  if (refreshTimer) window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
      refreshTimer = 0;
      void refreshDynamicSidebarLive();
    }, Math.max(0, delayMs));
}

function syncDynamicSidebarRooms() {
  unsubscribeRooms.forEach((unsubscribe) => unsubscribe());
  unsubscribeRooms = [];
  if (typeof liveOptions.subscribe !== "function") return;
  const eventName = liveOptions.event || "sidebar";
  unsubscribeRooms = collectDynamicSidebarRooms()
  .map((room) => liveOptions.subscribe?.(room, (payload) => {
        if (payload && typeof payload === "object" && "event"in payload &&
            textValue((payload as { event?: unknown }).event) !== eventName) return;
        scheduleDynamicSidebarRefresh(liveOptions.refreshDelayMs || 120);
  }))
  .filter((cleanup): cleanup is DynamicSidebarCleanup => {
      return typeof cleanup === "function";
  });
}

function bindDynamicSidebarLiveHost(host: HTMLElement) {
  const root = liveRootContent(host) || host;
  if (!(root instanceof HTMLElement)) return null;
  liveRoots.add(root);
  liveConfigs.set(
    root,
    readElementJson<DynamicSidebarLiveConfig>(
      host,
      DYNAMIC_SIDEBAR_LIVE_CONFIG_SELECTOR,
      {},
    ),
  );
  bindDynamicSidebarDisabledLinkGuard(root);
  syncDynamicSidebarRooms();
  scheduleDynamicSidebarRefresh(0);
  return root;
}

function bindDynamicSidebarLive(
  root: BindRoot = document,
  options?: DynamicSidebarLiveOptions,
) {
  mergeLiveOptions(options);
  queryAll<HTMLElement>(root, DYNAMIC_SIDEBAR_LIVE_SELECTOR)
  .forEach(bindDynamicSidebarLiveHost);
}

export {
  applyDynamicSidebarResponse,
  bindDynamicSidebarLive,
  bindDynamicSidebarLiveHost,
  collectDynamicSidebarDescriptors,
  collectDynamicSidebarRooms,
  refreshDynamicSidebarLive,
  requestDynamicSidebarCounts,
  scheduleDynamicSidebarRefresh,
};
