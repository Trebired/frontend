import React from "react";
import { defaultLiveSubscribe, type LiveSubscribe, type LiveSubscribePayload } from "./subscribe.js";

type LiveEventFilter = string | string[] | undefined;
type LiveFieldTarget = Element | ((value: unknown) => void) | null | undefined;
type LiveFieldsOptions = {
  channel?: string;
  event?: LiveEventFilter;
  fields?: Record<string, LiveFieldTarget>;
  room?: string;
  subscribe?: LiveSubscribe;
};
type UseLiveOptions<T> = {
  event?: LiveEventFilter;
  initialData?: T | null;
  onUpdate?: (data: T | null, payload: LiveSubscribePayload) => void;
  subscribe?: LiveSubscribe;
};

function eventMatches(filter: LiveEventFilter, actual: unknown) {
  if (!filter) return true;
  const event = typeof actual === "string" ? actual : "";
  return Array.isArray(filter) ? filter.includes(event) : filter === event;
}

function liveConnect(
  channel: string,
  room: string,
  event: LiveEventFilter,
  onUpdate: (data: unknown, payload: LiveSubscribePayload) => void,
  subscribe: LiveSubscribe = defaultLiveSubscribe,
) {
  const key = String(room || "").trim();
  if (!channel || !key || typeof onUpdate !== "function") return () => {};
  return subscribe(channel, key, (payload) => {
      if (!eventMatches(event, payload.event)) return;
      onUpdate(payload.data, payload);
  });
}

function useLive<T=unknown>(channel: string, room: string, options: UseLiveOptions<T> = {}) {
  const [value, setValue] = React.useState<T|null>(options.initialData ?? null);
  const onUpdateRef = React.useRef(options.onUpdate);
  onUpdateRef.current = options.onUpdate;

  React.useEffect(() => {
      if (!channel || !room) return undefined;
      return liveConnect(channel, room, options.event, (data, payload) => {
          const next = data as T | null;
          setValue(next);
          onUpdateRef.current?.(next, payload);
        }, options.subscribe);
    }, [channel, room, options.event, options.subscribe]);

  return value;
}

function applyLiveFieldValue(target: LiveFieldTarget, value: unknown) {
  if (typeof target === "function") {
    target(value);
    return;
  }
  if (!(target instanceof Element)) return;
  const next = value == null ? "" : String(value);
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
    target.value = next;
    return;
  }
  target.textContent = next;
}

function connectLiveFields(options: LiveFieldsOptions = {}) {
  const fields = options.fields || {};
  return liveConnect(String(options.channel || ""), String(options.room || ""), options.event, (data) => {
      const source = data && typeof data === "object" ? data as Record<string, unknown> : {};
      Object.keys(fields).forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(source, key)) applyLiveFieldValue(fields[key], source[key]);
      });
    }, options.subscribe);
}

export { applyLiveFieldValue, connectLiveFields, eventMatches, liveConnect, useLive };
export type { LiveEventFilter, LiveFieldTarget, LiveFieldsOptions, UseLiveOptions };
