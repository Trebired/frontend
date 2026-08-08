import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Window } from "happy-dom";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fileURLToPath, pathToFileURL } from "node:url";
import { verifyFrontendComponents } from "./frontend/components.mjs";
import { verifyFrontendSource } from "./frontend/source.mjs";
import { verifyFrontendTheme } from "./frontend/theme.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const distDir = path.join(rootDir, "dist");
const sourceDir = path.join(rootDir, "src");

async function main() {
  installDom();
  await verifyFrontendConfig();
  await verifyCsrfFetch();
  await verifyIcons();
  await verifyActionConfetti();
  await verifyFlash();
  await verifyTooltip();
  await verifyModal();
  await verifyUpload();
  await verifyFrontendLogging();
  await verifyFrontendSource({ distDir, rootDir, sourceDir });
  await verifyFrontendComponents({ importDist, rootDir });
  await verifyFrontendTheme({ importDist, rootDir });
  console.log("Frontend verification succeeded.");
}

function installDom() {
  const window = new Window({ url: "https://example.test/current" });
  Object.assign(globalThis, {
    Blob: window.Blob,
    CustomEvent: window.CustomEvent,
    DOMParser: window.DOMParser,
    Document: window.Document,
    DocumentFragment: window.DocumentFragment,
    Element: window.Element,
    Event: window.Event,
    File: window.File,
    FormData: window.FormData,
    HTMLButtonElement: window.HTMLButtonElement,
    HTMLElement: window.HTMLElement,
    HTMLFormElement: window.HTMLFormElement,
    HTMLInputElement: window.HTMLInputElement,
    HTMLTextAreaElement: window.HTMLTextAreaElement,
    MouseEvent: window.MouseEvent,
    MutationObserver: window.MutationObserver,
    Node: window.Node,
    SVGElement: window.SVGElement,
    SubmitEvent: window.SubmitEvent,
    document: window.document,
    getComputedStyle: window.getComputedStyle.bind(window),
    history: window.history,
    location: window.location,
    navigator: window.navigator,
    requestAnimationFrame: (callback) => setTimeout(callback, 0),
    window,
  });
  window.requestAnimationFrame = globalThis.requestAnimationFrame;
  window.CSS ||= {};
  window.CSS.escape = (value) => String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  globalThis.CSS = window.CSS;
}

async function verifyFrontendConfig() {
  const config = await importDist("config");
  const fixture = path.join(rootDir, ".tmp", "verify-frontend", "config");
  await fs.rm(fixture, { force: true, recursive: true });
  await fs.mkdir(path.join(fixture, ".trebired", "frontend"), { recursive: true });

  const defaults = await config.loadTrebiredFrontendConfig(fixture);
  assert.equal(defaults.configPath, null);
  assert.equal(defaults.config.prefix, "tbf");
  assert.ok(defaults.generatedScss.includes('@use "@trebired/frontend/modal/styles" as *;'));

  const configPath = path.join(fixture, ".trebired", "frontend", "config.ts");
  await fs.writeFile(configPath, [
    "export default {",
    "  prefix: \"app\",",
    "  icons: { packs: [\"simple-icons\"], endpoint: \"/icons/svg\" },",
    "  systems: { modal: false, icons: true },",
    "  theme: { cssVariables: true, tokens: { color: { brand: \"#123456\" } } },",
    "};",
    "",
  ].join("\n"));

  const loaded = await config.loadTrebiredFrontendConfig(fixture);
  assert.equal(loaded.configPath, configPath);
  assert.deepEqual(loaded.config.icons.packs, ["simple-icons"]);
  assert.equal(loaded.generatedScss.includes('@use "@trebired/frontend/modal/styles" as *;'), false);
  assert.ok(loaded.generatedScss.includes("--app-color-brand: #123456;"));
  assert.equal(typeof config.writeGeneratedTrebiredFrontendScss, "undefined");
  await assert.rejects(
    () => fs.access(path.join(fixture, ".trebired", "frontend", "generated", "styles.scss")),
    /ENOENT/u,
  );

  await fs.writeFile(configPath, "export default { prefix: \"bad prefix\" };\n");
  await assert.rejects(() => config.loadTrebiredFrontendConfig(fixture), /invalid-config/u);
}

