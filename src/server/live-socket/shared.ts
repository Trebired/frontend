import {
  serverObject,
  serverString,
  type ServerRequestLike,
  type ServerResponseLike,
} from "#hf241ii8z71i";
import type { LiveRoom, LiveSocketLike, LiveSocketServerLike, LiveSocketServerOptions } from "./types.js";

const DEFAULT_LIVE_NAMESPACE = "/live";
const DEFAULT_LIVE_CHANGE_EVENT = "resource:change";
const DEFAULT_LIVE_SUBSCRIBE_EVENT = "subscribe";
const DEFAULT_LIVE_UNSUBSCRIBE_EVENT = "unsubscribe";
const DEFAULT_LIVE_SUBSCRIBED_EVENT = "live:subscribed";
const DEFAULT_LIVE_DENIED_EVENT = "live:denied";
const DEFAULT_LIVE_SIDEBAR_SYNC_EVENT = "sidebar:sync";

function liveRoomFor(kind: unknown, id: unknown): string {
  const safeKind = serverString(kind).trim();
  const safeId = serverString(id).trim();
  return safeKind && safeId ? `${safeKind}:${safeId}` : "";
}

function parseLiveRoom(room: unknown): LiveRoom | null {
  const text = serverString(room).trim();
  const separator = text.indexOf(":");
  if (separator <= 0 || separator >= text.length - 1) return null;
  return {
    kind: text.slice(0, separator),
    id: text.slice(separator + 1),
    room: text,
  };
}

function liveSocketRequest(socket: LiveSocketLike): ServerRequestLike {
  const handshake = serverObject(socket && socket.handshake);
  const request = serverObject(handshake.request);
  return Object.assign(
    Object.create(request ? Object.getPrototypeOf(request) : Object.prototype),
    request,
    {
      address: handshake.address || "",
      cookies: serverObject(request.cookies),
      headers: serverObject(handshake.headers || request.headers),
      ip: handshake.address || "",
      login_session: socket && socket.login_session ? socket.login_session : null,
      viewer: socket && socket.viewer ? socket.viewer : null,
    },
  );
}

function liveSocketResponse(socket: LiveSocketLike): ServerResponseLike {
  return {
    locals: {
      isAuthenticated: Boolean(socket && socket.viewer),
      login_session: socket && socket.login_session ? socket.login_session : null,
      viewer: socket && socket.viewer ? socket.viewer : null,
    },
  };
}

function normalizeLiveSocketOptions(options: LiveSocketServerOptions = {}) {
  return {
    changeEvent: serverString(options.changeEvent || DEFAULT_LIVE_CHANGE_EVENT),
    deniedEvent: serverString(options.deniedEvent || DEFAULT_LIVE_DENIED_EVENT),
    namespace: serverString(options.namespace || DEFAULT_LIVE_NAMESPACE),
    sidebarSync: options.sidebarSync,
    subscribedEvent: serverString(
      options.subscribedEvent || DEFAULT_LIVE_SUBSCRIBED_EVENT,
    ),
    subscribeEvent: serverString(
      options.subscribeEvent || DEFAULT_LIVE_SUBSCRIBE_EVENT,
    ),
    unsubscribeEvent: serverString(
      options.unsubscribeEvent || DEFAULT_LIVE_UNSUBSCRIBE_EVENT,
    ),
  };
}

function liveSocketMiddlewareList(options: LiveSocketServerOptions) {
  if (Array.isArray(options.authenticate)) return [...options.authenticate];
  return options.authenticate ? [options.authenticate] : [];
}

function resolveLiveSocketNamespace(
  server: LiveSocketServerLike,
  namespace: string,
) {
  return typeof server?.of === "function" ? server.of(namespace) : server;
}

export {
  DEFAULT_LIVE_CHANGE_EVENT,
  DEFAULT_LIVE_DENIED_EVENT,
  DEFAULT_LIVE_NAMESPACE,
  DEFAULT_LIVE_SIDEBAR_SYNC_EVENT,
  DEFAULT_LIVE_SUBSCRIBED_EVENT,
  DEFAULT_LIVE_SUBSCRIBE_EVENT,
  DEFAULT_LIVE_UNSUBSCRIBE_EVENT,
  liveRoomFor,
  liveSocketMiddlewareList,
  liveSocketRequest,
  liveSocketResponse,
  normalizeLiveSocketOptions,
  parseLiveRoom,
  resolveLiveSocketNamespace,
};
