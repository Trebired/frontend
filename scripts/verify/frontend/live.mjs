import assert from "node:assert/strict";
import { settleDom } from "./timing.mjs";

function modalMarkup(marker) {
  return [
    `<div id="live-modal" data-marker="${marker}" data-tbf-modal>`,
    '<div data-tbf-modal-content style="height:20px;overflow:auto;">',
    "<tabs-root>",
    "<div data-tabs-root>",
    "<div data-tabs-family>",
    "<div data-tabs-list>",
    '<button data-tab-button aria-controls="live-tab-a" aria-selected="false">A</button>',
    '<button data-tab-button aria-controls="live-tab-b" aria-selected="true">B</button>',
    "</div>",
    '<section id="live-tab-a">A</section>',
    '<section id="live-tab-b">B</section>',
    "</div>",
    "</div>",
    "</tabs-root>",
    '<div style="height:120px;">Body</div>',
    "</div>",
    "</div>",
  ].join("");
}

function rootMarkup(marker) {
  return [
    `<button id="live-popover-trigger-${marker}" data-tbf-popover-trigger aria-controls="live-popover">Open</button>`,
    '<div id="live-popover" data-tbf-popover aria-hidden="true">Menu</div>',
    '<div id="live-dropdown" data-dropdown-root>',
    '<div id="live-dropdown-options" data-dropdown-options data-dropdown-show="true">Options</div>',
    "</div>",
    modalMarkup(marker),
  ].join("");
}

function selectedTab(modal) {
  return modal.querySelector('[data-tab-button][aria-selected="true"]');
}

async function openPackageOverlays(context) {
  const root = await context.importDistRoot();
  const popover = await context.importDist("popover");
  const modal = await context.importDist("modal");
  const liveRoot = document.getElementById("live-root");
  const drop = document.getElementById("live-dropdown");
  root.updateDropdownRootConfig(drop, { optionsId: "live-dropdown-options" });
  popover.bindPopovers(liveRoot);
  document.getElementById("live-popover-trigger-before").click();
  modal.openModal(document.getElementById("live-modal"));
  await settleDom();
  await settleDom();
}

function assertMovedBackBeforeUpdate() {
  const drop = document.getElementById("live-dropdown");
  const options = document.getElementById("live-dropdown-options");
  const popover = document.getElementById("live-popover");
  const trigger = document.getElementById("live-popover-trigger-before");
  assert.equal(drop.contains(options), true);
  assert.equal(trigger.parentElement.contains(popover), true);
  assert.equal(popover.getAttribute("aria-hidden"), "true");
  assert.equal(popover.hasAttribute("inert"), true);
}

async function verifyLiveOverlays(context) {
  const { createLiveOverlayState } = await context.importDist("live");
  const modalRuntime = await context.importDist("modal");
  document.body.innerHTML = '<div id="live-root"></div><div id="tbf_layer_root"></div>';
  const liveRoot = document.getElementById("live-root");
  liveRoot.innerHTML = rootMarkup("before");
  await openPackageOverlays(context);

  const content = document.querySelector("[data-tbf-modal-content]");
  content.scrollTop = 24;
  const state = createLiveOverlayState({
      modalSelector: "[data-tbf-modal]",
      popoverTriggerSelector: "[data-tbf-popover-trigger]",
      portaledSelector: ["[data-tbf-modal]", "[data-tbf-popover]"],
      root: "#live-root",
  });
  state.prepareForUpdate();
  assertMovedBackBeforeUpdate();

  liveRoot.innerHTML = rootMarkup("after");
  state.syncAfterUpdate();
  await settleDom();
  await settleDom();

  const restoredModal = document.getElementById("live-modal");
  assert.equal(restoredModal.getAttribute("data-marker"), "after");
  assert.equal(restoredModal.getAttribute("data-tbf-open"), "true");
  assert.equal(
    restoredModal.querySelector("[data-tbf-modal-content]").scrollTop,
    24,
  );
  assert.equal(
    selectedTab(restoredModal).getAttribute("aria-controls"),
    "live-tab-b",
  );
  modalRuntime.closeModal(restoredModal);
  assert.equal(document.body.style.overflow, "");
}

function assignFiles(input, files) {
  const transfer = new DataTransfer();
  files.forEach((file) => transfer.items.add(file));
  input.files = transfer.files;
}