async function verifyIcons() {
  const iconRuntime = await importDist("icons");
  const iconServer = await importDist("icons/server");
  const iconMiddleware = await importDist("icons/middleware");
  const iconReact = await importDist("icons/react");

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

  const response = iconServer.createIconSvgResponse("simple-icons:github", { rootDir });
  assert.equal(response.status, 200);
  assert.equal(response.headers["Content-Type"].startsWith("image/svg+xml"), true);

  let sent = "";
  const middleware = iconMiddleware.createIconMiddleware({ rootDir });
  middleware(
    { query: { spec: "remixicon:add-line" } },
    {
      set() {},
      status(value) {
        assert.equal(value, 200);
        return this;
      },
      type() {
        return this;
      },
      send(body) {
        sent = body;
      },
    },
  );
  assert.ok(sent.includes("<svg"));

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

  const renderer = iconServer.createServerIconRenderer({}, { rootDir });
  const html = iconServer.withIconServerRenderer(renderer, () => {
    return renderToStaticMarkup(h(iconReact.Icon, { label: "GitHub", spec: "simple-icons:github" }));
  });
  assert.ok(html.includes("aria-label=\"GitHub\""));
  assert.ok(html.includes("<svg"));
}

async function verifyCsrfFetch() {
  const { csrfFetch } = await importDist("http");
  document.head.innerHTML = '<meta name="csrf-token" content="token-a">';
  let captured = null;
  globalThis.fetch = async (_input, init) => {
    captured = init;
    return new Response("{}", { headers: { "Content-Type": "application/json" } });
  };
  await csrfFetch("/endpoint", { method: "POST" });
  assert.equal(captured.credentials, "same-origin");
  assert.equal(new Headers(captured.headers).get("X-CSRF-Token"), "token-a");
}

async function verifyActionConfetti() {
  const { submitActionButton } = await importDist("actions");
  let count = 0;
  document.addEventListener("tbf:confetti", () => {
    count += 1;
  });
  globalThis.fetch = async () => {
    return new Response(JSON.stringify({ ok: true, message: "Saved." }), {
      headers: { "Content-Type": "application/json" },
    });
  };
  const plain = document.createElement("button");
  await submitActionButton(plain, undefined, { url: "/ok" });
  assert.equal(count, 0);
  const configured = document.createElement("button");
  configured.setAttribute("data-tbf-confetti", "true");
  await submitActionButton(configured, undefined, { url: "/ok" });
  assert.equal(count, 1);
}

async function verifyFlash() {
  const { confirm, prompt, showFlash } = await importDist("flash");
  const handle = showFlash.success("Saved", "Done");
  assert.ok(handle.element.matches("[data-tbf-flash]"));
  const confirmPromise = confirm("Confirm");
  document.querySelector(".tbf-button--strong").click();
  assert.equal(await confirmPromise, true);
  const promptPromise = prompt("Name");
  const input = document.querySelector(".tbf-flash__form input");
  input.value = "Atlas";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  document.querySelector(".tbf-flash__form").dispatchEvent(
    new SubmitEvent("submit", { bubbles: true, cancelable: true }),
  );
  assert.equal(await promptPromise, "Atlas");
}

async function verifyTooltip() {
  const { bindTooltips } = await importDist("tooltip");
  document.body.innerHTML = [
    '<button id="tip" title="Hover text">A</button>',
    '<button id="focus" data-tbf-tooltip="Focus text">B</button>',
    '<span id="status" tabindex="0" data-tbf-status-icon aria-label="Status text"></span>',
  ].join("");
  bindTooltips(document);
  document.getElementById("tip").dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
  assert.equal(document.getElementById("tbf_tooltip").textContent, "Hover text");
  document.getElementById("focus").dispatchEvent(new Event("focusin", { bubbles: true }));
  assert.equal(document.getElementById("tbf_tooltip").textContent, "Focus text");
  document.getElementById("status").dispatchEvent(new Event("focusin", { bubbles: true }));
  assert.equal(document.getElementById("tbf_tooltip").textContent, "Status text");
}

