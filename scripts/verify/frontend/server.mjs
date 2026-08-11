import assert from "node:assert/strict";

async function verifyFrontendServer(context) {
  const server = await context.importDist("server");
  await verifyThemeServer(server);
  await verifyLanguageServer(server);
  verifySidebarServer(server);
  verifyNavigationServer(server);
  verifySeoServer(server);
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

async function verifyLanguageServer(server) {
  const req = {
    body: { lang: "cs" },
    cookies: {},
    headers: { "accept-language": "cs-CZ, en;q=0.8" },
    query: {},
    secure: true,
  };
  const res = serverResponseProbe();
  const options = { allowedLanguages: ["en", "cs"], defaultLanguage: "en" };
  assert.equal(server.browserPreferredLanguage(req, options), "cs");
  assert.equal(server.setServerLanguage(req, res, "cs", options), "cs");
  assert.equal(req.cookies.ui_lang, "cs");
  assert.equal(res.cookies.ui_lang.value, "cs");
  const handler = server.createLanguageSetHandler({
      options,
      respond: ({ lang }) => ({ lang }),
  });
  assert.deepEqual(await handler(req, res), { lang: "cs" });
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

function verifyNavigationServer(server) {
  const state = server.createNavigationState({
      path: "/apps/example/settings?tab=general",
      url: "/apps/example/settings?tab=general",
  });
  assert.equal(state.isCurrent("/apps/example"), true);
  assert.equal(state.linkAttrs("/apps/example/settings"), ' class="is-active" aria-current="page"');
  assert.equal(server.normalizeRequestPath({ originalUrl: "/apps/one?tab=x" }), "/apps/one");
  const decorated = state.decorate('<li><a href="/apps/example">App</a></li>');
  assert.ok(decorated.includes('class="is-active"'));
  assert.ok(decorated.includes('aria-current="page"'));
}

function verifySeoServer(server) {
  const store = server.createSeoStore({
      defaults: { contentLanguage: "cs", titleSuffix: " | App" },
  });
  assert.equal(store.getSeo().contentLanguage, "cs");
  store.updateSeo({ metaDescription: "About" });
  assert.equal(store.getSeo().metaDescription, "About");
  const req = {
    headers: { host: "example.test", "x-forwarded-proto": "https" },
    path: "/platform/settings",
  };
  const res = serverResponseProbe();
  res.locals = {};
  const middleware = server.createSeoMiddleware({ getSeo: store.getSeo });
  middleware(req, res, () => {});
  assert.equal(res.locals.seo.title, "Settings");
  assert.equal(res.headers["X-Robots-Tag"], server.ROBOTS_NOINDEX_CONTENT);
  server.applySeo(res, { contentLanguage: "en" });
  assert.equal(res.headers["Content-Language"], "en");
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
