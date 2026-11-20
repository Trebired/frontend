import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";

async function verifyNumber(importDist) {
  const react = await importDist("react");
  const expected = '<span class="tbf-number">1,234</span>';
  assert.equal(renderToStaticMarkup(react.number({ value: 1234 })), expected, "number renders one shared element with no hardcoded wrapping");
  assert.equal(renderToStaticMarkup(react.time_counter({ count: 1234, mode: "count" })), expected, "time_counter count mode is the shared number");
  assert.equal(renderToStaticMarkup(react.number({ value: 0 })), '<span class="tbf-number">0</span>', "zero still renders");
  assert.equal(react.number({ value: "nope" }), null, "a missing value renders nothing");
  const tabsHtml = renderToStaticMarkup(react.tabs({
        familyKey: "verify-number-tabs",
        items: [{ id: "list", label: "List", number: 3, route: "list" }, { id: "create", label: "Create", route: "create" }],
  }));
  assert.ok(
    tabsHtml.includes('<span class="tbf-tab-label">List</span><span class="tbf-right"><span class="tbf-number">3</span></span>'),
    `a tab with a number shows it at its right edge: ${tabsHtml}`,
  );
  assert.ok(tabsHtml.includes('<span class="tbf-tab-label">Create</span></button>'), "a tab without a number has none");
  const node = react.createNumberElement(document, 7);
  assert.equal(node.outerHTML, '<span class="tbf-number">7</span>', "runtime code builds the same element");
}

export { verifyNumber };
