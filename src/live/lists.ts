import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { softReload } from "./router.js";
import type { LiveSocketPayload } from "./socket.js";

type LiveListsOptions = {
  reload?: () => unknown;
  subscribe?: (
    room: string,
    onChange: (payload: LiveSocketPayload) => void,
  ) => () => void;
};

const LIVE_LIST_SELECTOR = "live-list[data-live-list-room]";
const boundLiveLists = new WeakSet<HTMLElement>();

function bindLiveListHost(host: HTMLElement, options: LiveListsOptions = {}) {
  if (boundLiveLists.has(host)) return false;
  const subscribe = options.subscribe;
  if (typeof subscribe !== "function") return false;
  const room = host.getAttribute("data-live-list-room") || "";
  if (!room) return false;
  const expectedEvent = host.getAttribute("data-live-list-event") || "";
  boundLiveLists.add(host);
  subscribe(room, (payload) => {
      const event = typeof payload.event === "string" ? payload.event : "";
      if (expectedEvent && event && event !== expectedEvent) return;
      void(options.reload || softReload)();
  });
  return true;
}

function bindLiveLists(root: BindRoot = document, options: LiveListsOptions = {}) {
  queryAll<HTMLElement>(root, LIVE_LIST_SELECTOR).forEach((host) => {
      bindLiveListHost(host, options);
  });
}

export { LIVE_LIST_SELECTOR, bindLiveListHost, bindLiveLists };
export type { LiveListsOptions };
