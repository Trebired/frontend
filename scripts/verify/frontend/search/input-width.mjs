import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";

async function verifySearchInputWidth(importDist) {
  const react = await importDist("react");
  const html = renderToStaticMarkup(react.input({ className: "tbf-width-lg tbf-extra-test", type: "search" }));
  const wrapper = html.match(/^<span class="([^"]*)"/);
  const field = html.match(/<input class="([^"]*)"/);
  assert.ok(wrapper && field, `search input renders a wrapper and a field: ${html}`);
  assert.ok(wrapper[1].split(" ").includes("tbf-width-lg"), "the width class sizes the wrapper the icon sits in");
  assert.ok(!field[1].split(" ").includes("tbf-width-lg"), "the field fills its wrapper instead of taking the width class");
  assert.ok(field[1].split(" ").includes("tbf-extra-test"), "other classes stay on the field");
}

export { verifySearchInputWidth };
