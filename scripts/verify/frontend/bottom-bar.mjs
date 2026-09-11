import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

function toggleClasses(html) {
  const tag = html.match(/<button[^>]*data-tbf-mobile-nav-toggle[^>]*>/u);
  assert.ok(tag, "the mobile nav toggle must render");
  return ((tag[0].match(/class="([^"]*)"/u) || [])[1] || "").split(/\s+/u);
}

async function verifyBottomBar(importDist, rootDir) {
  const react = await importDist("react");
  const bar = renderToStaticMarkup(h(react.ProductShellBottomBar, { labels: { apps: "Apps", menu: "Menu", profile: "Profile" } }));
  const classes = toggleClasses(bar);
  assert.ok(classes.includes("tbf-mobile-bottom-bar__item"), "the bottom bar menu toggle must be styled as a bar item");
  assert.ok(!classes.includes("tbf-button"), "the bottom bar menu toggle must not carry the button surface");

  const standalone = renderToStaticMarkup(h(react.MobileNavToggleButton, { controls: "nav" }, "Menu"));
  assert.ok(toggleClasses(standalone).includes("tbf-button"), "a standalone mobile nav toggle keeps the button surface");

  const styles = await fs.readFile(path.join(rootDir, "dist", "layout", "styles", "chrome.scss"), "utf8");
  assert.ok(styles.includes('button#{ns.element-class("mobile-bottom-bar", "item")}'), "buttons used as bar items must be reset");
}

export { verifyBottomBar };
