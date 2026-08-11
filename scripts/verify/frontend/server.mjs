import assert from "node:assert/strict";
import { appCapture, serverResponseProbe } from "./server/probe.mjs";
import { verifyFrontendServerFramework } from "./server/services.mjs";
import { verifyFallbackServer } from "./server/fallback.mjs";

async function verifyFrontendServer(context) {
  const server = await context.importDist("server");
  const root = await context.importDistRoot();
  await verifyThemeServer(server);
  await verifyLanguageServer(server);
  await verifyFrontendServerFramework(server);
  verifySecurityServer(server);
  verifySidebarServer(server);
  verifyNavigationServer(server);
  await verifyIconServerAttachment(server);
  verifyRootNavigation(root);
  verifySeoServer(server);
  await verifyAssetServer(server);
  await verifyRenderModeServer(server);
  await verifyFaviconServer(server);
  verifyLiveServer(server);
  verifyLocaleServer(server);
  await verifyPageTaskServer(server);
  verifyReactRenderServer(server);
  await verifyFallbackServer(server);
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
  const app = appCapture();
  server.attachNavigationMiddleware(app);
  const res = serverResponseProbe();
  app.middlewares[0]({ originalUrl: "/settings/profile?tab=account" }, res, () => {});
  assert.equal(res.locals.navigation.current.path, "/settings/profile");
  assert.equal(res.locals.navigation.isCurrent("/settings"), true);
}

function verifyRootNavigation(root) {
  assert.equal(root.normalizeNavigationPath("/apps/one?tab=x"), "/apps/one");
  assert.equal(root.matchesCurrentPath("/apps/one/settings", "/apps/one"), true);
}

function verifySecurityServer(server) {
  const res = serverResponseProbe();
  res.locals = { csrfToken: "csrf-a", nonce: "nonce-a" };
  const state = server.applySecurityToLocals(res);
  assert.deepEqual(state, { csrfToken: "csrf-a", nonce: "nonce-a" });
  assert.deepEqual(res.locals.security, state);
}

async function verifyIconServerAttachment(server) {
  const app = appCapture();
  const attached = server.attachIconServer(app, {
      aliases: { save: "remixicon:save-3-line" },
      packs: ["remixicon"],
  });
  assert.equal(app.locals.icons.save, "remixicon:save-3-line");
  assert.equal(app.locals.icons.close, "remixicon:close-line");
  assert.equal(typeof app.locals.icon, "function");
  assert.equal(attached.route, "/__icons/svg");
  assert.equal(app.routes[0].path, "/__icons/svg");
  const res = serverResponseProbe();
  app.middlewares[0]({}, res, () => {});
  app.middlewares[1]({}, res, () => {});
  assert.equal(res.locals.icons.save, "remixicon:save-3-line");
  assert.equal(res.locals.icons.close, "remixicon:close-line");
  assert.ok(res.locals.icon("remixicon:save-3-line").includes("tbf-icon"));
  await app.routes[0].handler(
    { query: { spec: "remixicon:save-3-line" } },
    res,
  );
  assert.equal(res.headers["Content-Type"], "image/svg+xml; charset=utf-8");
  assert.equal(res.statusCode, 200);
  assert.ok(String(res.body).includes("<svg"));
}

async function verifyRenderModeServer(server) {
  const modes = {
    default: {},
    app: {
      header: { show: true, type: "app" },
      sidebars: { left: { show: { value: true }, type: "main" } },
    },
    "app.detail": {
      page: { dense: true },
      sidebars: { right: { show: { value: true }, type: "meta" } },
    },
  };
  const api = server.createRenderModeApi({
      afterApply({ ui }) {
        ui.header_secondary = { breadcrumb_entities: ["home"] };
      },
      baseUi: { header: {}, header_secondary: {}, sidebars: { left: {}, right: {} } },
      hydrateSidebar({ sidebar }) {
        return { ...sidebar, entity_counts: { all: 2 } };
      },
      modes,
  });
  const req = {};
  const res = serverResponseProbe();
  await api("app.detail")(req, res, (error) => {
      if (error) throw error;
  });
  assert.equal(res.locals.ui.header.type, "app");
  assert.equal(res.locals.ui.sidebars.left.entity_counts.all, 2);
  assert.equal(res.locals.ui.sidebars.right.type, "meta");
  assert.equal(res.locals.renderMode.app, true);
  assert.equal(res.locals.renderMode["app.detail"], true);
  assert.deepEqual(res.locals.ui.header_secondary.breadcrumb_entities, ["home"]);
  const toolkit = server.createFrontendRenderModeToolkit({
      baseUi: { header: {}, sidebars: { left: {}, right: {} } },
      modes,
  });
  const applyRes = serverResponseProbe();
  applyRes.locals = { ui: { header: {}, sidebars: { left: {}, right: {} } } };
  toolkit.applyUi(applyRes, "app", { header: { compact: true } });
  assert.equal(applyRes.locals.ui.header.type, "app");
  assert.equal(applyRes.locals.ui.header.compact, true);
  assert.equal(server.currentRenderModePath(res), "app.detail");
}

