import {
  serverObject,
  serverString,
  type ServerRequestLike,
  type ServerResponseLike,
} from "./http.js";
import {
  resolveFrontendServerLogger,
  type FrontendServerLoggerInput,
} from "./logging.js";
import {
  readSidebarLiveItems,
  type SidebarLiveDescriptor,
} from "./sidebar-live.js";

type LiveSocketLike = {
  emit?: (event: string, payload?: unknown) => unknown;
  handshake?: Record<string, unknown>;
  join?: (room: string) => unknown;
  leave?: (room: string) => unknown;
  login_session?: unknown;
  on?: (event: string, handler: (...args: any[]) => unknown) => unknown;
  viewer?: unknown;
};

type LiveSocketNamespaceLike = {
  on?: (event: string, handler: (socket: LiveSocketLike) => unknown) => unknown;
  to?: (room: string) => { emit?: (event: string, payload?: unknown) => unknown };
  use?: (middleware: unknown) => unknown;
};

type LiveSocketServerLike =
LiveSocketNamespaceLike& {
  of?: (namespace: string) => LiveSocketNamespaceLike;
};

type LiveRoom = {
  id: string;
  kind: string;
  room: string;
};

type LiveSocketSidebarSyncContext = {
  items: SidebarLiveDescriptor[];
  payload: unknown;
  req: ServerRequestLike;
  res: ServerResponseLike;
  socket: LiveSocketLike;
};

type LiveSocketSidebarSyncOptions = {
  event?: string;
  readItems?: (payload: unknown) => SidebarLiveDescriptor[];
  resolve: (
    context: LiveSocketSidebarSyncContext,
  ) => unknown | Promise<unknown>;
  responseEvent?: string;
  withContext?: (
    context: LiveSocketSidebarSyncContext,
    run: () => Promise<unknown>,
  ) => Promise<unknown>;
};

type LiveSocketServerOptions = {
  authenticate?: unknown | readonly unknown[];
  changeEvent?: string;
  deniedEvent?: string;
  logger?: FrontendServerLoggerInput;
  namespace?: string;
  sidebarSync?: false | LiveSocketSidebarSyncOptions;
  subscribedEvent?: string;
  subscribeEvent?: string;
  unsubscribeEvent?: string;
};

type LiveSocketServer = {
  attach: (server: LiveSocketServerLike) => boolean;
  broadcast: (room: unknown, event: unknown, data: unknown) => boolean;
  namespace: () => LiveSocketNamespaceLike | null;
  registerRoomAuthorizer: (
    kind: unknown,
    authorize: (socket: LiveSocketLike, id: string) => unknown,
  ) => boolean;
};

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

  return {
    attach,
    broadcast,
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
  LiveSocketLike,
  LiveSocketNamespaceLike,
  LiveSocketServer,
  LiveSocketServerLike,
  LiveSocketServerOptions,
  LiveSocketSidebarSyncContext,
  LiveSocketSidebarSyncOptions,
};
