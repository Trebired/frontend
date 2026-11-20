import assert from "node:assert/strict";
import { appCapture, serverResponseProbe } from "./probe.mjs";

function eventResponse(options = {}) {
  const listeners = {};
  return {
    headers: { ...(options.headers || {}) },
    headersSent: false,
    statusCode: options.statusCode || 200,
    writableEnded: false,
    emit(name) {
      for (const listener of listeners[name] || []) listener();
    },
    getHeader(name) {
      return this.headers[name] || this.headers[name.toLowerCase()];
    },
    on(name, listener) {
      listeners[name] ||= [];
      listeners[name].push(listener);
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
      this.headers[name.toLowerCase()] = value;
    },
    writeHead() {
      this.headersSent = true;
      return this;
    },
  };
}

function verifyReactRenderServer(server) {
  const events = [];
  const renderer = server.createFrontendReactRenderer({
      buildAssetLinks: (entryIds) => ({
          cssLinks: `<link data-tbf-count="${entryIds.length}">`,
          jsLinks: "<script></script>",
      }),
      createElement: (component, props) => component(props),
      logger: (event) => events.push(event),
      renderToStaticMarkup: (node) => String(node),
      renderToString: (node) => String(node),
      resolvePageComponent: (pageId) => (props) =>
      `<main data-tbf-page="${pageId}">${props.lang}</main>`,
      resolveRootDocument: () => (props) =>
      `<html><head>${props.jsLinks}</head><body>${props.body}</body></html>`,
      resolveTitle: (context) => `${context.pageTitle} | Test`,
  });
  const res = serverResponseProbe();
  res.locals = { lang: "cs", nonce: "nonce-a", seo: { title: "Home" } };
  renderer.renderPage(res, "platform/home", {});
  assert.ok(String(res.body).startsWith("<!DOCTYPE html>"));
  assert.ok(String(res.body).includes('nonce="nonce-a"'));
  assert.ok(String(res.body).includes('data-tbf-page="platform/home"'));
  assert.equal(res.locals.reactPageProps.lang, "cs");
  assert.deepEqual(
    events.map((event) => event.group),
    [
      "trebired.frontend.react.render",
      "trebired.frontend.react.render",
      "trebired.frontend.react.render",
    ],
  );
  assert.deepEqual(
    events.map((event) => event.message),
    [
      "resolved react page component",
      "resolved react root document",
      "rendering react document",
    ],
  );
  assert.equal(renderer.renderFragment((props) => `<span>${props.label}</span>`, {
        label: "A",
    }), "<span>A</span>");
}

async function verifyDocumentRendersInPageLanguage(server) {
  const { time } = await import("@trebired/utils");
  const fiveDaysAgo = new Date(Date.now() - 5 * 86_400_000 - 60_000).toISOString();
  const renderNode = (node) => (node && typeof node.component === "function" ? renderNode(node.component(node.props)) : String(node));
  const renderer = server.createFrontendReactRenderer({
      buildAssetLinks: () => ({}),
      createElement: (component, props) => ({ component, props }),
      renderToString: renderNode,
      resolvePageComponent: () => () => `<main>${time(fiveDaysAgo, "rel_long")}</main>`,
      resolveRootDocument: () => (props) => `<html><body>${renderNode(props.body)}</body></html>`,
  });
  const res = serverResponseProbe();
  res.locals = { lang: "cs" };
  renderer.renderPage(res, "home", {});
  assert.ok(String(res.body).includes("před 5 dny"), "dates and times formatted during a render use the page's language");
  assert.equal(time(fiveDaysAgo, "rel_long"), "5 days ago", "outside a render the language is not left behind");
}

function verifyDocumentCarriesRuntimeIcons(server) {
  const base = {
    buildAssetLinks: () => ({}),
    createElement: (component, props) => component(props),
    renderToString: (node) => String(node),
    resolvePageComponent: () => () => "<main></main>",
    resolveRootDocument: () => (props) => `<html><body>${props.body}</body></html>`,
  };
  const plain = serverResponseProbe();
  server.createFrontendReactRenderer(base).renderPage(plain, "home", {});
  assert.ok(!String(plain.body).includes("data-tbf-icon-registry"), "without a server icon renderer no registry is added");
  const res = serverResponseProbe();
  server.createFrontendReactRenderer({
      ...base,
      createIconRenderer: () => (spec) => ({ normalizedSpec: spec.replace(" ", ":"), svg: "<svg></svg>" }),
  }).renderPage(res, "home", {});
  const body = String(res.body);
  assert.match(body, /<main><\/main><div hidden data-tbf-icon-registry="">.*<\/div><\/body><\/html>$/u,
  "the document ends its body with the icons tbf builds in the browser");
  assert.ok(body.includes('data-tbf-icon="remixicon:draggable"'), "the file tree drag handle ships with the page");
}

function verifyPerformanceServer(server) {
  const app = appCapture();
  const events = [];
  server.attachFrontendPerformanceMiddleware(app, {
      logger: (event) => events.push(event),
      readServerTiming: () => true,
      readSlowRequestMs: () => 0,
  });
  const res = eventResponse({
      headers: { "content-type": "text/html; charset=utf-8" },
      statusCode: 200,
  });
  app.middlewares[0]({
      method: "GET",
      originalUrl: "/welcome",
    }, res, () => {
      server.recordDbQuery(4, { label: "read", op: "select" });
      server.recordRender(3);
      server.recordAsset(2);
      res.writeHead(200);
      res.emit("finish");
  });

  assert.ok(String(res.headers["Server-Timing"]).includes("render"));
  assert.equal(events[0].group, "trebired.frontend.performance.request");
  assert.equal(events[0].message, "page request");
  assert.equal(events[0].metadata.db_count, 1);
  assert.equal(events[0].metadata.render_count, 1);
  assert.equal(events[0].metadata.asset_count, 1);
}

export {
  verifyPerformanceServer,
  verifyDocumentCarriesRuntimeIcons,
  verifyDocumentRendersInPageLanguage,
  verifyReactRenderServer,
};
