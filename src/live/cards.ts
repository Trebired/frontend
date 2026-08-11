import { queryAll, type BindRoot } from "#er0dlx1gtbzh";

type LiveCleanup = () => void;
type LiveCardsOptions = {
  bind?: (root: BindRoot) => void;
  event?: string;
  room?: (host: HTMLElement) => string;
  subscribe?: (
    room: string,
    onChange: (payload: Record<string, unknown>) => void,
  ) => LiveCleanup;
};

const LIVE_CARD_SELECTOR = "[data-tbf-live-card]";
const boundLiveCards = new WeakSet<HTMLElement>();

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
    new CustomEvent("tbf:rehydrate", {
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
  const kind = String(host.getAttribute("data-tbf-live-kind") || "").trim();
  const id = String(host.getAttribute("data-tbf-live-id") || "").trim();
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
  subscribe(room, (payload) => {
      const event = typeof payload.event === "string" ? payload.event : "";
      const expected = String(options.event || "card").trim();
      if (expected && event && event !== expected) return;
      const html = liveCardHtmlFromPayload(payload);
      if (html) swapLiveCardHtml(host, html, options);
  });
  return true;
}

function bindLiveCards(root: BindRoot = document, options: LiveCardsOptions = {}) {
  queryAll<HTMLElement>(root, LIVE_CARD_SELECTOR).forEach((host) => {
      bindLiveCardHost(host, options);
  });
}

export {
  LIVE_CARD_SELECTOR,
  bindLiveCardHost,
  bindLiveCards,
  swapLiveCardHtml,
};
export type { LiveCardsOptions, LiveCleanup };
