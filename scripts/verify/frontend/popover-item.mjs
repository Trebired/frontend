import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";

async function verifyPopoverItemButtons(importDist) {
  const react = await importDist("react");
  const plain = renderToStaticMarkup(react.button({ children: "Report", className: "tbf-popover-item", size: "sm", variant: "primary" }));
  const copy = renderToStaticMarkup(react.copy_button({ children: "Copy path", className: "tbf-popover-item", target: "#path" }));
  for (const html of [plain, copy]) {
    const button = (html.match(/<button[^>]*>/u) || [""])[0];
    assert.match(button, /class="tbf-popover-item"/u, `a popover item keeps only its item class: ${button}`);
    assert.match(button, /type="button"/u, button);
  }
  const regular = renderToStaticMarkup(react.button({ children: "Save" }));
  assert.match(regular, /tbf-btn/u, "a regular button keeps its button classes");
}

export { verifyPopoverItemButtons };
