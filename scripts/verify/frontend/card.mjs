import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";

async function verifyCardStackOptions(importDist) {
  const react = await importDist("react");
  const options = { center: true, gap: "sm", grow: true, horizontalCenter: true, noShrink: true, verticalCenter: true };
  const html = renderToStaticMarkup(react.card({ ...options, children: "Body" }));
  for (const name of ["center", "verticalCenter", "horizontalCenter", "grow", "noShrink"]) {
    assert.equal(new RegExp(`\\s${name.toLowerCase()}=`, "u").test(html), false, `card leaked ${name} onto the DOM: ${html}`);
  }
  const className = (html.match(/class="([^"]*)"/u) || [])[1] || "";
  assert.ok(className.includes("tbf-card"), html);
  assert.ok(className.includes("tbf-column"), `card stack options did not reach its class: ${html}`);
  assert.ok(className.includes("tbf-center"), `card center option did not reach its class: ${html}`);
}

export { verifyCardStackOptions };