function uploadLiveMarkup(marker, cropValue = "") {
  const crop = cropValue.replace(/"/g, "&quot;");
  return [
    "<div data-tbf-live-content>",
    '<wizard-root id="welcome_wizard">',
    '<wizard-step id="welcome_intro" data-wizard-step-state="active">Intro</wizard-step>',
    '<wizard-step id="welcome_profile">',
    `<div id="avatar_upload" class="tbf-upload" data-marker="${marker}" data-tbf-upload>`,
    '<script data-tbf-upload-config hidden type="application/json">',
    '{"crop":true,"emptyLabel":"No avatar selected","formats":"image/png"}',
    "</script>",
    '<input id="avatar_upload_input" type="file" name="avatar" data-tbf-upload-slot="native-file" accept="image/png">',
    `<input type="hidden" name="avatar_crop" value="${crop}" data-tbf-upload-slot="crop-field">`,
    '<div data-tbf-upload-slot="preview">',
    '<img data-tbf-upload-slot="preview-image" hidden>',
    '<span data-tbf-upload-slot="preview-empty"></span>',
    "</div>",
    '<span data-tbf-upload-slot="filename">No avatar selected</span>',
    '<button type="button" data-tbf-upload-slot="clear" hidden>Remove</button>',
    '<ul data-tbf-upload-slot="list"></ul>',
    "</div>",
    "</wizard-step>",
    "</wizard-root>",
    "</div>",
  ].join("");
}

function chromeLiveMarkup(marker) {
  return [
    `<header id="primary_header" data-marker="${marker}">`,
    '<button id="login_lang_switch_btn" data-tbf-popover-trigger aria-controls="login_lang_switch_btn_menu">Lang</button>',
    '<div id="login_lang_switch_btn_menu" data-tbf-popover aria-hidden="true">',
    '<button data-tbf-locale-option data-tbf-popover-close value="en">English</button>',
    '<button data-tbf-locale-option data-tbf-popover-close value="cs">Czech</button>',
    "</div>",
    "</header>",
    `<div data-tbf-live-content data-marker="${marker}">Content ${marker}</div>`,
  ].join("");
}

async function verifyLiveChromePortaledOverlayCleanup(context) {
  const { softVisit } = await context.importDist("live");
  const { bindPopovers } = await context.importDist("popover");
  document.body.innerHTML = [
    '<div id="tbf_layer_root"></div>',
    chromeLiveMarkup("before"),
  ].join("");
  bindPopovers(document);
  document.getElementById("login_lang_switch_btn").click();
  await settleDom();
  assert.equal(
    document.getElementById("tbf_layer_root")
    .contains(document.getElementById("login_lang_switch_btn_menu")),
    true,
  );
  globalThis.fetch = async() => {
    return new Response(
      `<!doctype html><html lang="cs"><head><title>CS</title></head><body>${chromeLiveMarkup("after")}</body></html>`,
      { headers: { "Content-Type": "text/html" } },
    );
  };
  const result = await softVisit("/welcome", {
      bind(root) {
        bindPopovers(root);
      },
      chromeIds: ["primary_header"],
      history: "none",
      preserveState: true,
  });
  assert.equal(result, true);
  assert.equal(
    document.querySelectorAll("#login_lang_switch_btn_menu").length,
    1,
  );
  assert.equal(
    document.getElementById("primary_header").getAttribute("data-marker"),
    "after",
  );
  assert.equal(
    document.querySelector("[data-tbf-live-content]").textContent,
    "Content after",
  );
}

async function verifyLiveFileInputPreservation(context) {
  const { softVisit } = await context.importDist("live");
  const { bindUploads, getUploadFiles } = await context.importDist("inputs");
  const cropValue = '{"x":1,"y":2,"width":3,"height":4}';
  document.body.innerHTML = uploadLiveMarkup("before", cropValue);
  document.getElementById("welcome_intro").removeAttribute("data-wizard-step-state");
  const wizardStep = document.getElementById("welcome_profile");
  wizardStep.setAttribute("data-wizard-step-state", "active");
  const file = new File(["avatar"], "avatar.png", { type: "image/png" });
  assignFiles(document.getElementById("avatar_upload_input"), [file]);
  globalThis.fetch = async() => {
    return new Response(
      `<!doctype html><html lang="cs"><head><title>CS</title></head><body>${uploadLiveMarkup("after")}</body></html>`,
      { headers: { "Content-Type": "text/html" } },
    );
  };
  const result = await softVisit("/welcome", {
      bind(root) {
        bindUploads(root);
      },
      history: "none",
      preserveState: true,
  });
  assert.equal(result, true);
  const upload = document.getElementById("avatar_upload");
  const input = document.getElementById("avatar_upload_input");
  assert.equal(input.files.length, 1);
  assert.equal(input.files[0].name, "avatar.png");
  assert.equal(getUploadFiles(upload).length, 1);
  assert.equal(upload.querySelector('[data-tbf-upload-slot="filename"]').textContent, "avatar.png");
  assert.equal(
    document
    .getElementById("welcome_profile")
    .getAttribute("data-wizard-step-state"),
    "active",
  );
  assert.equal(
    upload.querySelector('[data-tbf-upload-slot="crop-field"]').value,
    cropValue,
  );
}

async function verifyFrontendLive(context) {
  await verifyLiveOverlays(context);
  await verifyLiveChromePortaledOverlayCleanup(context);
  await verifyLiveFileInputPreservation(context);
}

export {
  verifyFrontendLive,
  verifyLiveChromePortaledOverlayCleanup,
  verifyLiveFileInputPreservation,
  verifyLiveOverlays,
};
