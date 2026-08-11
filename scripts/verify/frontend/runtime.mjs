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

async function verifyWizard(context) {
  const { bindWizardRoot } = await context.importDist("wizard");
  document.body.innerHTML = [
    '<wizard-root id="setup" class="wizard">',
    '<wizard-step id="setup_a" data-wizard-step-state="active">A<wizard-next-button><button ' +
      'type="button">Next</button></wizard-next-button></wizard-step>',
    '<wizard-step id="setup_b" aria-hidden="true" inert>B<wizard-previous-button><button type="button" ' +
      'hidden>Back</button></wizard-previous-button></wizard-step>',
    "</wizard-root>",
  ].join("");
  const root = document.getElementById("setup");
  const steps = Array.from(root.querySelectorAll("wizard-step"));
  let ready = false;
  steps.forEach((step, index) => {
      step.getBoundingClientRect = () => ({
          bottom: 0,
          height: ready ? 40 + index * 30 : 0,
          left: 0,
          right: 0,
          top: 0,
          width: ready ? 320 : 0,
          x: 0,
          y: 0,
          toJSON: () => ({}),
      });
  });
  bindWizardRoot(root);
  assert.equal(root.hasAttribute("data-wizard-ready"), false);
  assert.equal(steps[1].hidden, false);
  ready = true;
  window.dispatchEvent(new Event("resize"));
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(root.style.getPropertyValue("--wizard-step-min-height"), "70px");
  assert.equal(root.style.getPropertyValue("--wizard-step-width"), "320px");
  assert.equal(steps[1].hidden, true);
  assert.equal(root.getAttribute("data-wizard-ready"), "true");
}

export { verifyNamespace, verifyPopover, verifyWizard };
