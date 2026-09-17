import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

async function verifyNamespace(context) {
  const source = await fs.readFile(path.join(context.sourceDir, "namespace", "generated.ts"), "utf8");
  assert.ok(source.includes('NAMESPACE_PREFIX = "tbf"'));
  const root = await context.importDistRoot();
  assert.equal(root.FRONTEND_PREFIX, "tbf");
  assert.equal(root.frontendClassName("button"), "tbf-button");
  assert.equal(root.frontendCssVar("primitives-button-root-color"), "--tbf-ui-btn-root-color");
  assert.equal(root.frontendDataAttr("popover"), "data-tbf-popover");
  assert.equal(root.frontendDataSelector("popover"), "[data-tbf-popover]");
  const base = await fs.readFile(path.join(context.rootDir, "dist", "styles", "utils", "base.scss"), "utf8");
  assert.ok(base.includes('var(#{ns.css-var("interaction-active-filter")}, none)'));
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

async function verifyPopoverReactEvents(context) {
  const React = await import("react");
  const { createRoot } = await import("react-dom/client");
  const { bindPopovers } = await context.importDist("popover");
  const { PopoverOpenButton, PopoverPanel } = await context.importDist("react");

  document.body.innerHTML = '<div id="root"></div>';
  let clicked = 0;

  function Example() {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        PopoverOpenButton,
        { controls: "react-pop", id: "react-pop-trigger" },
        "Open",
      ),
      React.createElement(
        PopoverPanel,
        { id: "react-pop" },
        React.createElement(
          "button",
          { id: "react-pop-option", onClick: () => { clicked += 1; }, type: "button" },
          "Pick",
        ),
      ),
    );
  }

  const root = createRoot(document.getElementById("root"));
  root.render(React.createElement(Example));
  await settleEffects();

  const panel = document.getElementById("react-pop");
  assert.ok(panel, "popover panel should be in the document");
  assert.equal(
    panel.closest("#tbf_layer_root") !== null,
    true,
    "panel should be portalled into the layer root, not left in the React container",
  );

  bindPopovers(document);
  document.getElementById("react-pop-trigger").click();
  await settleEffects();
  assert.equal(panel.getAttribute("aria-hidden"), "false", "popover should open");

  document.getElementById("react-pop-option").click();
  await settleEffects();
  assert.equal(clicked, 1, "React onClick inside the popover panel must fire");

  root.unmount();
  document.body.innerHTML = "";
}

