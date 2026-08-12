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

export { verifyLiveOverlays };
