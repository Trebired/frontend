import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

async function verifyNamespace(context) {
  const source = await fs.readFile(path.join(context.sourceDir, "namespace", "generated.ts"), "utf8");
  assert.ok(source.includes('FRONTEND_PREFIX = "tbf"'));
  const root = await context.importDistRoot();
  assert.equal(root.FRONTEND_PREFIX, "tbf");
  assert.equal(root.frontendClassName("button"), "tbf-button");
  assert.equal(root.frontendCssVar("primitives-button-root-color"), "--tbf-primitives-button-root-color");
  assert.equal(root.frontendDataAttr("popover"), "data-tbf-popover");
  assert.equal(root.frontendDataSelector("popover"), "[data-tbf-popover]");
  const base = await fs.readFile(path.join(context.rootDir, "dist", "styles", "utils", "base.scss"), "utf8");
  assert.ok(base.includes("var(--tbf-interaction-active-filter, none)"));
}

async function verifyPopover(context) {
  const { bindPopovers } = await context.importDist("popover");
  document.body.innerHTML = [
    '<button id="pop-trigger" data-tbf-popover-trigger aria-controls="pop-menu">Open</button>',
    '<div id="pop-menu" data-tbf-popover aria-hidden="true">',
    '<button id="pop-option" data-tbf-popover-close>Close</button>',
    "</div>",
  ].join("");
  const trigger = document.getElementById("pop-trigger");
  const popover = document.getElementById("pop-menu");
  const option = document.getElementById("pop-option");
  bindPopovers(document);
  assert.equal(popover.getAttribute("aria-hidden"), "true");
  assert.equal(popover.hasAttribute("inert"), true);
  trigger.click();
  assert.equal(popover.getAttribute("aria-hidden"), "false");
  assert.equal(popover.hasAttribute("inert"), false);
  option.focus();
  assert.equal(document.activeElement, option);
  option.click();
  assert.equal(popover.getAttribute("aria-hidden"), "true");
  assert.equal(popover.hasAttribute("inert"), true);
  assert.equal(document.activeElement, trigger);
}

export { verifyNamespace, verifyPopover };
