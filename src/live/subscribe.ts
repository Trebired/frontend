import { connectChannel } from "@trebired/sockets/client";

type LiveSubscribePayload = Record<string, unknown>& {
  data?: unknown;
  event?: string;
  room?: string;
};

type LiveSubscribe = (
  channel: string,
  room: string,
  onChange: (payload: LiveSubscribePayload) => void,
) => () => void;

function defaultLiveSubscribe(
  channel: string,
  room: string,
  onChange: (payload: LiveSubscribePayload) => void,
) {
  const namespace = String(channel || "").trim();
  const key = String(room || "").trim();
  if (!namespace || !key || typeof onChange !== "function") return () => {};
  return connectChannel(namespace).subscribe(key, onChange as never);
}

export { defaultLiveSubscribe };
export type { LiveSubscribe, LiveSubscribePayload };
