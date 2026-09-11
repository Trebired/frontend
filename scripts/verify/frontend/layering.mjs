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

async function verifyLayering(context) {
  await verifyZIndexFallback(context);
  await verifyFullscreenStacking(context);
  await verifyBindRootBatching(context);
}

export { verifyLayering };
