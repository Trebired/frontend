import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

async function verifyFrontendComponents(context) {
  await verifyLayoutStyles(context.rootDir);
  await verifyModalStyles(context.rootDir);
  await verifyTooltipStyles(context.rootDir);
  await verifyThemeStyles(context.rootDir);
  await verifyTabsStyles(context.rootDir);
  await verifyUploadStyles(context.rootDir);
  await verifyReactEntrypoint(context.importDist);
  await verifyAdvancedTabsSsr(context.importDist);
  await verifyRenderedUpload(context.importDist);
  await verifyRenderedSystems(context.importDist);
  await verifyRootImportIsolation(context.rootDir);
}

async function verifyLayoutStyles(rootDir) {
  const source = await fs.readFile(path.join(rootDir, "dist", "layout", "styles", "index.scss"), "utf8");
  assert.ok(source.includes("--tbf-layout-bottom-bar-safe-offset: 0px;"));
  assert.ok(source.includes("--tbf-layout-mobile-bottom-bar-safe-offset: calc("));
  assert.ok(source.includes("--tbf-layout-bottom-bar-safe-offset: var(--tbf-layout-mobile-bottom-bar-safe-offset);"));
}

async function verifyTabsStyles(rootDir) {
  const source = await fs.readFile(path.join(rootDir, "dist", "inputs", "advanced", "tabs", "styles.scss"), "utf8");
  assert.ok(source.includes('&[aria-selected="true"]'));
  assert.ok(source.includes('&[data-tbf-active="true"]'));
  assert.ok(source.includes("var(--tbf-primitives-tabs-states-active-background"));
}

async function verifyModalStyles(rootDir) {
  const source = await fs.readFile(path.join(rootDir, "dist", "modal", "styles", "index.scss"), "utf8");
  assert.ok(source.includes("--tbf-overlays-modal-backdrop-background"));
  assert.ok(source.includes("--tbf-overlays-modal-content-background"));
  assert.ok(source.includes("--tbf-overlays-modal-motion-initial-scale"));
}

async function verifyTooltipStyles(rootDir) {
  const source = await fs.readFile(path.join(rootDir, "dist", "tooltip", "styles", "index.scss"), "utf8");
  assert.ok(source.includes("--tbf-overlays-tooltip-panel-shadow"));
}

async function verifyUploadStyles(rootDir) {
  const upload = await fs.readFile(path.join(rootDir, "dist", "inputs", "styles", "upload.scss"), "utf8");
  const cropper = await fs.readFile(path.join(rootDir, "dist", "inputs", "styles", "cropper.scss"), "utf8");
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
  assert.ok(cropper.includes("--tbf-primitives-upload-cropper-stage-line-blend-mode"));
  assert.ok(cropper.includes("--tbf-primitives-upload-cropper-stage-line-width, 2px"));
  assert.ok(cropper.includes("--tbf-primitives-upload-cropper-stage-guide-opacity, 1"));
  assert.ok(cropper.includes("mix-blend-mode: var(--tbf-primitives-upload-cropper-stage-line-blend-mode"));
  assert.ok(cropper.includes("z-index: 3"));
  assert.ok(cropper.includes("z-index: 1"));
  assert.ok(cropper.includes("--tbf-primitives-upload-responsive-mobile-cropper-stage-height"));
  assert.ok(cropperRuntime.includes("remixicon close-line"));
  assert.ok(cropperRuntime.includes("remixicon checkbox-circle-line"));
}

async function verifyThemeStyles(rootDir) {
  const source = await fs.readFile(path.join(rootDir, "dist", "theme", "styles", "index.scss"), "utf8");
  assert.ok(source.includes('data-tbf-theme-active="true"'));
  assert.ok(source.includes("--tbf-shell-theme-option-states-current-background"));
}

