import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

async function verifyFrontendComponents(context) {
  await verifyReactEntrypoint(context.importDist);
  await verifyRenderedUpload(context.importDist);
  await verifyRenderedSystems(context.importDist);
  await verifyRootImportIsolation(context.rootDir);
}

async function verifyReactEntrypoint(importDist) {
  const react = await importDist("react");
  const symbols = [
    "ActionForm",
    "FlashShell",
    "ProgressRoot",
    "LayerRoot",
    "Layout",
    "LayoutContent",
    "LayoutDocument",
    "LayoutPortalRoot",
    "StatusIcon",
    "PopoverPanel",
    "ModalRoot",
    "FullscreenTarget",
    "FullscreenButton",
    "SidebarShell",
    "Sidebar",
    "SidebarList",
    "UploadField",
    "ThemeToggle",
    "LiveRegion",
  ];
  for (const symbol of symbols) {
    assert.equal(typeof react[symbol], "function", `react entry missing ${symbol}`);
  }
}

async function verifyRenderedUpload(importDist) {
  const { UploadField } = await importDist("react");
  const html = renderToStaticMarkup(h(UploadField, {
    accept: "image/png,.jpg",
    crop: true,
    directory: true,
    drop: true,
    dropDirectory: true,
    emptyToggle: { name: "asset_empty", value: "1" },
    mixedPicker: true,
    multiple: true,
    name: "asset",
    preview: true,
    previewUrl: "/asset.png",
    skipDirs: ".git,node_modules",
  }));
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
  assertNoWrapClass(html, "rendered upload component");
  assertNoCustomElementTags(html, "rendered upload component");
}

async function verifyRenderedSystems(importDist) {
  await verifyRenderedActions(importDist);
  await verifyRenderedLayeredSystems(importDist);
  await verifyRenderedThemeLive(importDist);
}

async function verifyRenderedActions(importDist) {
  const { ActionButton, ActionForm, ActionTrigger } = await importDist("react");
  const html = [
    renderToStaticMarkup(h(ActionForm, { action: "/save", successConfetti: true }, "Body")),
    renderToStaticMarkup(h(ActionButton, { actionUrl: "/ok", successConfetti: true }, "Save")),
    renderToStaticMarkup(h(ActionTrigger, { action: "refresh now" }, "Run")),
  ].join("");
  assert.ok(html.includes("data-tbf-action"));
  assert.ok(html.includes("data-tbf-confetti"));
  assertNoCustomElementTags(html, "rendered action components");
}

async function verifyRenderedLayeredSystems(importDist) {
  const react = await importDist("react");
  const html = [
    renderToStaticMarkup(h(react.FlashShell, { title: "Saved", type: "success" })),
    renderToStaticMarkup(h(react.ProgressRoot, { active: true, value: 0.5 })),
    renderToStaticMarkup(h(react.LayerRoot, null)),
    renderToStaticMarkup(h(react.Layout, {
      header: h(react.LayoutHeader, null, "Header"),
      leftSidebar: h(react.SidebarShell, { id: "side" }, h(react.Sidebar, null, h(react.SidebarList, null))),
    }, h(react.LayoutContent, null, "Body"))),
    renderToStaticMarkup(h(react.StatusIcon, { label: "Ready" })),
    renderToStaticMarkup(h(react.PopoverPanel, { id: "p1" }, "Body")),
    renderToStaticMarkup(h(react.ModalRoot, { id: "m1" }, h(react.ModalContent, null, "Body"))),
    renderToStaticMarkup(h(react.FullscreenTarget, { fullscreenId: "panel" }, "Panel")),
    renderToStaticMarkup(h(react.FullscreenButton, { fullscreenId: "panel" }, "Fullscreen")),
    renderToStaticMarkup(h(react.SidebarShell, { id: "side" }, h(react.Sidebar, null, h(react.SidebarList, null)))),
  ].join("");
  assert.ok(html.includes("data-tbf-status-icon"));
  assert.ok(html.includes("data-tbf-layout-root"));
  assert.ok(html.includes("data-tbf-layout-content"));
  assert.ok(html.includes("data-tbf-modal"));
  assert.ok(html.includes("data-tbf-fullscreen-target"));
  assert.ok(html.includes("data-tbf-sidebar-shell"));
  assertNoCustomElementTags(html, "rendered layered components");
}

async function verifyRenderedThemeLive(importDist) {
  const react = await importDist("react");
  const html = [
    renderToStaticMarkup(h(react.ThemeToggle, null)),
    renderToStaticMarkup(h(react.LiveRegion, { region: "main" }, "Body")),
    renderToStaticMarkup(h(react.LiveRefreshButton, { url: "/current" }, "Refresh")),
  ].join("");
  assert.ok(html.includes("data-tbf-theme-button"));
  assert.ok(html.includes("data-tbf-live-region"));
  assertNoCustomElementTags(html, "rendered theme/live components");
}

async function verifyRootImportIsolation(rootDir) {
  const rootOutput = await fs.readFile(path.join(rootDir, "dist", "index.js"), "utf8");
  const inputsOutput = await fs.readFile(path.join(rootDir, "dist", "inputs", "index.js"), "utf8");
  for (const source of [rootOutput, inputsOutput]) {
    assert.equal(source.includes("cropperjs"), false, "root runtime pulled cropper.");
    assert.equal(source.includes("jsx-runtime"), false, "root runtime pulled component JSX.");
    assert.equal(source.includes("/components/"), false, "root runtime pulled component subpaths.");
  }
}

function assertNoCustomElementTags(html, label) {
  assert.equal(/<\s*[a-z]+-[a-z0-9-]+/u.test(html), false, `${label} uses custom tags.`);
}

function assertNoWrapClass(html, label) {
  assert.equal(/class="[^"]*\bwrap\b/u.test(html), false, `${label} uses wrap class.`);
}

export { verifyFrontendComponents };
