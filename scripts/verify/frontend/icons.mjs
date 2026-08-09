import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

async function verifyIcons(context) {
  const iconRuntime = await context.importDistRoot();
  const iconServer = await context.importDist("server");
  const iconReact = await context.importDist("react");

  verifyIconParsing(iconRuntime);
  verifyIconServer(iconServer, context.rootDir);
  await verifyIconRuntime(iconRuntime);
  verifyIconReact(iconReact, iconServer, context.rootDir);
}

function verifyIconParsing(iconRuntime) {
  assert.deepEqual(iconRuntime.parseIconSpec("remixicon:add-line"), {
    icon: "add-line",
    pack: "remixicon",
    spec: "remixicon:add-line",
  });
  assert.deepEqual(iconRuntime.parseIconSpec("simple-icons github"), {
    icon: "github",
    pack: "simple-icons",
    spec: "simple-icons:github",
  });
}

function verifyIconServer(iconServer, rootDir) {
  const remixSvg = iconServer.resolveIconSvg("remixicon:add-line", { rootDir });
  assert.equal(remixSvg.ok, true);
  assert.ok(remixSvg.svg.includes("<svg"));
  const githubSvg = iconServer.resolveIconSvg("simple-icons:github", { rootDir });
  assert.equal(githubSvg.ok, true);
  assert.match(iconServer.resolveIconColor("simple-icons:github", { rootDir }), /^#[0-9a-f]{6}$/iu);
  assert.ok(iconServer.renderIconHtml("remixicon:add-line", {
    className: "icon md",
    color: "#123456",
    label: "Add",
  }, { rootDir }).includes("--tbf-icon-color: #123456"));
  verifyIconMiddleware(iconServer, rootDir);
}

function verifyIconMiddleware(iconServer, rootDir) {
  const response = iconServer.createIconSvgResponse("simple-icons:github", { rootDir });
  assert.equal(response.status, 200);
  assert.equal(response.headers["Content-Type"].startsWith("image/svg+xml"), true);
  let sent = "";
  iconServer.createIconMiddleware({ rootDir })(
    { query: { spec: "remixicon:add-line" } },
    responseCapture((body) => {
      sent = body;
    }),
  );
  assert.ok(sent.includes("<svg"));
}

function responseCapture(send) {
  return {
    set() {},
    status(value) {
      assert.equal(value, 200);
      return this;
    },
    type() {
      return this;
    },
    send,
  };
}

async function verifyIconRuntime(iconRuntime) {
  let fetchCount = 0;
  globalThis.fetch = async () => {
    fetchCount += 1;
    return new Response('<svg viewBox="0 0 1 1"><path d="M0 0h1v1H0z"/></svg>', {
      headers: { "Content-Type": "image/svg+xml" },
    });
  };
  const host = document.createElement("i");
  await iconRuntime.renderIconElement(host, "remixicon:add-line", { color: "red", endpoint: "/icons" });
  assert.equal(host.querySelector("svg") !== null, true);
  assert.equal(fetchCount, 1);
  const secondHost = document.createElement("i");
  await iconRuntime.renderIconElement(secondHost, "remixicon:add-line", { endpoint: "/icons" });
  assert.equal(fetchCount, 1);
}

function verifyIconReact(iconReact, iconServer, rootDir) {
  const renderer = iconServer.createServerIconRenderer({}, { rootDir });
  const html = iconServer.withIconServerRenderer(renderer, () => {
    return renderToStaticMarkup(h(iconReact.Icon, { label: "GitHub", spec: "simple-icons:github" }));
  });
  assert.ok(html.includes("aria-label=\"GitHub\""));
  assert.ok(html.includes("<svg"));
}

export { verifyIcons };
