import assert from "node:assert/strict";

async function verifyZIndexFallback(context) {
  const { applyZIndex, clearZIndex } = await context.importDist("layer");
  const element = document.createElement("div");
  const reference = document.createElement("div");
  reference.setAttribute("data-tbf-z-resolved", "1300");
  document.body.append(element, reference);
  assert.equal(applyZIndex(element, { fallback: 1234 }), 1234, "a bare fallback is used as is");
  assert.equal(element.style.zIndex, "1234");
  assert.equal(applyZIndex(element, { behind: reference, fallback: 1 }), 1290, "behind stays one step under the reference");
  assert.equal(applyZIndex(element, { ahead: reference, fallback: 1 }), 1310, "ahead stays one step over the reference");
  clearZIndex(element);
  element.remove();
  reference.remove();
}

async function verifyFullscreenStacking(context) {
  const fullscreen = await context.importDist("fullscreen");
  document.body.innerHTML = [
    '<div id="layering-panel" data-tbf-fullscreen-target',
    ' data-tbf-fullscreen-id="layering" data-tbf-fullscreen-group="verify">panel</div>',
  ].join("");
  const target = document.getElementById("layering-panel");
  fullscreen.registerFullscreenTarget(target);
  fullscreen.openFullscreenTarget("layering", "verify");
  const overlay = document.querySelector("[data-tbf-fullscreen-overlay]");
  const targetZ = Number(target.style.zIndex);
  assert.ok(overlay, "opening creates the overlay");
  assert.ok(targetZ > Number(overlay.style.zIndex), "the fullscreen target stacks above its overlay");
  assert.ok(targetZ < 1060, "the fullscreen target stays below modals");
  assert.equal(target.parentElement?.hasAttribute("data-tbf-layer-root"), true, "the target moves into the layer root");
  fullscreen.closeFullscreenTarget({ immediate: true });
  assert.equal(document.querySelector("[data-tbf-fullscreen-overlay]"), null, "closing removes the overlay");
  assert.equal(target.hasAttribute("data-tbf-fullscreen-active"), false);
}

async function verifyFullscreenRestoreAnimation(context) {
  const fullscreen = await context.importDist("fullscreen");
  document.body.innerHTML = [
    '<div id="restore-panel" data-tbf-fullscreen-target',
    ' data-tbf-fullscreen-id="restore" data-tbf-fullscreen-group="verify">panel</div>',
  ].join("");
  const target = document.getElementById("restore-panel");
  fullscreen.registerFullscreenTarget(target);
  fullscreen.openFullscreenTarget("restore", "verify");
  const placeholder = document.querySelector("[data-tbf-fullscreen-placeholder]");
  assert.ok(placeholder, "opening leaves a placeholder to animate in");
  fullscreen.closeFullscreenTarget();
  await new Promise((resolve) => setTimeout(resolve, 260));
  assert.equal(target.isConnected, true, "the target returns to the document");
  assert.equal(target.getAttribute("data-tbf-fullscreen-restoring"), "true", "the restored target animates back in");
  await new Promise((resolve) => setTimeout(resolve, 420));
  assert.equal(target.hasAttribute("data-tbf-fullscreen-restoring"), false, "the restore attribute is cleared");
  document.body.innerHTML = "";
}

async function verifyBindRootBatching(context) {
  const { collectAddedBindRoots } = await context.importDist("dom");
  document.body.innerHTML = '<div id="batch-list"></div><div id="batch-single"></div>';
  const list = document.getElementById("batch-list");
  const rows = Array.from({ length: 12 }, () => {
      const row = document.createElement("div");
      list.append(row);
      return row;
  });
  const single = document.createElement("span");
  document.getElementById("batch-single").append(single);
  const nested = document.createElement("em");
  single.append(nested);
  const detached = document.createElement("i");
  const roots = collectAddedBindRoots([{ addedNodes: [...rows, single, nested, detached] }]);
  assert.deepEqual(roots, [list, single], "many siblings bind through their parent, nested and detached nodes are skipped");
  document.body.innerHTML = "";
}

