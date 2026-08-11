import assert from "node:assert/strict";
import path from "node:path";
import { Window } from "happy-dom";
import { fileURLToPath, pathToFileURL } from "node:url";
import { verifyFrontendConfig } from "./frontend/config.mjs";
import { verifyFrontendComponents } from "./frontend/components.mjs";
import { verifyFlash } from "./frontend/flash.mjs";
import { verifyIcons } from "./frontend/icons.mjs";
import { verifyNamespace, verifyPopover } from "./frontend/runtime.mjs";
import { verifyFrontendServer } from "./frontend/server.mjs";
import { verifyFrontendSource } from "./frontend/source.mjs";
import { verifyFrontendTheme } from "./frontend/theme.mjs";
import { packageName, workspaceConfigDir } from "#kdfvp4fq2m77";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const distDir = path.join(rootDir, "dist");
const sourceDir = path.join(rootDir, "src");

async function verifyFrontendMain() {
  const configDirName = await workspaceConfigDir(rootDir);
  const context = {
    configDirName,
    configRelPath: `${configDirName}/frontend/config.ts`,
    distDir,
    importDist,
    importDistRoot,
    packageName: await packageName(rootDir),
    rootDir,
    sourceDir,
  };
  installDom();
  await verifyFrontendConfig(context);
  await verifyNamespace(context);
  await verifyCsrfFetch();
  await verifyIcons(context);
  await verifyActionConfetti();
  await verifyFlash(context);
  await verifyTooltip();
  await verifyPopover(context);
  await verifyModal();
  await verifyLayout();
  await verifyFullscreen();
  await verifySidebar();
  await verifyUpload();
  await verifyFrontendLogging(context);
  await verifyFrontendSource(context);
  await verifyFrontendServer(context);
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

async function verifyTooltip() {
  const { bindTooltips } = await importDist("tooltip");
  document.body.innerHTML = [
    '<button id="tip" title="Hover text">A</button>',
    '<button id="focus" data-tbf-tooltip="Focus text">B</button>',
    '<span id="status" tabindex="0" data-tbf-status-icon aria-label="Status text"></span>',
  ].join("");
  bindTooltips(document);
  document.getElementById("tip").dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
  const layer = document.getElementById("tbf_tooltip");
  assert.equal(layer.textContent, "Hover text");
  assert.equal(layer.getAttribute("role"), "tooltip");
  assert.equal(layer.getAttribute("aria-hidden"), "false");
  assert.equal(layer.getAttribute("data-tbf-placement"), "bottom");
  assert.ok(layer.style.getPropertyValue("--tbf-arrow-x"));
  document.getElementById("tip").dispatchEvent(new MouseEvent("mouseleave", { bubbles: false }));
  assert.equal(layer.getAttribute("aria-hidden"), "true");
  assert.equal(layer.hasAttribute("data-tbf-open"), false);
  document.getElementById("focus").dispatchEvent(new Event("focusin", { bubbles: true }));
  assert.equal(layer.textContent, "Focus text");
  document.getElementById("status").dispatchEvent(new Event("focusin", { bubbles: true }));
  assert.equal(layer.textContent, "Status text");
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

async function verifyLayout() {
  const { bindLayouts, createLayoutBootScript, ensureLayoutPortalRoot } = await importDist("layout");
  document.body.innerHTML = [
    '<div data-tbf-layout-root>',
    '<div data-tbf-sidebar-shell data-tbf-sidebar-side="left"></div>',
    '<main data-tbf-layout-main><div data-tbf-layout-content>Body</div></main>',
    '<nav data-tbf-layout-bottom-bar></nav>',
    '</div>',
  ].join("");
  bindLayouts(document);
  assert.equal(document.body.getAttribute("data-tbf-layout"), "true");
  assert.equal(document.body.getAttribute("data-tbf-sidebar-left"), "true");
  assert.equal(document.body.getAttribute("data-tbf-sidebar-right"), "false");
  assert.equal(document.body.getAttribute("data-tbf-layout-mobile"), "true");
  assert.equal(document.querySelector("[data-tbf-layout-root]").getAttribute("data-tbf-layout-bound"), "true");
  assert.equal(ensureLayoutPortalRoot().id, "tbf_layout_portal_root");
  assert.ok(createLayoutBootScript({ hasLeftSidebar: true }).includes("data-tbf-sidebar-left"));
}

async function verifyFullscreen() {
  const { bindFullscreen, closeFullscreenTarget } = await importDist("fullscreen");
  document.body.innerHTML = [
    '<button id="full-open" data-tbf-fullscreen-trigger data-tbf-fullscreen-id="panel" data-tbf-fullscreen-group="main" ' +
      'data-tbf-fullscreen-mode="open">Open</button>',
    '<button id="full-close" data-tbf-fullscreen-trigger data-tbf-fullscreen-id="panel" data-tbf-fullscreen-group="main" ' +
      'data-tbf-fullscreen-mode="close">Close</button>',
    '<div id="panel" data-tbf-fullscreen-target data-tbf-fullscreen-id="panel" data-tbf-fullscreen-group="main">Panel</div>',
  ].join("");
  bindFullscreen(document);
  document.getElementById("full-open").click();
  const panel = document.getElementById("panel");
  assert.equal(panel.getAttribute("data-tbf-fullscreen-active"), "true");
  assert.equal(document.querySelector("[data-tbf-fullscreen-overlay]") !== null, true);
  assert.equal(document.getElementById("full-open").getAttribute("data-tbf-fullscreen-hidden"), "true");
  assert.equal(document.getElementById("full-close").getAttribute("data-tbf-fullscreen-hidden"), "false");
  closeFullscreenTarget({ immediate: true });
  assert.equal(panel.hasAttribute("data-tbf-fullscreen-active"), false);
  assert.equal(document.querySelector("[data-tbf-fullscreen-overlay]"), null);
}

async function verifySidebar() {
  const { bindSidebars } = await importDist("sidebar");
  document.body.innerHTML = [
    '<button id="sidebar-min" data-tbf-sidebar-minimize aria-controls="side">Toggle</button>',
    '<button id="sidebar-open" data-tbf-sidebar-open aria-controls="side">Open</button>',
    '<div id="side" data-tbf-sidebar-shell data-tbf-sidebar-side="left">',
    '<aside data-tbf-sidebar>',
    '<button id="sidebar-close" data-tbf-sidebar-close>Close</button>',
    '</aside>',
    '</div>',
  ].join("");
  bindSidebars(document);
  const shell = document.getElementById("side");
  assert.equal(shell.getAttribute("data-tbf-sidebar-minimized"), "false");
  document.getElementById("sidebar-min").click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(shell.getAttribute("data-tbf-sidebar-minimized"), "true");
  assert.equal(document.body.getAttribute("data-tbf-sidebar-left-minimized"), "true");
  document.getElementById("sidebar-open").click();
  assert.equal(shell.getAttribute("data-tbf-sidebar-open"), "true");
  document.getElementById("sidebar-close").click();
  assert.equal(shell.getAttribute("data-tbf-sidebar-open"), "false");
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

      async function verifyFrontendLogging(context) {
      const { bindFrontendRuntime } = await importDistRoot();
      const events = [];
      const adapter = (_source, event) => events.push(event);
      bindFrontendRuntime(document, {
      adapters: { logger: {}, loggerAdapter: adapter },
      observe: false,
      });
      assert.equal(events.length, 1);
      assert.equal(events[0].group, "frontend.runtime");
      events.length = 0;
      bindFrontendRuntime(document, {
      adapters: { logger: {}, loggerAdapter: adapter },
      frontend_quiet: true,
      observe: false,
      });
      assert.equal(events.length, 0);
      }

      async function importDistRoot() {
      const url = pathToFileURL(path.join(rootDir, "dist", "index.js"));
      return import(`${url.href}?v=${Date.now()}-${Math.random()}`);
      }

      async function importDist(subpath) {
      const url = pathToFileURL(path.join(rootDir, "dist", subpath, "index.js"));
      return import(`${url.href}?v=${Date.now()}-${Math.random()}`);
      }

      await verifyFrontendMain();