async function verifyModal() {
  const { bindModals } = await importDist("modal");
  document.body.innerHTML = [
    '<button data-tbf-modal-open aria-controls="m1">Open</button>',
    '<div id="m1" data-tbf-modal><div data-tbf-modal-content>Body</div></div>',
  ].join("");
  const modal = document.getElementById("m1");
  const content = modal.querySelector("[data-tbf-modal-content]");
  bindModals(document);
  assert.equal(modal.getAttribute("aria-hidden"), "true");
  assert.equal(modal.hasAttribute("data-tbf-open"), false);
  assert.equal(modal.hasAttribute("data-tbf-opening"), false);
  assert.equal(content.style.top, "");
  assert.equal(content.style.left, "");
}

async function verifyUpload() {
  const {
    bindUploadRoot,
    createUploadField,
    getUploadFiles,
    matchesAccept,
    setUploadFiles,
    uploadFieldHtml,
  } = await importDist("inputs");
  const html = uploadFieldHtml(fullUploadOptions());
  assertUploadMarkup(html);
  const element = createUploadField(fullUploadOptions());
  document.body.appendChild(element);
  bindUploadRoot(element);
  const file = new File(["x"], "avatar.png", { type: "image/png" });
  assert.equal(setUploadFiles(element, [file]), true);
  assert.equal(getUploadFiles(element).length, 1);
  assert.equal(element.querySelector('[data-tbf-upload-slot="filename"]').textContent, "avatar.png");
  assert.equal(matchesAccept(file, ["image/*"]), true);
  assertUploadMarkup(element.outerHTML);
}

function fullUploadOptions() {
  return {
    accept: "image/png,.jpg",
    crop: true,
    directory: true,
    drop: true,
    dropDirectory: true,
    emptyToggle: { name: "file_empty", value: "1" },
    emptyLabel: "Choose",
    mixedPicker: true,
    multiple: true,
    name: "file",
    preview: true,
    previewUrl: "/preview.png",
  };
}

function assertUploadMarkup(html) {
  assert.equal(/class=["'][^"']*\bwrap\b/iu.test(html), false);
  [
    "native-file",
    "native-directory",
    "crop-field",
    "preview",
    "preview-image",
    "preview-empty",
    "shell",
    "file-trigger",
    "directory-trigger",
    "clear",
    "filename",
    "list",
    "empty-toggle",
  ].forEach((slot) => {
    assert.ok(html.includes(`data-tbf-upload-slot="${slot}"`), `missing upload slot ${slot}`);
  });
}

async function verifyFrontendLogging() {
  const { bindFrontendRuntime } = await importDistRoot();
  const events = [];
  const adapter = (_source, event) => events.push(event);
  bindFrontendRuntime(document, {
    adapters: { logger: {}, loggerAdapter: adapter },
    observe: false,
  });
  assert.equal(events.length, 1);
  assert.equal(events[0].group, `${organizationName()}.frontend.runtime`);
  events.length = 0;
  bindFrontendRuntime(document, {
    adapters: { logger: {}, loggerAdapter: adapter },
    frontend_quiet: true,
    observe: false,
  });
  assert.equal(events.length, 0);
}

function organizationName() {
  return String.fromCharCode(116, 114, 101, 98, 105, 114, 101, 100);
}

async function importDistRoot() {
  const url = pathToFileURL(path.join(rootDir, "dist", "index.js"));
  return import(`${url.href}?v=${Date.now()}-${Math.random()}`);
}

async function importDist(subpath) {
  const url = pathToFileURL(path.join(rootDir, "dist", subpath, "index.js"));
  return import(`${url.href}?v=${Date.now()}-${Math.random()}`);
}

await main();
