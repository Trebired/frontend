import React from "react";
import {
  emitLiveSocketAck,
  subscribeRoom,
  type LiveSocketPayload,
} from "./socket.js";

type LiveEventFilter = string | string[] | undefined;
type LiveFieldTarget = Element | ((value: unknown) => void) | null | undefined;
type LiveFieldsOptions = {
  event?: LiveEventFilter;
  fields?: Record<string, LiveFieldTarget>;
  room?: string;
  subscribe?: typeof subscribeRoom;
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

function useLive<T=unknown>(room: string, options: UseLiveOptions<T> = {}) {
  const [value, setValue] = React.useState<T|null>(
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
  eventMatches,
  liveConnect,
  requestSidebarSync,
  useLive,
};
export type {
  LiveEventFilter,
  LiveFieldTarget,
  LiveFieldsOptions,
  UseLiveOptions,
};
