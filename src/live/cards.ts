import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { frontendDataAttr, frontendDataSelector, frontendEventName } from "#5vbaqj4pirp3";
import { disconnectLiveSubscriptionHost } from "#70l5p0ml3pgq";
import { registerPageCleanup } from "#o9lroe7t0ma6";
import type { LiveSubscribe } from "./subscribe.js";

type LiveCleanup = () => void;
type LiveCardsOptions = {
  bind?: (root: BindRoot) => void;
  event?: string;
  room?: (host: HTMLElement) => string;
  subscribe?: LiveSubscribe;
};

const LIVE_CARD_SELECTOR = frontendDataSelector("live-card");
const boundLiveCards = new WeakSet<HTMLElement>();
const liveCardCleanups = new WeakMap<HTMLElement, LiveCleanup>();

function liveCardTarget(host: HTMLElement) {
  const child = host.firstElementChild;
  return child instanceof HTMLElement ? child : host;
}

function freshLiveCardTarget(wrapper: HTMLElement) {
  const freshHost = wrapper.querySelector<HTMLElement>(LIVE_CARD_SELECTOR);
  if (freshHost) return liveCardTarget(freshHost);
  const fresh = wrapper.firstElementChild;
  return fresh instanceof HTMLElement ? fresh : null;
}

function syncLiveCardAttributes(target: HTMLElement, fresh: Element) {
  Array.from(target.attributes).forEach((attr) => {
      if (attr.name !== "id" && !fresh.hasAttribute(attr.name)) {
        target.removeAttribute(attr.name);
      }
  });
  Array.from(fresh.attributes).forEach((attr) => {
      if (attr.name !== "id") target.setAttribute(attr.name, attr.value);
  });
}

function rehydrateLiveCard(target: HTMLElement, options: LiveCardsOptions) {
  options.bind?.(target);
  target.dispatchEvent(
    new CustomEvent(frontendEventName("rehydrate"), {
        bubbles: true,
        detail: { root: target },
    }),
  );
}

function swapLiveCardHtml(
  host: HTMLElement,
  html: unknown,
  options: LiveCardsOptions = {},
) {
  if (typeof html !== "string" || !html.trim()) return false;
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  const fresh = freshLiveCardTarget(wrapper);
  const target = liveCardTarget(host);
  if (!(fresh instanceof Element)) return false;
  target.innerHTML = fresh.innerHTML;
  syncLiveCardAttributes(target, fresh);
  rehydrateLiveCard(target, options);
  return true;
}

function defaultLiveCardRoom(host: HTMLElement) {
  const kind = String(host.getAttribute(frontendDataAttr("live-kind")) || "").trim();
  const id = String(host.getAttribute(frontendDataAttr("live-id")) || "").trim();
  return kind && id ? `${kind}:${id}` : "";
}

function liveCardHtmlFromPayload(payload: Record<string, unknown>) {
  const data =
  payload.data && typeof payload.data === "object"
  ? payload.data as Record<string, unknown>
  : {};
  return typeof data.html === "string" ? data.html : "";
}

function bindLiveCardHost(
  host: HTMLElement,
  options: LiveCardsOptions = {},
) {
  if (boundLiveCards.has(host)) return false;
  const subscribe = options.subscribe;
  if (typeof subscribe !== "function") return false;
  const room = (options.room || defaultLiveCardRoom)(host);
  if (!room) return false;
  boundLiveCards.add(host);
  const cleanup = subscribe(room, (payload) => {
      if (!host.isConnected) {
        disconnectLiveCardHost(host);
        return;
      }
      const event = typeof payload.event === "string" ? payload.event : "";
      const expected = String(options.event || "card").trim();
      if (expected && event && event !== expected) return;
      const html = liveCardHtmlFromPayload(payload);
      if (html) swapLiveCardHtml(host, html, options);
  });
  if (typeof cleanup === "function") liveCardCleanups.set(host, cleanup);
  registerPageCleanup(host, () => disconnectLiveCardHost(host));
  return true;
}

function disconnectLiveCardHost(host: HTMLElement) {
  return disconnectLiveSubscriptionHost(host, {
      bound: boundLiveCards,
      cleanups: liveCardCleanups,
  });
}

function bindLiveCards(root: BindRoot = document, options: LiveCardsOptions = {}) {
  queryAll<HTMLElement>(root, LIVE_CARD_SELECTOR).forEach((host) => {
      bindLiveCardHost(host, options);
  });
}

export { LIVE_CARD_SELECTOR, bindLiveCards };
export type { LiveCardsOptions, LiveCleanup };
