import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { softReload } from "./router.js";
import { disconnectLiveSubscriptionHost } from "./subscriptions.js";
import type { LiveSocketPayload } from "./socket.js";
import { frontendEventName } from "#5vbaqj4pirp3";

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
let liveListsDisposeBound = false;

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
  return true;
}

function disconnectLiveListHost(host: HTMLElement) {
  return disconnectLiveSubscriptionHost(host, {
      bound: boundLiveLists,
      cleanups: liveListCleanups,
  });
}

function disconnectLiveListsWithin(root: ParentNode | null) {
  liveListHostsWithin(root).forEach(disconnectLiveListHost);
}

function liveListHostsWithin(root: ParentNode | null) {
  if (!root || typeof root.querySelectorAll !== "function") return [];
  const hosts = Array.from(root.querySelectorAll<HTMLElement>(LIVE_LIST_SELECTOR));
  if (root instanceof HTMLElement && root.matches(LIVE_LIST_SELECTOR)) {
    hosts.unshift(root);
  }
  return hosts;
}

function bindLiveListsDispose() {
  if (liveListsDisposeBound || typeof document === "undefined") return;
  liveListsDisposeBound = true;
  document.addEventListener(frontendEventName("live-page-dispose"), (event) => {
      const root = (event as CustomEvent<{root?:unknown}>).detail?.root;
      disconnectLiveListsWithin(root instanceof HTMLElement ? root : null);
  });
}

function bindLiveLists(root: BindRoot = document, options: LiveListsOptions = {}) {
  bindLiveListsDispose();
  queryAll<HTMLElement>(root, LIVE_LIST_SELECTOR).forEach((host) => {
      bindLiveListHost(host, options);
  });
}

export {
  LIVE_LIST_SELECTOR,
  bindLiveListHost,
  bindLiveLists,
  disconnectLiveListHost,
  disconnectLiveListsWithin,
};
export type { LiveListsOptions };
