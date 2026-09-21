import assert from "node:assert/strict";

function renderCards(React, renderToStaticMarkup, card_select, items, extra = {}) {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(React.createElement(() => card_select({ items, ...extra })));
  document.body.append(host);
  return host;
}

function cards(host) {
  return Array.from(host.querySelectorAll("[data-select-card]"));
}

function state(card) {
  return {
    classSelected: card.classList.contains("selected"),
    excluded: card.classList.contains("excluded"),
    selected: card.getAttribute("aria-selected") === "true",
    tabIndex: card.tabIndex,
  };
}

async function verifyRenderContract(React, renderToStaticMarkup, card_select) {
  const host = renderCards(React, renderToStaticMarkup, card_select, [
      { disabled: true, title: "Off", value: "off" },
      { title: "A", value: "a" },
      { title: "B", value: "b" },
    ], { name: "method" });
  const group = host.querySelector("[data-select-cards]");
  assert.ok(group, "a select-card group marks its container");
  assert.equal(host.querySelector("input[data-select-cards-input]")?.getAttribute("name"), "method", "a named group renders its field");
  assert.deepEqual(cards(host).map((card) => card.tabIndex), [-1, 0, -1], "with nothing selected the first enabled card is focusable");
  host.remove();
}

async function verifyInteraction(React, renderToStaticMarkup, card_select, dist) {
  const host = renderCards(React, renderToStaticMarkup, card_select, [
      { selected: true, title: "A", value: "a" },
      { title: "B", value: "b" },
      { disabled: true, title: "C", value: "c" },
      { title: "D", value: "d" },
    ], { name: "method" });
  dist.bindSelectCards(host);
  const group = host.querySelector("[data-select-cards]");
  const [first, second, third, fourth] = cards(host);
  const seen = [];
  group.addEventListener(dist.SELECT_CARD_EVENT, (event) => seen.push(event.detail.value));
  second.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  assert.deepEqual(state(second), { classSelected: true, excluded: false, selected: true, tabIndex: 0 }, "a clicked card becomes selected");
  assert.deepEqual(state(first), { classSelected: false, excluded: true, selected: false, tabIndex: -1 }, "the previous card is excluded");
  assert.equal(host.querySelector("input[data-select-cards-input]").value, "b", "the field follows the selection");
  assert.equal(dist.selectedCardValue(group), "b", "the selected value is readable");
  third.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  assert.equal(dist.selectedCardValue(group), "b", "a disabled card cannot be selected");
  second.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" }));
  assert.equal(dist.selectedCardValue(group), "d", "arrow keys skip disabled cards");
  fourth.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" }));
  assert.equal(dist.selectedCardValue(group), "a", "arrow keys wrap around");
  first.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  assert.deepEqual(seen, ["b", "d", "a"], "a change event fires once per real change");
  host.remove();
}

async function verifySelectCards(context) {
  const React = (await import("react")).default;
  const { renderToStaticMarkup } = await import("react-dom/server");
  const dist = await context.importDistRoot();
  const card_select = (await context.importDist("react")).select;
  assert.equal(typeof card_select, "function", "the select-card component is exported");
  await verifyRenderContract(React, renderToStaticMarkup, card_select);
  await verifyInteraction(React, renderToStaticMarkup, card_select, dist);
}

export { verifySelectCards };
