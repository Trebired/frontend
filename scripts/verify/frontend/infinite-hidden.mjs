import assert from "node:assert/strict";

const frame = () => new Promise((resolve) => window.requestAnimationFrame(() => resolve()));

function boxed(element, rendered) {
  const rect = rendered
  ? { bottom: 120, height: 20, left: 0, right: 100, top: 100, width: 100 }
  : { bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0 };
  element.getBoundingClientRect = () => rect;
  element.getClientRects = () => (rendered ? [rect] : []);
}

async function countLoads(live, rendered) {
  const root = document.createElement("div");
  const sentinel = document.createElement("div");
  root.appendChild(sentinel);
  document.body.appendChild(root);
  boxed(root, rendered);
  boxed(sentinel, rendered);
  if (rendered) root.getBoundingClientRect = () => ({ bottom: 400, height: 400, left: 0, right: 100, top: 0, width: 100 });
  let loads = 0;
  const handle = live.createInfiniteObserver(root, sentinel, () => { loads += 1; }, { recheckAfterLoad: false });
  await frame();
  await frame();
  handle.disconnect();
  root.remove();
  return loads;
}

async function verifyInfiniteHiddenSentinel(context) {
  const live = await context.importDist("live");
  const OriginalObserver = window.IntersectionObserver;
  window.IntersectionObserver = class { observe() {} disconnect() {} };
  globalThis.IntersectionObserver = window.IntersectionObserver;
  try {
    assert.equal(await countLoads(live, false), 0, "a sentinel inside a hidden panel never loads more");
    assert.equal(await countLoads(live, true), 1, "a rendered sentinel in view still loads more");
  } finally {
    window.IntersectionObserver = OriginalObserver;
    globalThis.IntersectionObserver = OriginalObserver;
  }
}

export { verifyInfiniteHiddenSentinel };
