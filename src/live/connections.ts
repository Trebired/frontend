import React from "react";
import { rehydrate, type LiveOptions } from "./regions.js";
import {
  emitLiveSocketAck,
  subscribeRoom,
  type LiveSocketPayload,
} from "./socket.js";
import { importChildNodes } from "./state.js";

type LiveEventFilter = string | string[] | undefined;
type LiveFieldTarget = Element | ((value: unknown) => void) | null | undefined;
type LiveFieldsOptions = {
  event?: LiveEventFilter;
  fields?: Record<string, LiveFieldTarget>;
  room?: string;
  subscribe?: typeof subscribeRoom;
};
type LiveRefreshOptions = LiveOptions & {
  anchor?: string;
  event?: LiveEventFilter;
  room?: string;
  subscribe?: typeof subscribeRoom;
  url?: string;
};
type UseLiveOptions<T> = {
  event?: LiveEventFilter;
  initialData?: T | null;
  onUpdate?: (data: T | null, payload: LiveSocketPayload) => void;
  subscribe?: typeof subscribeRoom;
};
type SidebarSyncResponse = {
  data?: {
    sidebars?: unknown[];
  };
  ok?: boolean;
};

function eventMatches(filter: LiveEventFilter, actual: unknown) {
  if (!filter) return true;
  const event = typeof actual === "string" ? actual : "";
  return Array.isArray(filter) ? filter.includes(event) : filter === event;
}

function liveConnect(
  room: string,
  event: LiveEventFilter,
  onUpdate: (data: unknown, payload: LiveSocketPayload) => void,
  subscribe: typeof subscribeRoom = subscribeRoom,
) {
  const key = String(room || "").trim();
  if (!key || typeof onUpdate !== "function") return () => {};
  return subscribe(key, (payload) => {
      if (!eventMatches(event, payload.event)) return;
      onUpdate(payload.data, payload);
  });
}

function useLive<T = unknown>(room: string, options: UseLiveOptions<T> = {}) {
  const [value, setValue] = React.useState<T | null>(
    options.initialData ?? null,
  );
  const onUpdateRef = React.useRef(options.onUpdate);
  onUpdateRef.current = options.onUpdate;

  React.useEffect(() => {
      if (!room) return undefined;
      return liveConnect(
        room,
        options.event,
        (data, payload) => {
          const next = data as T | null;
          setValue(next);
          onUpdateRef.current?.(next, payload);
        },
        options.subscribe || subscribeRoom,
      );
    }, [room, options.event, options.subscribe]);

  return value;
}

function applyLiveFieldValue(target: LiveFieldTarget, value: unknown) {
  if (typeof target === "function") {
    target(value);
    return;
  }
  if (!(target instanceof Element)) return;
  const next = value == null ? "" : String(value);
  if (
    target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
  ) {
    target.value = next;
    return;
  }
  target.textContent = next;
}

function connectLiveFields(options: LiveFieldsOptions = {}) {
  const room = String(options.room || "").trim();
  const fields = options.fields || {};
  if (!room) return () => {};
  return liveConnect(
    room,
    options.event,
    (data) => {
      const source = data && typeof data === "object"
      ? data as Record<string, unknown>
      : {};
      Object.keys(fields).forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            applyLiveFieldValue(fields[key], source[key]);
          }
      });
    },
    options.subscribe || subscribeRoom,
  );
}

function liveRefreshTarget(root: Document | ParentNode, anchor: unknown) {
  const value = String(anchor || "").trim();
  if (!value || !("querySelector" in root)) return null;
  if (value.startsWith("#")) {
    const id = value.slice(1);
    return root instanceof Document
    ? root.getElementById(id)
    : root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
  }
  if (/^[A-Za-z][A-Za-z0-9_-]*$/u.test(value)) {
    return root instanceof Document
    ? root.getElementById(value)
    : root.querySelector<HTMLElement>(`#${CSS.escape(value)}`);
  }
  if (value.startsWith("[data-") && !/[\s,>+~]/u.test(value)) {
    return root.querySelector<HTMLElement>(value);
  }
  return null;
}

function replaceLiveFragment(anchor: string, doc: Document, options: LiveOptions) {
  const fresh = liveRefreshTarget(doc, anchor);
  const current = liveRefreshTarget(document, anchor);
  if (!(fresh instanceof HTMLElement) || !(current instanceof HTMLElement)) {
    return false;
  }
  current.replaceChildren(...importChildNodes(fresh));
  rehydrate(current, options);
  return true;
}

function connectLiveRefresh(options: LiveRefreshOptions = {}) {
  const room = String(options.room || "").trim();
  const anchor = String(options.anchor || "").trim();
  if (!room || !liveRefreshTarget(document, anchor)) return () => {};

  let inflight = false;
  return liveConnect(
    room,
    options.event,
    () => {
      if (inflight) return;
      inflight = true;
      const url = String(options.url || window.location.href).trim();
      fetch(url, {
          credentials: "same-origin",
          headers: { Accept: "text/html" },
      })
      .then((response) => response.ok ? response.text() : "")
      .then((html) => {
          if (!html) return;
          const doc = new DOMParser().parseFromString(html, "text/html");
          replaceLiveFragment(anchor, doc, options);
      })
      .finally(() => {
          inflight = false;
      });
    },
    options.subscribe || subscribeRoom,
  );
}

function requestSidebarSync(sidebars: unknown[]) {
  const list = Array.isArray(sidebars) ? sidebars : [];
  if (!list.length) return Promise.resolve([]);
  return emitLiveSocketAck<SidebarSyncResponse>("sidebar:sync", {
      sidebars: list,
  }).then((response) => {
      if (!response || response.ok !== true) return null;
      return Array.isArray(response.data?.sidebars)
      ? response.data.sidebars
      : [];
  });
}

export {
  applyLiveFieldValue,
  connectLiveFields,
  connectLiveRefresh,
  eventMatches,
  liveConnect,
  liveRefreshTarget,
  requestSidebarSync,
  useLive,
};
export type {
  LiveEventFilter,
  LiveFieldTarget,
  LiveFieldsOptions,
  LiveRefreshOptions,
  UseLiveOptions,
};
