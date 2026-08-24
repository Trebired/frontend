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

async function verifyLiveResource(server) {
  const emitted = [];
  const socket = createSocket(emitted);
  const namespace = createNamespace();
  const liveServer = server.createLiveSocketServer();
  let changeSource = null;
  const resource = liveServer.defineResource({
      authorize: (_socket, id) => id === "global",
      event: "platform-live",
      id: "global",
      kind: "platform",
      payload: (input = {}) => ({
          lang: input.lang || "",
          ok: true,
      }),
  });

  assert.equal(resource.room(), "platform:global");
  assert.equal(resource.register(), true);
  assert.equal(resource.register(), true);
  assert.equal(liveServer.attach({ of: () => namespace }), true);
  namespace.connectionHandler(socket);
  await socket.handlers.subscribe({ room: "platform:global" });
  assert.deepEqual(socket.joined, ["platform:global"]);
  await socket.handlers.subscribe({ room: "platform:other" });
  assert.equal(emitted[1].event, server.DEFAULT_LIVE_DENIED_EVENT);

  const dispose = resource.bind("control", (emit) => {
      changeSource = emit;
      return () => {
        changeSource = null;
      };
  });
  assert.equal(
    resource.bind("control", () => {
        throw new Error("duplicate binding should not run");
    }),
    dispose,
  );

  changeSource({ lang: "en" });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(namespace.emitted[0].event, server.DEFAULT_LIVE_CHANGE_EVENT);
  assert.equal(namespace.emitted[0].payload.event, "platform-live");
  assert.deepEqual(namespace.emitted[0].payload.data, {
      lang: "en",
      ok: true,
  });

  assert.equal(await resource.broadcast({ lang: "cs" }), true);
  assert.deepEqual(namespace.emitted[1].payload.data, {
      lang: "cs",
      ok: true,
  });

  const empty = liveServer.defineResource({
      event: "empty",
      kind: "empty",
      payload: () => null,
  });
  assert.equal(await empty.broadcast(), false);
  dispose();
  assert.equal(changeSource, null);
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
  await verifyLiveResource(server);
}

export { verifyLiveSocketServer };
