import { frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";
import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { disconnectLiveSubscriptionHost } from "#md3hr77wyofd";
import { refreshElements, registerPageCleanup } from "#o9lroe7t0ma6";
import { defaultLiveSubscribe, type LiveSubscribe } from "./subscribe.js";

type LiveRegionsOptions = {
  subscribe?: LiveSubscribe;
};

const LIVE_REGION_ROOM_SELECTOR = `${frontendDataSelector("live-region")}${frontendDataSelector("live-room")}`;
const boundLiveRegions = new WeakSet<HTMLElement>();
const liveRegionCleanups = new WeakMap<HTMLElement, ()=>void>();

function regionEvents(host: HTMLElement) {
  return String(host.getAttribute(frontendDataAttr("live-event")) || "")
  .split(",")
  .map((event) => event.trim())
  .filter(Boolean);
}

function disconnectLiveRegionHost(host: HTMLElement) {
  return disconnectLiveSubscriptionHost(host, {
      bound: boundLiveRegions,
      cleanups: liveRegionCleanups,
  });
}

function bindLiveRegionHost(host: HTMLElement, options: LiveRegionsOptions = {}) {
  if (boundLiveRegions.has(host)) return false;
  const subscribe = options.subscribe || defaultLiveSubscribe;
  const channel = String(host.getAttribute(frontendDataAttr("live-channel")) || "").trim();
  const room = String(host.getAttribute(frontendDataAttr("live-room")) || "").trim();
  if (!channel || !room) return false;
  boundLiveRegions.add(host);
  const events = regionEvents(host);
  const cleanup = subscribe(channel, room, (payload) => {
      if (!host.isConnected) {
        disconnectLiveRegionHost(host);
        return;
      }
      const event = typeof payload.event === "string" ? payload.event : "";
      if (event === "snapshot" || (events.length && event && !events.includes(event))) return;
      refreshElements([host]);
  });
  if (typeof cleanup === "function") liveRegionCleanups.set(host, cleanup);
  registerPageCleanup(host, () => disconnectLiveRegionHost(host));
  return true;
}

function bindLiveRegions(root: BindRoot = document, options: LiveRegionsOptions = {}) {
  queryAll<HTMLElement>(root, LIVE_REGION_ROOM_SELECTOR).forEach((host) => {
      bindLiveRegionHost(host, options);
  });
}

export { LIVE_REGION_ROOM_SELECTOR, bindLiveRegions };
export type { LiveRegionsOptions };
