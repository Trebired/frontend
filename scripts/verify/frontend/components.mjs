import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

async function verifyFrontendComponents(context) {
  await verifyComponentSubpaths(context.importDist);
  await verifyRenderedUpload(context.importDist);
  await verifyRenderedSystems(context.importDist);
  await verifyRootImportIsolation(context.rootDir);
}

async function verifyComponentSubpaths(importDist) {
  const checks = [
    ["actions/components", "ActionForm"],
    ["flash/components", "FlashShell"],
    ["progress/components", "ProgressRoot"],
    ["layer/components", "LayerRoot"],
    ["tooltip/components", "StatusIcon"],
    ["popover/components", "PopoverPanel"],
    ["modal/components", "ModalRoot"],
    ["inputs/components", "UploadField"],
    ["theme/components", "ThemeToggle"],
    ["live/components", "LiveRegion"],
  ];
  for (const [subpath, symbol] of checks) {
    const mod = await importDist(subpath);
    assert.equal(typeof mod[symbol], "function", `${subpath} missing ${symbol}`);
  }
}

async function verifyRenderedUpload(importDist) {
  const { UploadField } = await importDist("inputs/components");
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
  const { ActionButton, ActionForm, ActionTrigger } = await importDist("actions/components");
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
  const flash = await importDist("flash/components");
  const progress = await importDist("progress/components");
  const layer = await importDist("layer/components");
  const tooltip = await importDist("tooltip/components");
  const popover = await importDist("popover/components");
  const modal = await importDist("modal/components");
  const html = [
    renderToStaticMarkup(h(flash.FlashShell, { title: "Saved", type: "success" })),
    renderToStaticMarkup(h(progress.ProgressRoot, { active: true, value: 0.5 })),
    renderToStaticMarkup(h(layer.LayerRoot, null)),
    renderToStaticMarkup(h(tooltip.StatusIcon, { label: "Ready" })),
    renderToStaticMarkup(h(popover.PopoverPanel, { id: "p1" }, "Body")),
    renderToStaticMarkup(h(modal.ModalRoot, { id: "m1" }, h(modal.ModalContent, null, "Body"))),
  ].join("");
  assert.ok(html.includes("data-tbf-status-icon"));
  assert.ok(html.includes("data-tbf-modal"));
  assertNoCustomElementTags(html, "rendered layered components");
}

async function verifyRenderedThemeLive(importDist) {
  const theme = await importDist("theme/components");
  const live = await importDist("live/components");
  const html = [
    renderToStaticMarkup(h(theme.ThemeToggle, null)),
    renderToStaticMarkup(h(live.LiveRegion, { region: "main" }, "Body")),
    renderToStaticMarkup(h(live.LiveRefreshButton, { url: "/current" }, "Refresh")),
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
