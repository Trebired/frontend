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

async function verifyWizardSsr(context, wizardModule) {
  const {
    default: wizard,
    wizard_final_action,
    wizard_next_button,
    wizard_previous_button,
  } = wizardModule;
  const React = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const actions = React.createElement(
    React.Fragment,
    null,
    wizard_previous_button({ label: "Back" }),
    wizard_next_button({ label: "Next" }),
    wizard_final_action(React.createElement("button", { type: "submit" }, "Finish")),
  );
  const html = renderToStaticMarkup(
    wizard({
        id: "ssr",
        steps: [
          { id: "a", content: "A", actions },
          { id: "b", content: "B", actions },
        ],
    }),
  );
  assert.match(html, /data-wizard-step-first="true"/u);
  assert.match(html, /data-wizard-step-last="true"/u);
  assert.match(html, /id="ssr_b"[^>]*hidden/u);
  assert.doesNotMatch(html, /wizard-final-action hidden/u);
  assert.doesNotMatch(html, /wizard-(previous|next)-button style=/u);
  assert.doesNotMatch(html, /wizard-previous-button><button[^>]* hidden/u);
  const styles = await fs.readFile(
    path.join(context.rootDir, "dist", "primitives", "styles", "_wizard.scss"),
    "utf8",
  );
  assert.ok(styles.includes('.wizard-step[data-wizard-step-first="true"] wizard-previous-button'));
  assert.ok(styles.includes('.wizard-step[data-wizard-step-last="true"] wizard-next-button'));
  assert.ok(styles.includes("form:has(> .wizard)"));
  assert.ok(styles.includes("grid-template-rows: minmax(0, 1fr)"));
  assert.ok(styles.includes("overflow-y: auto"));
  assert.ok(styles.includes("scrollbar-gutter: stable"));
}

async function verifyWizardSizing(bindWizardRoot) {
  document.body.innerHTML = [
    '<wizard-root id="setup" class="wizard">',
    '<wizard-step id="setup_a" data-wizard-step-state="active">A<wizard-next-button><button ' +
      'type="button">Next</button></wizard-next-button></wizard-step>',
    '<wizard-step id="setup_b" aria-hidden="true" hidden inert>B<wizard-previous-button><button type="button" ' +
      "hidden>Back</button></wizard-previous-button></wizard-step>",
    "</wizard-root>",
  ].join("");
  const root = document.getElementById("setup");
  const steps = Array.from(root.querySelectorAll("wizard-step"));
  steps.forEach((step, index) => {
      step.getBoundingClientRect = () => ({
          bottom: 0,
          height: 40 + index * 30,
          left: 0,
          right: 0,
          top: 0,
          width: 320,
          x: 0,
          y: 0,
          toJSON: () => ({}),
      });
  });
  bindWizardRoot(root);
  assert.equal(steps[0].hidden, false);
  assert.equal(steps[1].hidden, true);
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(root.style.getPropertyValue("--wizard-step-min-height"), "");
  assert.equal(root.style.getPropertyValue("--wizard-step-width"), "");
  assert.equal(root.getAttribute("data-wizard-ready"), "true");
}

async function verifyWizard(context) {
  const wizardModule = await context.importDist("wizard");
  await verifyWizardSsr(context, wizardModule);
  await verifyWizardSizing(wizardModule.bindWizardRoot);
}

export { verifyNamespace, verifyPopover, verifyWizard };
