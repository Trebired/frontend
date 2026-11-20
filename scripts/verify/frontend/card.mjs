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
  assert.ok(!/\btbf-card\b/u.test(className), `card draws no box of its own: ${html}`);
  assert.match(html, /data-tbf-container="card"/u, `card carries the card role for the container that claims it: ${html}`);
  assert.ok(className.includes("tbf-column"), `card stack options did not reach its class: ${html}`);
  assert.ok(className.includes("tbf-center"), `card center option did not reach its class: ${html}`);

  const toned = renderToStaticMarkup(react.card({ children: "Body", tone: "muted" }));
  assert.match(toned, /data-tbf-variant="muted"/u, `a toned card names its variant for the container: ${toned}`);

  const row = renderToStaticMarkup(react.card_body({ active: true, title: "Row" }));
  assert.match(row, /data-tbf-container="card-row"/u, `a card row carries the card-row role: ${row}`);
  assert.match(row, /data-tbf-card-selected="true"/u, `an active row is marked selected: ${row}`);
  assert.ok(!/class="[^"]*\btbf-card-row\b/u.test(row), `a card row draws no box of its own: ${row}`);
}

export { verifyCardStackOptions };
