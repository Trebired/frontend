import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { disconnectLiveSubscriptionHost } from "#70l5p0ml3pgq";
import { softReload } from "#o9lroe7t0ma6";
import type { LiveSocketPayload } from "#6ltyw193gvyw";
import { registerPageCleanup } from "#o9lroe7t0ma6";

type LiveListsOptions = {
  reload?: () => unknown;
  subscribe?: (
    room: string,
    onChange: (payload: LiveSocketPayload) => void,
  ) => () => void;
};

const LIVE_LIST_SELECTOR = "live-list[data-live-list-room]";
const boundLiveLists = new WeakSet<HTMLElement>();
const liveListCleanups = new WeakMap<HTMLElement, ()=>void>();

function bindLiveListHost(host: HTMLElement, options: LiveListsOptions = {}) {
  if (boundLiveLists.has(host)) return false;
  const subscribe = options.subscribe;
  if (typeof subscribe !== "function") return false;
  const room = host.getAttribute("data-live-list-room") || "";
  if (!room) return false;
  const expectedEvent = host.getAttribute("data-live-list-event") || "";
  boundLiveLists.add(host);
  const cleanup = subscribe(room, (payload) => {
      if (!host.isConnected) {
        disconnectLiveListHost(host);
        return;
      }
      const event = typeof payload.event === "string" ? payload.event : "";
      if (expectedEvent && event && event !== expectedEvent) return;
      void(options.reload || softReload)();
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
