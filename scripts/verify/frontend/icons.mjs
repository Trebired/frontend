import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
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
  assert.deepEqual(iconRuntime.parseIconSpec("material-icon-theme javascript"), {
      icon: "javascript",
      pack: "material-icon-theme",
      spec: "material-icon-theme:javascript",
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
  verifyCustomIconPack(iconServer);
}

function verifyCustomIconPack(iconServer) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tbf-custom-icons-"));
  const packRoot = path.join(tmp, "custom-icons");
  fs.mkdirSync(path.join(packRoot, "icons"), { recursive: true });
  fs.writeFileSync(
    path.join(packRoot, "package.json"),
    JSON.stringify({ name: "custom-icons", version: "1.0.0" }),
  );
  fs.writeFileSync(
    path.join(packRoot, "icons", "logo.svg"),
    '<svg viewBox="0 0 1 1"><path fill="#abcdef" d="M0 0h1v1H0z"/></svg>',
  );
  assert.equal(iconServer.resolveIconSvg("custom-icons:logo").ok, false);
  const options = {
    packageRoots: { "custom-icons": packRoot },
    packs: ["remixicon", "simple-icons", "custom-icons"],
  };
  const svg = iconServer.resolveIconSvg("custom-icons logo", options);
  assert.equal(svg.ok, true);
  assert.equal(svg.spec, "custom-icons:logo");
  assert.ok(iconServer.renderIconHtml("custom-icons:logo", {}, options).includes("data-tbf-icon=\"custom-icons:logo\""));
  assert.equal(iconServer.createIconSvgResponse("custom-icons:logo", options).status, 200);
  verifyMaterialIconHelpers(iconServer, tmp);
}

function verifyMaterialIconHelpers(iconServer, tmp) {
  const packRoot = path.join(tmp, "material-icon-theme");
  fs.mkdirSync(path.join(packRoot, "dist"), { recursive: true });
  fs.mkdirSync(path.join(packRoot, "icons"), { recursive: true });
  fs.writeFileSync(
    path.join(packRoot, "package.json"),
    JSON.stringify({ name: "material-icon-theme", version: "1.0.0" }),
  );
  fs.writeFileSync(
    path.join(packRoot, "icons", "javascript.svg"),
    '<svg viewBox="0 0 1 1"><path fill="#f7df1e" d="M0 0h1v1H0z"/></svg>',
  );
  fs.writeFileSync(
    path.join(packRoot, "icons", "folder-src.svg"),
    '<svg viewBox="0 0 1 1"><path fill="#90a4ae" d="M0 0h1v1H0z"/></svg>',
  );
  fs.writeFileSync(
    path.join(packRoot, "dist", "material-icons.json"),
    JSON.stringify({
        iconDefinitions: {
          javascript: { iconPath: "./../icons/javascript.svg" },
          "folder-src": { iconPath: "./../icons/folder-src.svg" },
        },
        fileExtensions: { js: "javascript" },
        folder: "folder-src",
        folderNames: { src: "folder-src" },
        languageIds: { javascript: "javascript" },
    }),
  );
  const options = {
    packageRoots: { "material-icon-theme": packRoot },
    packs: ["material-icon-theme"],
  };
  assert.equal(
    iconServer.resolveMaterialThemeIconSpec("javascript", options),
    "material-icon-theme:javascript",
  );
  assert.equal(
    iconServer.resolveMaterialFileIconSpec("index.js", "", options),
    "material-icon-theme:javascript",
  );
  assert.equal(
    iconServer.resolveMaterialFolderIconSpec("src", options),
    "material-icon-theme:folder-src",
  );
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
    set: ignoreResponseHeader,
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

function ignoreResponseHeader(_name, _value) {
  void _name;
  void _value;
  return undefined;
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
  await iconRuntime.renderIconElement(host, "remixicon:add-line", {
      className: "component-icon",
      color: "red",
      endpoint: "/icons",
  });
  assert.equal(host.querySelector("svg") !== null, true);
  assert.equal(host.classList.contains("component-icon"), true);
  await iconRuntime.renderIconElement(host, "remixicon:add-line", { endpoint: "/icons" });
  assert.equal(host.classList.contains("component-icon"), true);
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
