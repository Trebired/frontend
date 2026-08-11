import assert from "node:assert/strict";

function createSocket(emitted) {
  return {
    handshake: {
      address: "127.0.0.1",
      headers: { cookie: "a=b" },
      request: { cookies: { a: "b" }, headers: {} },
    },
    handlers: {},
    joined: [],
    emit(event, payload) {
      emitted.push({ event, payload });
    },
    join(room) {
      this.joined.push(room);
    },
    leave(room) {
      this.left = room;
    },
    on(event, handler) {
      this.handlers[event] = handler;
    },
    viewer: { id: "viewer-a" },
  };
}

function createNamespace() {
  return {
    connectionHandler: null,
    emitted: [],
    middlewares: [],
    on(event, handler) {
      if (event === "connection") this.connectionHandler = handler;
    },
    to(room) {
      return {
        emit: (event, payload) => this.emitted.push({ event, payload, room }),
      };
    },
    use(middleware) {
      this.middlewares.push(middleware);
    },
  };
}

function createTestLiveServer(server) {
  return server.createLiveSocketServer({
      authenticate: "auth-middleware",
      sidebarSync: {
        resolve: ({ items, req, res }) => ({
            authenticated: res.locals.isAuthenticated,
            cookie: req.cookies.a,
            count: items.length,
        }),
      },
  });
}

async function verifySubscriptions(server, socket, emitted) {
  await socket.handlers.subscribe({ room: "app:1" });
  assert.deepEqual(socket.joined, ["app:1"]);
  await socket.handlers.subscribe({ room: "app:2" });
  assert.equal(emitted[1].event, server.DEFAULT_LIVE_DENIED_EVENT);
}

function sidebarSyncResult(socket) {
  return new Promise((resolve) => {
      socket.handlers["sidebar:sync"](
        { sidebars: [{ path: "/apps/1", type: "app" }] },
        resolve,
      );
  });
}

async function verifySidebarSync(socket) {
  assert.deepEqual(await sidebarSyncResult(socket), {
      data: {
        sidebars: {
          authenticated: true,
          cookie: "b",
          count: 1,
        },
      },
      ok: true,
  });
}

function verifyBroadcast(server, liveServer, namespace) {
  assert.equal(liveServer.broadcast("app:1", "settings", { ok: true }), true);
  assert.equal(namespace.emitted[0].event, server.DEFAULT_LIVE_CHANGE_EVENT);
  assert.equal(namespace.emitted[0].payload.event, "settings");
  assert.equal(server.liveRoomFor("app", "1"), "app:1");
  assert.deepEqual(server.parseLiveRoom("app:1"), {
      id: "1",
      kind: "app",
      room: "app:1",
  });
}

async function verifyLiveSocketServer(server) {
  const emitted = [];
  const socket = createSocket(emitted);
  const namespace = createNamespace();
  const liveServer = createTestLiveServer(server);
  liveServer.registerRoomAuthorizer("app", (_socket, id) => id === "1");
  assert.equal(liveServer.attach({ of: () => namespace }), true);
  assert.deepEqual(namespace.middlewares, ["auth-middleware"]);
  namespace.connectionHandler(socket);
  await verifySubscriptions(server, socket, emitted);
  await verifySidebarSync(socket);
  verifyBroadcast(server, liveServer, namespace);
}

export { verifyLiveSocketServer };
