import assert from "node:assert/strict";

async function verifyFrontendServer(context) {
  const server = await context.importDist("server");
  await verifyThemeServer(server);
  verifySidebarServer(server);
  await verifyFaviconServer(server);
  verifyLiveServer(server);
}

async function verifyThemeServer(server) {
  const req = {
    body: { theme: "light" },
    cookies: {},
    headers: { "x-app-theme": "dark" },
    query: {},
    secure: true,
  };
  const res = serverResponseProbe();
  assert.equal(server.effectiveThemeKey(req, { headerName: "x-app-theme" }), "dark");
  assert.equal(server.setServerTheme(req, res, "light"), "light");
  assert.equal(req.cookies.theme, "light");
  assert.equal(res.cookies.theme.value, "light");
  const handler = server.createThemeToggleHandler({
      respond: ({ theme }) => ({ theme }),
  });
  assert.deepEqual(await handler(req, res), { theme: "light" });
}

function verifySidebarServer(server) {
  const req = { body: { minimized: true, side: "right" }, cookies: {} };
  const res = serverResponseProbe();
  const state = server.setServerSidebarMinimized(req, res, "right", true);
  assert.deepEqual(state, { minimized: true, side: "right" });
  assert.equal(req.cookies.sidebar_right_minimized, "1");
  assert.equal(server.currentSidebarMinimized(req, "right"), true);
  const leftOnly = server.setServerSidebarMinimized(req, res, "right", true, {
      allowedSides: ["left"],
  });
  assert.deepEqual(leftOnly, { minimized: false, side: "" });
}

async function verifyFaviconServer(server) {
  const app = appCapture();
  server.attachThemedFaviconRoutes(app, {
      legacyRoutes: ["/favicon.ico"],
      render: (theme) => `<svg data-theme="${theme}"></svg>`,
  });
  assert.equal(app.routes.length, 2);
  const res = serverResponseProbe();
  await app.routes[0].handler({ query: { theme: "light" }, cookies: {}, headers: {} }, res);
  assert.equal(res.headers["Content-Type"], "image/svg+xml; charset=utf-8");
  assert.ok(String(res.body).includes('data-theme="light"'));
  assert.equal(server.themedFaviconHref("dark"), "/favicon.svg?theme=dark");
}

function verifyLiveServer(server) {
  assert.equal(
    server.isLiveNavigationRequest({ headers: { "X-Requested-With": "tbf-router" } }),
    true,
  );
  assert.equal(
    server.frontendRequestMode({ headers: { "X-Requested-With": "tbf-live" } }),
    "region",
  );
  assert.equal(server.frontendRequestMode({ headers: {} }), "document");
}

function serverResponseProbe() {
  const probe = {
    body: null,
    cookies: {},
    headers: {},
    cookie(name, value, options) {
      this.cookies[name] = { options, value };
      return this;
    },
    redirect(status, url) {
      this.statusCode = status;
      this.headers.Location = url;
      return this;
    },
    status(status) {
      this.statusCode = status;
      return this;
    },
  };
  probe.end = (body) => writeProbeBody(probe, body, false);
  probe.json = (body) => writeProbeBody(probe, body, true);
  probe.send = (body) => writeProbeBody(probe, body, false);
  probe.set = (name, value) => writeProbeHeader(probe, name, value);
  probe.setHeader = (name, value) => writeProbeHeader(probe, name, value);
  return probe;
}

function writeProbeBody(probe, body, passthrough) {
  probe.body = body;
  return passthrough ? body : probe;
}

function writeProbeHeader(probe, name, value) {
  probe.headers[name] = value;
  return probe;
}

function appCapture() {
  return {
    routes: [],
    get(path, handler) {
      this.routes.push({ handler, path });
    },
  };
}

export { verifyFrontendServer };
