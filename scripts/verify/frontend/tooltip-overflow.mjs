import assert from "node:assert/strict";

function sized(element, scrollWidth, clientWidth) {
  Object.defineProperty(element, "scrollWidth", { configurable: true, value: scrollWidth });
  Object.defineProperty(element, "clientWidth", { configurable: true, value: clientWidth });
  Object.defineProperty(element, "scrollHeight", { configurable: true, value: 20 });
  Object.defineProperty(element, "clientHeight", { configurable: true, value: 20 });
}

async function verifyOverflowTooltip(importDist) {
  const { bindTooltips, hideTooltip, showTooltip, TOOLTIP_LAYER_ID } = await importDist("tooltip");
  const { tooltipAttrs } = await importDist("react");
  const attrs = tooltipAttrs("src/a/very/long/path.ts", { overflow: true });
  assert.deepEqual(attrs, { "data-tbf-tooltip": "src/a/very/long/path.ts", "data-tbf-tooltip-overflow": "" });
  assert.deepEqual(tooltipAttrs("Copy"), { "data-tbf-tooltip": "Copy" }, "a plain tooltip has no overflow flag");
  const host = document.createElement("div");
  host.innerHTML = [
    "<span id='fits' data-tbf-tooltip='short.ts' data-tbf-tooltip-overflow=''>short.ts</span>",
    "<span id='cut' data-tbf-tooltip='src/a/very/long/path.ts' data-tbf-tooltip-overflow=''>src/a/very/long/path.ts</span>",
    "<span id='always' data-tbf-tooltip='Always'>Always</span>",
  ].join("");
  document.body.appendChild(host);
  sized(host.querySelector("#fits"), 80, 120);
  sized(host.querySelector("#cut"), 300, 120);
  sized(host.querySelector("#always"), 40, 120);
  bindTooltips(host);
  const open = (id) => {
    hideTooltip();
    showTooltip(host.querySelector(`#${id}`));
    const layer = document.getElementById(TOOLTIP_LAYER_ID);
    return layer && layer.getAttribute("data-tbf-open") === "true" ? layer.textContent : null;
  };
  assert.equal(open("fits"), null, "an overflow tooltip stays hidden while its text fits");
  assert.equal(open("cut"), "src/a/very/long/path.ts", "an overflow tooltip shows once its text is cut off");
  assert.equal(open("always"), "Always", "a plain tooltip still shows on text that fits");
  hideTooltip();
  host.remove();
}

export { verifyOverflowTooltip };
