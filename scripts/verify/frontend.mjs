import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { Window } from "happy-dom";
import { fileURLToPath, pathToFileURL } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const sourceDir = path.join(rootDir, "src");

async function main() {
  installDom();
  await verifyCsrfFetch();
  await verifyActionConfetti();
  await verifyFlash();
  await verifyTooltip();
  await verifyModal();
  await verifyUpload();
  await verifyNoCustomElements();
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
  const { createUploadField, uploadFieldHtml } = await importDist("inputs");
  const html = uploadFieldHtml({ label: "Choose", name: "file" });
  assert.equal(/\bwrap\b/iu.test(html), false);
  const element = createUploadField({ label: "Choose", name: "file" });
  assert.equal(/\bwrap\b/iu.test(element.outerHTML), false);
}

async function verifyNoCustomElements() {
  const files = await sourceFiles(sourceDir);
  const banned = [
    /customElements/u,
    /extends\s+HTMLElement/u,
    /document\.createElement\(["'`][a-z]+-[a-z0-9-]+["'`]\)/u,
    /\b(action-form|action-button|tooltip-trigger|modal-trigger|theme-toggle)\b/u,
  ];
  for (const file of files) {
    const source = await fs.readFile(file, "utf8");
    for (const pattern of banned) {
      assert.equal(pattern.test(source), false, `${file} references custom element behavior.`);
    }
  }
}

async function sourceFiles(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await sourceFiles(full));
    else if (/\.(ts|tsx|css)$/u.test(entry.name)) out.push(full);
  }
  return out;
}

async function importDist(subpath) {
  const url = pathToFileURL(path.join(rootDir, "dist", subpath, "index.js"));
  return import(`${url.href}?v=${Date.now()}-${Math.random()}`);
}

await main();
