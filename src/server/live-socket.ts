import { readSidebarLiveItems } from "./sidebar-live.js";
import { serverObject, serverString } from "./http.js";
import { resolveFrontendServerLogger } from "./logging.js";
import {
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
} from "./live-socket/shared.js";
import type {
  LiveResourceDefinition,
  LiveResourcePayloadResolver,
  LiveResourceSubscribe,
  LiveRoom,
  LiveSocketLike,
  LiveSocketNamespaceLike,
  LiveSocketResource,
  LiveSocketServer,
  LiveSocketServerLike,
  LiveSocketServerOptions,
  LiveSocketSidebarSyncContext,
  LiveSocketSidebarSyncOptions,
} from "./live-socket/types.js";

function createLiveSocketServer(
  options: LiveSocketServerOptions = {},
): LiveSocketServer {
  const normalized = normalizeLiveSocketOptions(options);
  const logger = resolveFrontendServerLogger(options.logger);
  const authorizers = new Map<
  string,
  (socket: LiveSocketLike, id: string) => unknown
  >();
  let activeNamespace: LiveSocketNamespaceLike | null = null;

  async function isRoomAllowed(socket: LiveSocketLike, room: LiveRoom) {
    const authorize = authorizers.get(room.kind);
    if (!authorize) return true;
    try {
      return Boolean(await Promise.resolve(authorize(socket, room.id)));
    } catch {
      return false;
    }
  }

  async function handleSubscribe(socket: LiveSocketLike, payload: unknown) {
    const room = parseLiveRoom(serverObject(payload).room);
    if (!room) return;
    const allowed = await isRoomAllowed(socket, room);
    if (!allowed) {
      socket.emit?.(normalized.deniedEvent, { room: room.room });
      return;
    }
    socket.join?.(room.room);
    socket.emit?.(normalized.subscribedEvent, { room: room.room });
  }

  function handleUnsubscribe(socket: LiveSocketLike, payload: unknown) {
    const room = parseLiveRoom(serverObject(payload).room);
    if (room) socket.leave?.(room.room);
  }

  async function runSidebarSync(
    sync: LiveSocketSidebarSyncOptions,
    context: LiveSocketSidebarSyncContext,
  ) {
    const run = () => Promise.resolve(sync.resolve(context));
    return sync.withContext ? sync.withContext(context, run) : run();
  }

  async function handleSidebarSync(
    socket: LiveSocketLike,
    payload: unknown,
    done?: (response: unknown) => unknown,
  ) {
    const sync = options.sidebarSync;
    if (!sync) return;
    const reply =
    typeof done === "function"
    ? done
    : (response: unknown) =>
    socket.emit?.(sync.responseEvent || DEFAULT_LIVE_SIDEBAR_SYNC_EVENT, response);
    const context: LiveSocketSidebarSyncContext = {
      items: (sync.readItems || readSidebarLiveItems)(payload),
      payload,
      req: liveSocketRequest(socket),
      res: liveSocketResponse(socket),
      socket,
    };

    try {
      const result = await runSidebarSync(sync, context);
      reply({ data: { sidebars: result }, ok: true });
    } catch (error: any) {
      reply({
          data: { sidebars: [] },
          error: error && error.message ? error.message : String(error),
          ok: false,
      });
    }
  }

  function bindConnection(socket: LiveSocketLike) {
    socket.on?.(normalized.subscribeEvent, (payload) => {
        return handleSubscribe(socket, payload);
    });
    if (options.sidebarSync !== false && options.sidebarSync) {
      socket.on?.(
        options.sidebarSync.event || DEFAULT_LIVE_SIDEBAR_SYNC_EVENT,
        (payload, done) => {
          return handleSidebarSync(socket, payload, done);
        },
      );
    }
    socket.on?.(normalized.unsubscribeEvent, (payload) => {
        handleUnsubscribe(socket, payload);
    });
  }

  function attach(server: LiveSocketServerLike) {
    const namespace = resolveLiveSocketNamespace(server, normalized.namespace);
    if (!namespace || typeof namespace.on !== "function") return false;
    activeNamespace = namespace;
    for (const middleware of liveSocketMiddlewareList(options)) {
      namespace.use?.(middleware);
    }
    namespace.on("connection", bindConnection);
    logger.info("live.socket", "live namespace attached", {
        namespace: normalized.namespace,
    });
    return true;
  }

  function broadcast(room: unknown, event: unknown, data: unknown) {
    const text = serverString(room).trim();
    if (!text || !activeNamespace) return false;
    activeNamespace.to?.(text).emit?.(normalized.changeEvent, {
        room: text,
        event: serverString(event),
        data: data == null ? null : data,
    });
    return true;
  }

  function registerRoomAuthorizer(
    kind: unknown,
    authorize: (socket: LiveSocketLike, id: string) => unknown,
  ) {
    const safeKind = serverString(kind).trim();
    if (!safeKind || typeof authorize !== "function") return false;
    authorizers.set(safeKind, authorize);
    return true;
  }

  function defineResource<TInput=unknown, TData=unknown>(
    definition: LiveResourceDefinition<TInput, TData>,
  ): LiveSocketResource<TInput> {
    const kind = serverString(definition && definition.kind).trim();
    const defaultId = serverString(definition && definition.id != null
      ? definition.id
      : "global").trim();
    const event = serverString(definition && definition.event).trim();
    const bound = new Map<string, ()=>void>();
    let registered = false;

    function register() {
      if (registered) return Boolean(kind && event);
      registered = true;
      if (!kind || !event) return false;
      if (typeof definition.authorize === "function") {
        return registerRoomAuthorizer(kind, definition.authorize);
      }
      return true;
    }

    function room(id?: unknown) {
      return liveRoomFor(kind, arguments.length ? id : defaultId);
    }

    async function resourceData(input?: TInput) {
      if (typeof definition.payload !== "function") return input;
      return Promise.resolve(definition.payload(input as TInput));
    }

    async function resourceBroadcast(input?: TInput) {
      if (!register()) return false;
      const targetRoom = room();
      if (!targetRoom || !event) return false;
      try {
        const data = await resourceData(input);
        if (typeof definition.payload === "function" && data == null) {
          return false;
        }
        return broadcast(targetRoom, event, data);
      } catch (error: any) {
        logger.warn("live.socket", "resource broadcast failed", {
            error: error && error.message ? error.message : String(error),
            event,
            kind,
            room: targetRoom,
        });
        return false;
      }
    }

    function bind(key: unknown, subscribe: LiveResourceSubscribe<TInput>) {
      const safeKey = serverString(key).trim();
      if (!safeKey || typeof subscribe !== "function") return () => {};
      register();
      const existing = bound.get(safeKey);
      if (existing) return existing;
      const emit = (input?: TInput) => {
        void resourceBroadcast(input);
      };
      const cleanupValue = subscribe(emit);
      const cleanup =
      typeof cleanupValue === "function"
      ? cleanupValue as() => void
      : () => {};
      const dispose = () => {
        try {
          cleanup();
        } finally {
          bound.delete(safeKey);
        }
      };
      bound.set(safeKey, dispose);
      return dispose;
    }

    return {
      bind,
      broadcast: resourceBroadcast,
      register,
      room,
    };
  }

  return {
    attach,
    broadcast,
    defineResource,
    namespace: () => activeNamespace,
    registerRoomAuthorizer,
  };
}

