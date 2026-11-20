import assert from "node:assert/strict";

function memoryStore() {
  const rows = new Map();
  const writes = [];
  const changes = [];
  return {
    changes,
    rows,
    writes,
    options: {
      onChange: (viewerId, pages) => changes.push([viewerId, pages.map((page) => page.href)]),
      read: (viewerId) => rows.get(viewerId) || [],
      write: (viewerId, pages) => {
        writes.push(viewerId);
        rows.set(viewerId, pages);
      },
    },
  };
}

function visitResponse(url, options = {}) {
  return {
    req: { headers: options.headers || {}, method: options.method || "GET", originalUrl: url },
    statusCode: options.status || 200,
  };
}

function visitContext(url, title, viewer = { id: "u1" }) {
  return { currentUrl: url, pageTitle: title, shell: { viewer } };
}

function verifyRecentModel(server) {
  const pages = server.normalizeRecentPages([
      { href: "/a", title: "A", visitedAt: "2026-01-01T00:00:00.000Z" },
      { href: "/api/x", title: "Api", visitedAt: "2026-01-02T00:00:00.000Z" },
      { href: "https://evil.example/", title: "Evil", visitedAt: "2026-01-03T00:00:00.000Z" },
      { href: "/b?tab=x", title: "B", visitedAt: "2026-01-04T00:00:00.000Z" },
      { href: "/c", title: "", visitedAt: "2026-01-05T00:00:00.000Z" },
  ]);
  assert.deepEqual(pages.map((page) => page.href), ["/b?tab=x", "/a"], "only same-site page visits are kept, newest first");
}

async function verifyRecentRecorder(server) {
  const store = memoryStore();
  const recent = server.createRecentPages({ ...store.options, limit: 3 });
  await recent.record(visitResponse("/one"), visitContext("/one", "One"));
  await recent.record(visitResponse("/two", { headers: { "x-requested-with": "tbf-router" } }), visitContext("/two", "Two"));
  await recent.record(visitResponse("/one"), visitContext("/one", "One"));
  assert.deepEqual((await recent.read("u1")).map((page) => page.href), ["/one", "/two"], "a page visited again moves to the top once");
  const before = store.writes.length;
  await recent.record(visitResponse("/two", { headers: { "x-requested-with": "tbf-live" } }), visitContext("/two", "Two"));
  await recent.record(visitResponse("/missing", { status: 404 }), visitContext("/missing", "Missing"));
  await recent.record(visitResponse("/form", { method: "POST" }), visitContext("/form", "Form"));
  await recent.record(visitResponse("/anon"), visitContext("/anon", "Anon", null));
  assert.equal(store.writes.length, before, "live refreshes, errors, posts and signed-out visits are not recorded");
  for (const href of ["/three", "/four"]) await recent.record(visitResponse(href), visitContext(href, href));
  assert.deepEqual((await recent.read("u1")).map((page) => page.href), ["/four", "/three", "/one"], "the list keeps the limit");
  await recent.record(visitResponse("/four"), visitContext("/four", "/four"));
  assert.equal(store.changes.length, 5, "onChange fires only when the newest page changes");
}

async function verifyRecentRenderer(server) {
  const store = memoryStore();
  const renderer = server.createFrontendReactRenderer({
      buildAssetLinks: () => ({}),
      createElement: (component, props) => component(props),
      recentPages: server.createRecentPages(store.options),
      renderToString: (node) => String(node),
      resolvePageComponent: () => () => "<main></main>",
      resolveRootDocument: () => (props) => `<html><body>${props.body}</body></html>`,
  });
  const res = { locals: { seo: { title: "Settings" }, viewer: { id: "u9" } }, req: { method: "GET", originalUrl: "/settings" }, send() {} };
  renderer.renderPage(res, "settings", {});
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.deepEqual(store.rows.get("u9").map((page) => [page.href, page.title]), [["/settings", "Settings"]],
  "every rendered page is recorded on the server, with no request from the browser");
}

async function verifyRecentComponent(react) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  const pages = [
    { href: "/here", title: "Here", visitedAt: new Date().toISOString() },
    { href: "/there", title: "There", visitedAt: new Date().toISOString() },
  ];
  const html = renderToStaticMarkup(createElement(react.RenderCurrentUrlProvider, { currentUrl: "/here" },
      createElement(react.RecentPages, { live: { channel: "/users", event: "recent-pages", room: "user:u1" }, pages })));
  assert.ok(html.includes('href="/there"') && !html.includes('href="/here"'), "the page you are on is not listed");
  assert.ok(html.includes('data-tbf-live-region="recent-pages"'), "with live set, the list refreshes from the server");
  const empty = renderToStaticMarkup(createElement(react.RecentPages, { lang: "cs", pages: [] }));
  assert.ok(empty.includes("Zatím nic navštíveno."), "the empty text is localized");
}

async function verifyRecentPages(context) {
  const server = await context.importDist("server");
  const react = await context.importDist("react");
  verifyRecentModel(server);
  await verifyRecentRecorder(server);
  await verifyRecentRenderer(server);
  await verifyRecentComponent(react);
}

export { verifyRecentPages };