async function verifyReactEntrypoint(importDist) {
  const react = await importDist("react");
  const symbols = [
    "ActionForm",
    "BootScript",
    "FlashShell",
    "FrontendBootScript",
    "FrontendDocument",
    "ProgressRoot",
    "LayerRoot",
    "Layout",
    "AppHeader",
    "Breadcrumb",
    "LayoutContent",
    "LayoutDocument",
    "LayoutPortalRoot",
    "RenderCurrentUrlProvider",
    "StatusIcon",
    "PopoverPanel",
    "ModalRoot",
    "FullscreenTarget",
    "FullscreenButton",
    "SidebarShell",
    "Sidebar",
    "SidebarLinkList",
    "SidebarLiveSlot",
    "SidebarList",
    "UploadField",
    "Disclosure",
    "Dropdown",
    "GraphPanel",
    "CanvasPanel",
    "Card",
    "Tabs",
    "TextLink",
    "Search",
    "StatusField",
    "ThemeToggle",
    "LiveRegion",
    "ProductShellDocument",
    "SeoHeadTags",
  ];
  for (const symbol of symbols) {
    assert.equal(typeof react[symbol], "function", `react entry missing ${symbol}`);
  }
}

async function verifyAdvancedTabsSsr(importDist) {
  const react = await importDist("react");
  const html = renderToStaticMarkup(
    h(react.LayoutDocument, {
        currentUrl: "https://example.test/login?tab-auth=backup",
      },
      h(react.tabs, {
          familyKey: "auth",
          initialValue: "password",
          items: [
            { defaultActive: true, id: "password", label: "Password", route: "password" },
            { id: "backup", label: "Backup", route: "backup" },
          ],
      }),
      h(react.tab_panel, {
          defaultActive: true,
          familyKey: "auth",
          id: "password",
          route: "password",
        }, "Password panel"),
      h(react.tab_panel, {
          familyKey: "auth",
          id: "backup",
          route: "backup",
        }, "Backup panel")),
  );

  assert.ok(html.includes('aria-controls="backup"'));
  assert.ok(html.includes('aria-selected="true"'));
  assert.ok(html.includes('id="password" hidden=""'));
  assert.ok(html.includes('id="backup"'));
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

async function verifyRenderedSystems(importDist) {
  await verifyRenderedActions(importDist);
  await verifyRenderedLayeredSystems(importDist);
  await verifyRenderedSeoDocument(importDist);
  await verifyRenderedGenericPrimitives(importDist);
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
    renderToStaticMarkup(h(react.BootScript, {
          layout: { hasHeader: true, hasLeftSidebar: true },
          nonce: "n",
          sidebar: false,
          theme: "dark",
    })),
    renderToStaticMarkup(h(react.BootScript, {
          layout: false,
          nonce: "n",
          sidebar: { sides: ["right"] },
          theme: false,
    })),
    renderToStaticMarkup(h(react.FlashShell, { title: "Saved", type: "success" })),
    renderToStaticMarkup(h(react.ProgressRoot, { active: true, value: 0.5 })),
    renderToStaticMarkup(h(react.LayerRoot, null)),
    renderToStaticMarkup(h(react.Layout, {
          header: h(react.LayoutHeader, null, "Header"),
          leftSidebar: h(react.SidebarShell, { id: "side" }, h(react.Sidebar, null, h(react.SidebarList, null))),
        }, h(react.LayoutContent, null, "Body"))),
    renderToStaticMarkup(h(react.ProductShellThemeToggle, { id: "theme_control", icon: "Theme" })),
    renderToStaticMarkup(h(react.ProductShellThemeToggle, { id: "theme_control_text" }, h("span", null, "Theme"))),
    renderToStaticMarkup(h(react.StatusIcon, { label: "Ready" })),
    renderToStaticMarkup(h(react.PopoverPanel, { id: "p1" }, "Body")),
    renderToStaticMarkup(h(react.ModalRoot, { id: "m1" }, h(react.ModalContent, null, "Body"))),
    renderToStaticMarkup(h(react.FullscreenTarget, { fullscreenId: "panel" }, "Panel")),
    renderToStaticMarkup(h(react.FullscreenButton, { fullscreenId: "panel" }, "Fullscreen")),
    renderToStaticMarkup(h(react.SidebarShell, { id: "side" }, h(react.Sidebar, null, h(react.SidebarList, null)))),
  ].join("");
  assert.ok(html.includes("data-tbf-status-icon"));
  assert.ok(html.includes("data-tbf-layout-boot"));
  assert.ok(html.includes("data-tbf-sidebar-boot"));
  assert.ok(html.includes("data-tbf-sidebar-right"));
  assert.ok(html.includes("data-tbf-theme"));
  assert.ok(html.includes("data-tbf-layout-root"));
  assert.ok(html.includes("data-tbf-layout-content"));
  assert.equal(html.includes("data-tbf-theme-button"), false);
  assert.ok(html.includes("tbf-button btn icon has-tooltip tbf-product-shell-theme-control"));
  assert.ok(html.includes("tbf-button btn has-tooltip tbf-product-shell-theme-control"));
  assert.ok(html.includes("data-tbf-popover-trigger"));
  assert.equal(html.includes("data-tbf-popover-open"), false);
  assert.ok(html.includes("data-tbf-theme-select"));
  assert.ok(html.includes("data-tbf-modal"));
  assert.ok(html.includes("data-tbf-fullscreen-target"));
  assert.ok(html.includes("data-tbf-sidebar-shell"));
  assertNoCustomElementTags(html, "rendered layered components");
}

