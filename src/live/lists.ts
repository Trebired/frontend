import { frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";
import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { disconnectLiveSubscriptionHost } from "#md3hr77wyofd";
import { refreshElements, softReload } from "#o9lroe7t0ma6";
import { registerPageCleanup } from "#o9lroe7t0ma6";
import { defaultLiveSubscribe, type LiveSubscribe } from "./subscribe.js";

type LiveListsOptions = {
  reload?: () => unknown;
  subscribe?: LiveSubscribe;
};

const LIVE_LIST_SELECTOR = `live-list${frontendDataSelector("live-list-room")}`;
const boundLiveLists = new WeakSet<HTMLElement>();
const liveListCleanups = new WeakMap<HTMLElement, ()=>void>();

function bindLiveListHost(host: HTMLElement, options: LiveListsOptions = {}) {
  if (boundLiveLists.has(host)) return false;
  const subscribe = options.subscribe || defaultLiveSubscribe;
  const channel = host.getAttribute(frontendDataAttr("live-list-channel")) || "";
  const room = host.getAttribute(frontendDataAttr("live-list-room")) || "";
  if (!channel || !room) return false;
  const expectedEvent = host.getAttribute(frontendDataAttr("live-list-event")) || "";
  boundLiveLists.add(host);
  const cleanup = subscribe(channel, room, (payload) => {
      if (!host.isConnected) {
        disconnectLiveListHost(host);
        return;
      }
      const event = typeof payload.event === "string" ? payload.event : "";
      if (expectedEvent && event && event !== expectedEvent) return;
      const anchorId = host.getAttribute(frontendDataAttr("live-list-anchor")) || "";
      const anchor = anchorId ? document.getElementById(anchorId) : null;
      if (options.reload) void options.reload();
      else if (anchor) refreshElements([anchor]);
      else void softReload();
  });
  if (typeof cleanup === "function") liveListCleanups.set(host, cleanup);
  registerPageCleanup(host, () => disconnectLiveListHost(host));
  return true;
}

function disconnectLiveListHost(host: HTMLElement) {
  return disconnectLiveSubscriptionHost(host, {
      bound: boundLiveLists,
      cleanups: liveListCleanups,
  });
}

function bindLiveLists(root: BindRoot = document, options: LiveListsOptions = {}) {
  queryAll<HTMLElement>(root, LIVE_LIST_SELECTOR).forEach((host) => {
      bindLiveListHost(host, options);
  });
}

export { LIVE_LIST_SELECTOR, bindLiveLists };
export type { LiveListsOptions };
