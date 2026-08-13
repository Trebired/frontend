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
          cssLinks: `<link data-count="${entryIds.length}">`,
          jsLinks: "<script></script>",
      }),
      createElement: (component, props) => component(props),
      logger: (event) => events.push(event),
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

function verifyRequestLogServer(server) {
  const app = appCapture();
  app.set = function set(key, value) {
    this.settings ||= {};
    this.settings[key] = value;
  };
  const events = [];
  server.attachFrontendRequestLogger(app, {
      logger: (event) => events.push(event),
      quietSuccessRoutes: ["GET /quiet"],
      trustProxy: 1,
  });
  assert.equal(app.settings["trust proxy"], 1);

  const middleware = app.middlewares[0];
  const okRes = eventResponse({ statusCode: 200 });
  middleware({
      headers: {},
      ip: "127.0.0.1",
      method: "GET",
      originalUrl: "/welcome",
    }, okRes, () => {});
  okRes.emit("finish");
  assert.equal(events[0].group, "trebired.frontend.client.http");
  assert.equal(events[0].level, "success");

  const probeRes = eventResponse({ statusCode: 404 });
  middleware({
      headers: {},
      method: "GET",
      originalUrl: "/.well-known/appspecific/com.chrome.devtools.json",
    }, probeRes, () => {});
  probeRes.emit("finish");
  assert.equal(events.length, 1);

  const failRes = eventResponse({ statusCode: 404 });
  middleware({
      headers: {},
      method: "GET",
      originalUrl: "/missing",
    }, failRes, () => {});
  failRes.emit("finish");
  assert.equal(events[1].group, "trebired.frontend.client.http");
  assert.equal(events[1].level, "warn");
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
  verifyReactRenderServer,
  verifyRequestLogServer,
};
