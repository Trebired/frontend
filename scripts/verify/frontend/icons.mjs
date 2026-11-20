import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { verifyBrandColorSurvivesHydration, verifyIconCallableFromComponentBody } from "./icons/react.mjs";

async function verifyIcons(context) {
  const iconRuntime = await context.importDistRoot();
  const iconServer = await context.importDist("server");
  const iconReact = await context.importDist("react");

  verifyIconParsing(iconRuntime);
  verifyIconAliases(iconRuntime);
  verifyEntityIconAliases(iconRuntime);
  verifyIconServer(iconServer, context.rootDir);
  verifyIconRegistry(iconServer, iconReact, context.rootDir);
  await verifyIconRegistryComponent(iconServer, iconReact, context.rootDir);
  await verifyIconRuntime(iconRuntime);
  verifyIconReact(iconReact, iconServer, context.rootDir);
  await verifyIconCallableFromComponentBody(iconReact);
  verifyBrandColorSurvivesHydration(iconRuntime, iconReact, iconServer, context.rootDir);
}

function verifyIconAliases(iconRuntime) {
  assert.equal(iconRuntime.defaultIconAliases.save, "remixicon:save-3-line");
  assert.equal(iconRuntime.defaultIconAliases.error, "remixicon:error-warning-line");
  const aliases = iconRuntime.normalizeIconAliasMap({
      add: "remixicon add-line",
      github: { pack: "simpleicons", icon: "github" },
  });
  assert.deepEqual(aliases, {
      add: "remixicon:add-line",
      github: "simple-icons:github",
  });
  assert.equal(iconRuntime.resolveIconAlias(aliases, "add"), "remixicon:add-line");
  assert.equal(
    iconRuntime.icons.resolveAlias(aliases, "missing", "remixicon close-line"),
    "remixicon:close-line",
  );
}

function verifyEntityIconAliases(iconRuntime) {
  const registry = {
    repositories: {
      aliases: ["repo"],
      icon: "remixicon git-repository-line",
    },
    user: {
      aliases: ["people"],
      icon: "remixicon user-line",
    },
  };
  assert.deepEqual(iconRuntime.entityKeyCandidates("repository"), [
      "repository",
      "repositorys",
      "repositoryes",
      "repositories",
  ]);
  assert.equal(
    iconRuntime.resolveEntityRegistryName(registry, "repo"),
    "repositories",
  );
  assert.equal(
    iconRuntime.resolveEntityIconSpec(registry, "repositories"),
    "remixicon:git-repository-line",
  );
  assert.equal(
    iconRuntime.mergeEntityIconAliases(registry, { repository: "remixicon archive-line" }).repository,
    "remixicon:archive-line",
  );
}

function verifyIconParsing(iconRuntime) {
  assert.equal(
    iconRuntime.iconSpec("material-icon-theme", "javascript"),
    "material-icon-theme:javascript",
  );
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
  const defaults = iconServer.createIconServerOptions({ rootDir });
  assert.deepEqual(defaults.packs, [
      "remixicon",
      "simple-icons",
      "material-icon-theme",
  ]);
  assert.deepEqual(defaults.preserveSourceColors, ["material-icon-theme"]);
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
  verifyStaticIconModule(iconServer, rootDir);
  verifyIconAliasLocals(iconServer);
  verifyCustomIconPack(iconServer);
}