function verifySeoServer(server) {
  const store = server.createSeoStore({
      defaults: {
        contentLanguage: "cs",
        siteName: "App",
        titleSuffix: " | App",
      },
  });
  assert.equal(store.getSeo().contentLanguage, "cs");
  store.updateSeo({ metaDescription: "About" });
  assert.equal(store.getSeo().metaDescription, "About");
  const publicSeo = server.pickSeo({
      canonicalUrl: "https://example.test/about",
      index: true,
      metaDescription: "Public page",
      structuredData: [{ "@context": "https://schema.org", "@type": "WebSite" }],
      title: "About",
      verification: { google: "verify-token" },
    }, store.getSeo());
  assert.equal(publicSeo.robotsContent, "index, follow");
  assert.equal(publicSeo.ogTitle, "About");
  assert.equal(publicSeo.ogDescription, "Public page");
  assert.equal(publicSeo.ogUrl, "https://example.test/about");
  assert.equal(publicSeo.verification.google, "verify-token");
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
  const robots = server.robotsTxtContent({
      disallow: ["/private"],
      sitemapUrl: "https://example.test/sitemap.xml",
  });
  assert.ok(robots.includes("Disallow: /private"));
  assert.ok(robots.includes("Sitemap: https://example.test/sitemap.xml"));
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

async function verifyAssetServer(server) {
  const req = {
    headers: { "accept-encoding": "br" },
    path: "/js/app-0123456789abcdef.js",
  };
  const res = serverResponseProbe();
  const asset = server.prepareAsset({
      body: "const value = 1;".repeat(200),
      contentType: "text/javascript; charset=utf-8",
      etag: '"asset-a"',
  });
  server.sendAsset(req, res, asset);
  assert.equal(res.headers["Cache-Control"], "public, max-age=31536000, immutable");
  assert.equal(res.headers["Content-Type"], "text/javascript; charset=utf-8");
  assert.equal(res.headers.ETag, '"asset-a"');
  assert.ok(Number(res.headers["Content-Length"]) > 0);
  assert.equal(server.cacheControlForPercent(0).immutable, false);
  assert.equal(server.cacheControlForPercent(100).immutable, true);
}

function verifyLocaleServer(server) {
  const req = {
    headers: { "accept-language": "cs-CZ, en;q=0.5" },
    viewer: { locale: "" },
  };
  const res = serverResponseProbe();
  res.locals = {};
  const state = server.applyLocaleToLocals(req, res);
  assert.equal(state.request, "cs-CZ");
  assert.equal(state.effective, "cs-CZ");
  assert.deepEqual(res.locals.locale, state);
}

async function verifyPageTaskServer(server) {
  const ok = await server.runPageTask(async() => ({ ok: true }), {
      operation: "profile",
      page: "account",
  });
  assert.deepEqual(ok, { ok: true });
  const failed = await server.runPageTask(
    async() => {
      const error = new Error("boom");
      error.status = 418;
      error.status_code = "short-code";
      throw error;
    },
    { operation: "profile", page: "account" },
  );
  assert.equal(failed.ok, false);
  assert.equal(failed.status, 418);
  assert.equal(failed.status_code, "short-code");
}

function verifyReactRenderServer(server) {
  const renderer = server.createFrontendReactRenderer({
      buildAssetLinks: (entryIds) => ({
          cssLinks: `<link data-count="${entryIds.length}">`,
          jsLinks: "<script></script>",
      }),
      createElement: (component, props) => component(props),
      renderToStaticMarkup: (node) => String(node),
      renderToString: (node) => String(node),
      resolvePageComponent: (pageId) => (props) =>
      `<main data-page="${pageId}">${props.lang}</main>`,
      resolveRootDocument: () => (props) =>
      `<html><head>${props.jsLinks}</head><body>${props.body}</body></html>`,
      resolveTitle: (context) => `${context.pageTitle} | Test`,
  });
  const res = serverResponseProbe();
  res.locals = { lang: "cs", nonce: "nonce-a", seo: { title: "Home" } };
  renderer.renderPage(res, "platform/home", {});
  assert.ok(String(res.body).startsWith("<!DOCTYPE html>"));
  assert.ok(String(res.body).includes('nonce="nonce-a"'));
  assert.ok(String(res.body).includes('data-page="platform/home"'));
  assert.equal(res.locals.reactPageProps.lang, "cs");
  assert.equal(renderer.renderFragment((props) => `<span>${props.label}</span>`, {
        label: "A",
    }), "<span>A</span>");
}

export { verifyFrontendServer };