function attachLiveSocketServer(
  server: LiveSocketServerLike,
  options: LiveSocketServerOptions = {},
) {
  const liveServer = createLiveSocketServer(options);
  liveServer.attach(server);
  return liveServer;
}

export {
  attachLiveSocketServer,
  createLiveSocketServer,
  DEFAULT_LIVE_CHANGE_EVENT,
  DEFAULT_LIVE_DENIED_EVENT,
  DEFAULT_LIVE_NAMESPACE,
  DEFAULT_LIVE_SIDEBAR_SYNC_EVENT,
  DEFAULT_LIVE_SUBSCRIBED_EVENT,
  DEFAULT_LIVE_SUBSCRIBE_EVENT,
  DEFAULT_LIVE_UNSUBSCRIBE_EVENT,
  liveRoomFor,
  liveSocketRequest,
  liveSocketResponse,
  parseLiveRoom,
};
export type {
  LiveRoom,
  LiveResourceDefinition,
  LiveResourcePayloadResolver,
  LiveResourceSubscribe,
  LiveSocketLike,
  LiveSocketNamespaceLike,
  LiveSocketResource,
  LiveSocketServer,
  LiveSocketServerLike,
  LiveSocketServerOptions,
  LiveSocketSidebarSyncContext,
  LiveSocketSidebarSyncOptions,
};
