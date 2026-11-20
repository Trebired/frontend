import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";

async function verifyCanvasPanelFullscreen(importDist) {
  const react = await importDist("react");
  const base = { content: "Body", extendGroup: "maps", extendId: "code-map", title: "Code map", toolbarContent: "Toolbar" };
  const html = renderToStaticMarkup(react.canvas_panel({ ...base, fullscreen: true, lang: "cs" }));
  const top = html.match(/<div class="tbf-canvas-panel__top">([\s\S]*?)<\/div><div class="tbf-canvas-panel__actions">/);
  assert.ok(top, `the header has a title row above the actions: ${html}`);
  assert.ok(top[1].includes("Code map"), "the title sits in the top row");
  assert.ok(top[1].includes('class="tbf-fullscreen-toggle"'), "the fullscreen toggle sits in the top row, not among the actions");
  assert.ok(top[1].indexOf("Code map") < top[1].indexOf("tbf-fullscreen-toggle"), "the toggle comes after the title, at the right");
  assert.ok(
    html.includes('data-tbf-fullscreen-id="code-map"') && html.includes('data-tbf-fullscreen-group="maps"'),
    "the toggle and target share the id and group",
  );
  assert.ok(html.includes('title="Celá obrazovka"'), "the toggle speaks the panel's language");
  assert.equal((html.match(/data-tbf-fullscreen-target=""/g) || []).length, 1, "the panel is wrapped in exactly one fullscreen target");
  const untitled = renderToStaticMarkup(react.canvas_panel({ ...base, fullscreen: true, title: undefined }));
  assert.ok(
    /<div class="tbf-canvas-panel__top"><div class="tbf-canvas-panel__actions">Toolbar<\/div><span class="tbf-fullscreen-toggle">/.test(untitled),
    `without a title the toolbar shares the top row, the toggle still last: ${untitled}`,
  );
  const plain = renderToStaticMarkup(react.canvas_panel({ ...base, fullscreen: false }));
  assert.ok(!plain.includes("tbf-fullscreen-toggle"), "fullscreen: false shows no toggle");
  assert.ok(plain.includes('data-tbf-fullscreen-target=""'), "fullscreen: false still keeps the panel a fullscreen target");
}

export { verifyCanvasPanelFullscreen };