function verifyIconAliasLocals(iconServer) {
  const middlewares = [];
  const app = {
    locals: {},
    use(handler) {
      middlewares.push(handler);
    },
  };
  const aliases = iconServer.attachIconAliasLocals(app, {
      add: "remixicon add-line",
  });
  assert.equal(aliases.add, "remixicon:add-line");
  assert.equal(aliases.close, "remixicon:close-line");
  assert.deepEqual(app.locals.icons, aliases);
  const res = { locals: {} };
  middlewares[0]({}, res, () => {});
  assert.deepEqual(res.locals.icons, aliases);
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

function verifyIconRegistry(iconServer, _iconReact, rootDir) {
  const renderer = iconServer.createServerIconRenderer({}, { rootDir });
  const html = iconServer.renderIconRegistryHtml(["remixicon add-line", "remixicon:add-line", "remixicon:no-such-icon"], renderer);
  assert.match(html, /^<div hidden data-tbf-icon-registry="">/u, "the registry is one hidden block");
  assert.equal((html.match(/data-tbf-icon="remixicon:add-line"/gu) || []).length, 1, "each icon is rendered once, whatever spelling asked for it");
  assert.ok(html.includes("<svg") && !html.includes("no-such-icon"), "known icons carry their svg, unknown ones are left out");
  assert.equal(iconServer.renderIconRegistryHtml(["remixicon:add-line"], null), "", "without a server renderer nothing is emitted");
  const entries = iconServer.renderIconRegistryEntries(["remixicon add-line"], renderer);
  assert.ok(entries["remixicon:add-line"].svg.includes("<svg"), "JSON payloads can carry the same svgs");
  const treeIcons = iconServer.renderFileTreeIconEntries([
      { children: [{ icon: "remixicon:add-line", kind: "file", name: "a" }], icon: "remixicon folder-line", kind: "dir", name: "src" },
    ], renderer);
  assert.deepEqual(Object.keys(treeIcons).sort(), [
      "remixicon:add-line",
      "remixicon:folder-line"
    ], "a file tree payload carries the svgs of every icon in it");
  for (const spec of iconServer.RUNTIME_ICON_SPECS) {
    assert.ok(renderer(spec), `${spec} is created in the browser by tbf and must render on the server`);
  }
}

async function verifyIconRegistryComponent(iconServer, iconReact, rootDir) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  const renderer = iconServer.createServerIconRenderer({}, { rootDir });
  const html = iconServer.withIconServerRenderer(renderer, () =>
    renderToStaticMarkup(createElement(iconReact.IconRegistry, { specs: ["remixicon:add-line", "remixicon add-line"] })));
  assert.match(html, /^<div hidden="" data-tbf-icon-registry="">/u, "IconRegistry renders a hidden block");
  assert.equal((html.match(/<svg/gu) || []).length, 1, "IconRegistry inlines each icon once");
  assert.equal(renderToStaticMarkup(createElement(iconReact.IconRegistry, { specs: [] })), "", "an empty registry renders nothing");
}

function verifyStaticIconModule(iconServer, rootDir) {
  const cache = iconServer.buildStaticIconCache([
      "remixicon:add-line",
      "remixicon:missing-static-icon",
    ], { rootDir });
  const source = iconServer.renderStaticIconCacheModule(cache);

  assert.ok(cache["remixicon:add-line"].svg.includes("<svg"));
  assert.equal(cache["remixicon:missing-static-icon"], undefined);
  assert.ok(source.includes("registerStaticIcons"));
  assert.ok(source.includes("\\u003csvg"));
  assert.throws(() => iconServer.buildStaticIconCache(
      ["remixicon:missing-static-icon"],
      { rootDir, strict: true },
    ), /frontend-static-icon-missing/u);
}

async function verifyIconRuntime(iconRuntime) {
  let fetchCount = 0;
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async() => {
    fetchCount += 1;
    return new Response("<svg></svg>");
  };
  const registration = iconRuntime.registerStaticIcons({
      "remixicon:static-line": '<svg viewBox="0 0 1 1"><path d="M0 0h1v1H0z"/></svg>',
  });
  const staticHost = document.createElement("i");
  iconRuntime.renderIconElement(staticHost, "remixicon:static-line", { className: "component-icon", color: "red" });
  document.body.innerHTML = '<div hidden data-tbf-icon-registry=""><i data-tbf-icon="remixicon:page-line"><svg viewBox="0 0 2 2"></svg></i></div>';
  const pageHost = document.createElement("i");
  iconRuntime.renderIconElement(pageHost, "remixicon page-line");
  const missingHost = document.createElement("i");
  iconRuntime.renderIconElement(missingHost, "remixicon:missing-line");
  iconRuntime.renderIconElement(document.createElement("i"), "remixicon:missing-line");
  await new Promise((resolve) => setTimeout(resolve, 10));
  globalThis.fetch = previousFetch;
  document.body.innerHTML = "";

  assert.equal(registration.registered, 1);
  assert.ok(staticHost.querySelector("svg") && staticHost.classList.contains("component-icon"), "a registered icon renders at once");
  assert.ok(pageHost.querySelector("svg"), "an icon the server put on the page renders without a request");
  assert.equal(missingHost.querySelector("svg"), null, "an icon the server did not send stays empty");
  assert.equal(fetchCount, 0, "the browser never fetches an icon");
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
