import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

async function verifyLogsViewScrollContract(importDist, rootDir) {
  const react = await importDist("react");
  const html = renderToStaticMarkup(
    h(react.logs_view, {
        instanceId: "verify-logs",
        title: "Logs",
    }),
  );
  assert.ok(html.includes('id="verify-logs-box" class="tbf-log-box tbf-scroll-min"'));
  assert.ok(html.includes("log-box-shell"));
  assert.equal(
    html.includes("tbf-canvas-panel-content tbf-scroll"),
    false,
    "logs view must leave scrolling to .log-box",
  );
  const source = await fs.readFile(path.join(rootDir, "dist", "logs", "styles.scss"), "utf8");
  assert.ok(source.includes('#{ns.class("log-box-shell")}'));
  assert.ok(source.includes("overflow: hidden;"));
}

export { verifyLogsViewScrollContract };