async function verifyRenderedSeoDocument(importDist) {
  const react = await importDist("react");
  const html = renderToStaticMarkup(h(react.ProductShellDocument, {
        seo: {
          canonicalUrl: "https://example.test/",
          htmlLang: "cs",
          metaDescription: "Landing page",
          robotsContent: "index, follow",
          structuredData: { "@context": "https://schema.org", "@type": "WebSite" },
          title: "Home",
          titleSuffix: " | App",
        },
      }, "Body"));
  assert.ok(html.includes('<html lang="cs"'));
  assert.ok(html.includes("<title>Home | App</title>"));
  assert.ok(html.includes('name="description" content="Landing page"'));
  assert.ok(html.includes('name="robots" content="index, follow"'));
  assert.ok(html.includes('rel="canonical" href="https://example.test/"'));
  assert.ok(html.includes('type="application/ld+json"'));
  assertNoCustomElementTags(html, "rendered SEO document");
}

async function verifyRenderedGenericPrimitives(importDist) {
  const react = await importDist("react");
  const html = [
    renderToStaticMarkup(h(react.AppHeader, { brand: "App", nav: "Nav" })),
    renderToStaticMarkup(h(react.Breadcrumb, null, h(react.BreadcrumbItem, { current: true }, "Current"))),
    renderToStaticMarkup(h(react.Disclosure, {
          panel: "Panel",
          trigger: h(react.DisclosureButton, null, "Open"),
    })),
    renderToStaticMarkup(h(react.Tabs, null,
        h(react.TabList, null, h(react.TabButton, { controls: "p1", value: "one" }, "One")),
        h(react.TabPanel, { id: "p1", value: "one" }, "Panel"),
    )),
    renderToStaticMarkup(h(react.Dropdown, { name: "mode", value: "one" },
        h(react.DropdownTrigger, null, h(react.DropdownValue, null, "One")),
        h(react.DropdownMenu, null, h(react.DropdownOption, { value: "one" }, "One")),
    )),
    renderToStaticMarkup(h(react.Search, null, h(react.SearchInput, null), h(react.SearchItem, { text: "alpha" }, "Alpha"))),
    renderToStaticMarkup(h(react.StatusField, { url: "/validate" }, h(react.StatusMessage, null))),
    renderToStaticMarkup(h(react.GraphPanel, { config: { series: [{ key: "a", points: [{ x: 1, y: 2 }] }] } })),
    renderToStaticMarkup(h(react.CanvasPanel, { title: "Canvas" }, "Body")),
    renderToStaticMarkup(h(react.Card, null, h(react.CardBody, null, "Body"))),
    renderToStaticMarkup(h(react.TextLink, { href: "/docs" }, "Docs")),
    renderToStaticMarkup(h(react.SidebarLinkList, { items: [{ href: "/", label: "Home" }] })),
  ].join("");
  [
    "data-tbf-header",
    "data-tbf-breadcrumb",
    "data-tbf-disclosure",
    "data-tbf-tabs",
    "data-tbf-dropdown",
    "data-tbf-search",
    "data-tbf-status-field",
    "data-tbf-graph",
    "data-tbf-canvas-panel",
    "data-tbf-card",
    "data-tbf-text-link",
    "data-tbf-sidebar-link",
  ].forEach((marker) => assert.ok(html.includes(marker), `missing ${marker}`));
  assertNoCustomElementTags(html, "rendered generic primitive components");
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
