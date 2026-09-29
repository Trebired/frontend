import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

async function verifyProgressBars(rootDir, importDist) {
  const page = await fs.readFile(path.join(rootDir, "dist", "progress", "styles", "index.scss"), "utf8");
  const inline = await fs.readFile(path.join(rootDir, "dist", "primitives", "styles", "_indicators.scss"), "utf8");
  assert.ok(page.includes('ns.class("page-progress")'), "the page load bar owns tbf-page-progress");
  assert.equal(
    page.includes('ns.class("progress")'),
    false,
    "the page load bar must not share tbf-progress with the inline progress primitive, whose relative 6px block would drop the fixed bar into the " +
      "page and add scroll",
  );
  assert.ok(inline.includes('ns.class("progress")'), "the inline progress primitive keeps tbf-progress");
  const react = await importDist("react");
  const html = renderToStaticMarkup(h(react.ProgressRoot, { active: true, value: 0.5 }));
  assert.ok(html.includes("tbf-page-progress"), "the rendered page load bar carries its own class");
  assert.equal(html.includes('class="tbf-progress"'), false);
}

export { verifyProgressBars };
