import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { assertNoCustomElementTags, assertNoWrapClass } from "./html-assertions.mjs";

async function verifyUploadStyles(rootDir) {
  const upload = await fs.readFile(path.join(rootDir, "dist", "inputs", "styles", "upload.scss"), "utf8");
  const cropperShell = await fs.readFile(path.join(rootDir, "dist", "inputs", "styles", "cropper.scss"), "utf8");
  const cropperInternals = await fs.readFile(
    path.join(rootDir, "dist", "inputs", "styles", "cropper-internals.scss"),
    "utf8",
  );
  const cropper = `${cropperShell}\n${cropperInternals}`;
  const cropperRuntime = await fs.readFile(path.join(rootDir, "dist", "inputs", "upload", "crop-session.js"), "utf8");
  assert.ok(upload.includes("--tbf-primitives-upload-surface-background"));
  assert.ok(upload.includes("grid-template-columns: auto minmax(0, 1fr)"));
  assert.ok(upload.includes("var(--tbf-border-width, 1px) solid var(--tbf-border, #000)"));
  assert.ok(upload.includes('[data-tbf-upload-drop="true"]'));
  assert.ok(upload.includes("--tbf-primitives-upload-surface-states-drop-border-style"));
  assert.ok(upload.includes("[data-tbf-upload-drag]"));
  assert.ok(upload.includes("--tbf-primitives-upload-surface-states-drag-shadow"));
  assert.ok(upload.includes("white-space: nowrap"));
  assert.ok(upload.includes('data-tbf-upload-entry-count="1"'));
  assert.ok(upload.includes("--tbf-primitives-upload-list-max-height"));
  assert.equal(upload.includes("tbf-upload__button"), false);
  assert.equal(upload.includes("--tbf-primitives-upload-button"), false);
  assert.ok(cropper.includes("--tbf-primitives-upload-cropper-stage-overlay-color"));
  assert.ok(cropper.includes("--tbf-primitives-upload-cropper-stage-line-contrast-color"));
  assert.ok(cropper.includes("--tbf-primitives-upload-cropper-stage-line-width, 1px"));
  assert.ok(cropper.includes("--tbf-primitives-upload-cropper-stage-point-inset"));
  assert.ok(cropper.includes("overflow: visible"));
  assert.ok(cropperShell.includes("overflow: visible"));
  assert.ok(cropper.includes("linear-gradient("));
  assert.equal(cropper.includes("mix-blend-mode"), false);
  assert.ok(cropper.includes("z-index: 3"));
  assert.ok(cropper.includes("z-index: 1"));
  assert.ok(cropper.includes("--tbf-primitives-upload-responsive-mobile-cropper-stage-height"));
  assert.ok(cropperRuntime.includes("remixicon close-line"));
  assert.ok(cropperRuntime.includes("remixicon checkbox-circle-line"));
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
  assert.ok(html.includes('class="btn"'));
  assert.ok(html.includes("remixicon:file-upload-line"));
  assert.ok(html.includes("remixicon:folder-upload-line"));
  assert.ok(html.includes("remixicon:close-line"));
  assert.ok(html.includes(">Remove</span>"));
  assert.ok(html.includes('data-tbf-upload-slot="formats"'));
  assert.equal(html.includes('title="No file selected"'), false);
  assert.equal(html.includes("tbf-upload__button"), false);
  assertNoWrapClass(html, "rendered upload component");
  assertNoCustomElementTags(html, "rendered upload component");
}

export { verifyRenderedUpload, verifyUploadStyles };