async function settleEffects() {
  for (let i = 0; i < 5; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
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

async function verifyGraphEmptyState(context) {
  const react = await context.importDist("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  const empty = renderToStaticMarkup(createElement(react.cpu_graph, { datasets: [], id: "empty_graph" }));
  assert.ok(empty.includes('"state":"empty"'), "a graph with no data marks itself empty without the caller asking");
  assert.ok(empty.includes("No data yet."), "an empty graph explains itself");
  assert.ok(empty.includes("line-chart-line"), "an empty graph shows an icon instead of a blank canvas");
  const filled = renderToStaticMarkup(createElement(react.cpu_graph, {
        datasets: [{ label: "cpu", points: [{ label: "now", value: 12 }] }],
        id: "filled_graph",
  }));
  assert.ok(!filled.includes('"state":"empty"'), "a graph with data is not marked empty");
  const custom = renderToStaticMarkup(createElement(react.cpu_graph, {
        datasets: [], id: "custom_graph", state: "empty", stateMessage: "No samples recorded yet.",
  }));
  assert.ok(custom.includes("No samples recorded yet."), "an explicit message still wins");
}

async function verifyGraphShellIsUniform(context) {
  const react = await context.importDist("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  const plain = renderToStaticMarkup(createElement(react.cpu_graph, { datasets: [], id: "plain_graph" }));
  const decorated = renderToStaticMarkup(createElement(react.cpu_graph, {
        datasets: [], id: "decorated_graph", rootClassName: "height-xl", scroll: true,
  }));
  for (const [label, html] of [["plain", plain], ["decorated", decorated]]) {
    assert.ok(html.includes("graph-shell-mount"), `${label} graph uses the shared shell`);
    assert.ok(html.includes("data-tbf-fullscreen-target"), `${label} graph gets fullscreen from the package`);
    assert.ok(html.includes('"fullscreen_id":'), `${label} graph hands its fullscreen id to the title row`);
    assert.ok(!html.includes("canvas-panel-toolbar"), `${label} graph has no separate fullscreen strip`);
    assert.ok(!/\b(padding|gap)-xs\b/u.test(html), `${label} graph spaces with sm, not xs`);
    assert.ok(!/class="[^"]*graph-shell[^"]*padding-/u.test(html), `${label} graph card relies on the card's own padding`);
  }
  const optedOut = renderToStaticMarkup(createElement(react.cpu_graph, { datasets: [], id: "no_fs_graph", extendId: false }));
  assert.ok(!optedOut.includes("data-tbf-fullscreen-target"), "fullscreen can still be turned off");
}

async function verifyGraphTimeLabels(context) {
  const root = await context.importDistRoot();
  const now = Date.now();
  const config = root.buildChartConfig({
      datasets: [{ label: "cpu", points: [300, 150, 0].map((ago, index) => ({
                label: new Date(now - ago * 1000).toISOString(), value: index,
          })) }],
      lang: "en",
  });
  const tick = config.options.scales.x.ticks.callback;
  assert.equal(tick(0, 0), "5m ago", "the first tick is labelled from its real timestamp");
  assert.equal(tick(2, 2), "now", "the last tick is labelled now");
}

async function verifyGraphMountsOnBind(context) {
  const react = await context.importDist("react");
  const root = await context.importDistRoot();
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  document.body.innerHTML = renderToStaticMarkup(createElement(react.cpu_graph, {
        datasets: [{ label: "cpu", points: [{ label: "now", value: 5 }] }],
        id: "soft_nav_graph",
  }));
  const mount = document.getElementById("soft_nav_graph_mount");
  assert.ok(mount, "the graph mount is present in server markup");
  assert.equal(mount.getAttribute("data-graph-root"), null, "nothing is mounted before binding");
  const mounted = root.mountGraphCards(document);
  assert.ok(mounted >= 1, "binding mounts graph cards that a soft navigation brought in");
  assert.equal(root.mountGraphCards(document), 0, "already mounted graphs are not mounted twice");
  document.body.innerHTML = "";
}

async function verifyViewportCenter(context) {
  const { ViewportCenter } = await context.importDist("react");
  const React = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const html = renderToStaticMarkup(
    React.createElement(ViewportCenter, { className: "content" }, "Centered"),
  );
  assert.match(html, /class="tbf-viewport-center content"/u);
  assert.match(html, /data-tbf-viewport-center=""/u);
  const styles = await fs.readFile(
    path.join(context.rootDir, "dist", "layout", "styles", "index.scss"),
    "utf8",
  );
  assert.ok(styles.includes('var(#{ns.css-var("layout-top-offset")}, 0px)'));
  assert.ok(styles.includes('var(#{ns.css-var("layout-content-padding-block-start")}, 0px)'));
  assert.ok(styles.includes('var(#{ns.css-var("layout-content-padding-block-end")}, 0px)'));
  assert.ok(
    styles.includes(
      "#{ns.data(\"layout-content\")} > #{ns.data(\"viewport-center\")}",
    ),
  );
}

export {
  verifyGraphEmptyState,
  verifyGraphMountsOnBind,
  verifyGraphShellIsUniform,
  verifyGraphTimeLabels,
  verifyNamespace,
  verifyPopover,
  verifyPopoverReactEvents,
  verifyViewportCenter,
  verifyWizard,
};
