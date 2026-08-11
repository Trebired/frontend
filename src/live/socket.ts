import { io } from "socket.io-client";

type LiveSocketPayload = Record<string, unknown> & {
  data?: unknown;
  event?: string;
  room?: string;
};

type LiveSocketLogger = {
  warn?: (scope: string, message: string, meta?: Record<string, unknown>) => void;
};

type LiveSocketClientOptions = {
  ackTimeoutMs?: number;
  changeEvent?: string;
  logger?: LiveSocketLogger;
  namespace?: string;
  socketOptions?: Record<string, unknown>;
  subscribeEvent?: string;
  unsubscribeEvent?: string;
  withCredentials?: boolean;
};

type LiveSocketClient = {
  emitAck: <T = unknown>(
    event: string,
    payload?: unknown,
    timeoutMs?: number,
  ) => Promise<T | null>;
  socket: () => ReturnType<typeof io>;
  subscribeRoom: (
    room: string,
    onChange: (payload: LiveSocketPayload) => void,
  ) => () => void;
};

const DEFAULT_ACK_TIMEOUT_MS = 5000;

function liveSocketOptions(options: LiveSocketClientOptions = {}) {
  return {
    ackTimeoutMs: Math.max(
      250,
      Number(options.ackTimeoutMs) || DEFAULT_ACK_TIMEOUT_MS,
    ),
    changeEvent: String(options.changeEvent || "resource:change").trim(),
    namespace: String(options.namespace || "/live").trim(),
    subscribeEvent: String(options.subscribeEvent || "subscribe").trim(),
    unsubscribeEvent: String(options.unsubscribeEvent || "unsubscribe").trim(),
    withCredentials: options.withCredentials !== false,
  };
}

function createLiveSocketClient(
  options: LiveSocketClientOptions = {},
): LiveSocketClient {
  const normalized = liveSocketOptions(options);
  let socket: ReturnType<typeof io> | null = null;
  const roomCounts = new Map<string, number>();
  const listeners = new Map<
  string,
  Set<(payload: LiveSocketPayload) => void>
  >();

  function ensureSocket() {
    if (socket) return socket;
    socket = io(normalized.namespace, {
        withCredentials: normalized.withCredentials,
        ...(options.socketOptions || {}),
    });

    socket.on("connect", () => {
        roomCounts.forEach((_count, room) => {
            socket?.emit(normalized.subscribeEvent, { room });
        });
    });

    socket.on(normalized.changeEvent, (payload: LiveSocketPayload) => {
        const room = typeof payload?.room === "string" ? payload.room : "";
        const bucket = room ? listeners.get(room) : null;
        if (!bucket) return;
        bucket.forEach((listener) => {
            try {
              listener(payload);
            } catch (error) {
              options.logger?.warn?.("live.socket", "listener failed", {
                  error: error instanceof Error ? error.message : String(error),
                  room,
              });
            }
        });
    });

    return socket;
  }

  function subscribeRoom(
    room: string,
    onChange: (payload: LiveSocketPayload) => void,
  ) {
    const key = String(room || "").trim();
    if (!key || typeof onChange !== "function") return () => {};
    const activeSocket = ensureSocket();
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)?.add(onChange);

    const previous = roomCounts.get(key) || 0;
    roomCounts.set(key, previous + 1);
    if (previous === 0 && activeSocket.connected) {
      activeSocket.emit(normalized.subscribeEvent, { room: key });
    }

    return () => {
      const bucket = listeners.get(key);
      bucket?.delete(onChange);
      if (bucket && bucket.size === 0) listeners.delete(key);

      const next = (roomCounts.get(key) || 1) - 1;
      if (next <= 0) {
        roomCounts.delete(key);
        if (socket?.connected) {
          socket.emit(normalized.unsubscribeEvent, { room: key });
        }
        return;
      }
      roomCounts.set(key, next);
    };
  }

  function emitAck<T = unknown>(
    event: string,
    payload?: unknown,
    timeoutMs = normalized.ackTimeoutMs,
  ) {
    const activeSocket = ensureSocket();
    return new Promise<T | null>((resolve) => {
        let settled = false;
        const finish = (value: T | null) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          resolve(value);
        };
        const timer = window.setTimeout(
          () => finish(null),
          Math.max(250, Number(timeoutMs) || normalized.ackTimeoutMs),
        );
        try {
          activeSocket.emit(event, payload, (response: T) => finish(response));
        } catch {
          finish(null);
        }
    });
  }

  return {
    emitAck,
    socket: ensureSocket,
    subscribeRoom,
  };
}

const defaultLiveSocketClient = createLiveSocketClient();

function subscribeRoom(
  room: string,
  onChange: (payload: LiveSocketPayload) => void,
) {
  return defaultLiveSocketClient.subscribeRoom(room, onChange);
}

function emitLiveSocketAck<T = unknown>(
  event: string,
  payload?: unknown,
  timeoutMs?: number,
) {
  return defaultLiveSocketClient.emitAck<T>(event, payload, timeoutMs);
}

export {
  DEFAULT_ACK_TIMEOUT_MS,
  createLiveSocketClient,
  defaultLiveSocketClient,
  emitLiveSocketAck,
  subscribeRoom,
};
export type {
  LiveSocketClient,
  LiveSocketClientOptions,
  LiveSocketLogger,
  LiveSocketPayload,
};