async function verifySharedScrollLock(context) {
  const fullscreen = await context.importDist("fullscreen");
  const modal = await context.importDist("modal");
  const root = document.documentElement;
  document.body.innerHTML = [
    '<div id="lock-panel" data-tbf-fullscreen-target data-tbf-fullscreen-id="lock" data-tbf-fullscreen-group="verify">',
    '<div id="lock-modal" data-tbf-modal><div data-tbf-modal-content>modal</div></div></div>',
  ].join("");
  root.style.overflow = "";
  document.body.style.overflow = "";
  fullscreen.registerFullscreenTarget(document.getElementById("lock-panel"));
  fullscreen.openFullscreenTarget("lock", "verify");
  modal.openModal(document.getElementById("lock-modal"));
  assert.equal(root.style.overflow, "hidden", "overlays lock scrolling on the root element");
  assert.equal(document.body.style.overflow, "", "body must not become a scroll container, or sticky headers scroll away");
  fullscreen.closeFullscreenTarget({ immediate: true });
  assert.equal(root.style.overflow, "hidden", "closing the fullscreen panel must keep the modal's lock");
  modal.closeModal(document.getElementById("lock-modal"));
  assert.equal(root.style.overflow, "", "closing overlays out of order must still restore scrolling");
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function verifyModalSaveRace(context) {
  const modal = await context.importDist("modal");
  const spa = await context.importDist("spa");
  document.body.innerHTML = '<div id="race-modal" data-tbf-modal><div data-tbf-modal-content>form</div></div>';
  const element = document.getElementById("race-modal");
  modal.openModal(element);
  await wait(50);
  assert.equal(element.getAttribute("data-tbf-open"), "true");
  modal.bindModals(document);
  assert.equal(element.getAttribute("data-tbf-open"), "true", "rebinding must not reset a modal that is open");
  assert.equal(element.getAttribute("aria-hidden"), "false");
  const overlays = spa.createLiveOverlayState();
  overlays.preserve();
  modal.openModal(element);
  assert.equal(element.getAttribute("data-tbf-open"), "true", "reopening an open modal must not restart its animation");
  overlays.restore({ consume: false });
  modal.closeModal(element);
  overlays.restore();
  await wait(300);
  assert.equal(element.hasAttribute("data-tbf-open"), false, "a modal closed after the snapshot must stay closed");
  assert.equal(element.getAttribute("aria-hidden"), "true");
  assert.equal(document.documentElement.style.overflow, "", "closing must release the scroll lock");

  modal.openModal(element);
  modal.closeModal(element);
  await wait(300);
  assert.equal(element.hasAttribute("data-tbf-open"), false, "an open frame queued before a close must not reopen the modal");

  modal.openModal(element);
  await wait(50);
  modal.closeModal(element);
  modal.openModal(element);
  await wait(300);
  assert.equal(element.getAttribute("data-tbf-open"), "true", "a modal reopened during its close transition stays open");
  assert.equal(element.hasAttribute("inert"), false, "the stale close timer must not make a reopened modal inert");
  modal.closeModal(element);
  await wait(300);
}

async function verifyHiddenLayersDoNotRaiseZIndex(context) {
  const layer = await context.importDist("layer");
  const modal = await context.importDist("modal");
  document.body.innerHTML = [
    '<div id="z-one" data-tbf-modal><div data-tbf-modal-content>one</div></div>',
    '<div id="z-two" data-tbf-modal><div data-tbf-modal-content>two</div></div>',
  ].join("");
  const one = document.getElementById("z-one");
  const two = document.getElementById("z-two");
  const zValues = [];
  for (let round = 0; round < 4; round += 1) {
    for (const element of [one, two]) {
      modal.openModal(element);
      zValues.push(Number(element.style.zIndex));
      modal.closeModal(element);
    }
  }
  assert.equal(new Set(zValues).size, 1, `closed modals must not push later modals higher (got ${zValues.join(",")})`);
  modal.openModal(one);
  modal.openModal(two);
  assert.ok(Number(two.style.zIndex) > Number(one.style.zIndex), "a modal opened over an open modal still stacks above it");
  modal.closeModal(two);
  modal.closeModal(one);
  const root = layer.ensureLayerRoot();
  let inserted = 0;
  const observer = new MutationObserver((records) => records.forEach((r) => { inserted += r.addedNodes.length; }));
  const last = root.lastElementChild;
  observer.observe(root, { childList: true });
  layer.moveLayerElementToTop(last);
  await Promise.resolve();
  observer.disconnect();
  assert.equal(inserted, 0, "the last layer element must not be re-inserted, which would drop its computed style");
  await wait(300);
}

async function verifyLayering(context) {
  await verifyZIndexFallback(context);
  await verifyFullscreenStacking(context);
  await verifyFullscreenRestoreAnimation(context);
  await verifySharedScrollLock(context);
  await verifyModalSaveRace(context);
  await verifyHiddenLayersDoNotRaiseZIndex(context);
  await verifyBindRootBatching(context);
}

export { verifyLayering };
