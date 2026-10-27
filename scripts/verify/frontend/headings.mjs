import assert from "node:assert/strict";

async function render(context) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const react = await context.importDist("react");
  const charts = await context.importDist("graph");
  return { charts, h: (await import("react")).createElement, html: renderToStaticMarkup, react };
}

async function verifyHeadingLevels(context) {
  const { charts, h, html, react } = await render(context);
  const card = (title, ...children) => h(
    "div",
    { className: "card" },
    h(react.HeadingScope, null, h(react.Title, { fit: false }, title), ...children),
  );
  assert.equal(
    html(h(react.Title, { fit: false }, "Page")),
    "<h2>Page</h2>",
    "a heading outside any card is h2, directly under the h1 the page owns",
  );
  const nested = html(card("Outer", card("Inner", card("Deep"))));
  assert.match(nested, /<h2>Outer<\/h2>/u, "a card on the page is a section under its h1, so its title is h2");
  assert.match(nested, /<h3>Inner<\/h3>/u, "a card inside a card titles itself h3");
  assert.match(nested, /<h4>Deep<\/h4>/u, "each card level adds one");
  assert.ok(
    !/<h[3-6]>Outer<\/h[3-6]>/u.test(nested),
    "no level is skipped between the page heading and the first card title",
  );
  const modal = html(card("Page card", h(react.ModalContent, null, h(react.Title, { fit: false }, "Modal"), card("In modal"))));
  assert.match(modal, /<h2>Modal<\/h2>/u, "a modal title is h2 wherever the modal sits");
  assert.match(modal, /<h3>In modal<\/h3>/u, "a card inside a modal is h3");
  assert.match(html(h(react.Title, { fit: false, level: 2 }, "Hero")), /<h2>Hero<\/h2>/u, "an explicit level wins");
  const copy = html(card("Section", h(react.copy_card, { target: "#x", title: "Nested copy" })));
  assert.match(copy, /<h3>Nested copy<\/h3>/u, "a copy card inside a card is h3 without being told");
  const block = html(h(react.TitleDescription, { title: "Block" }, card("Child")));
  assert.match(
    block,
    /<h2[^>]*><span class="tbf-title__fit">Block<\/span><\/h2>[\s\S]*<h3>Child<\/h3>/u,
    "a TitleDescription's children sit exactly one level below it",
  );
  const graph = html(card("Metrics", h(charts.cpu_graph, { datasets: [], id: "lvl_graph", title: "CPU" })));
  assert.match(graph, /id="lvl_graph_mount"[^>]*data-tbf-heading-level="3"/u, "a graph nested in a card titles itself h3");
}

async function verifyTitleFit(context) {
  const { h, html, react } = await render(context);
  const fitted = html(h(react.Title, { className: "tbf-text-xl6", level: 2 }, "Open roles"));
  const shape = /^<h2 class="tbf-title tbf-text-xl6" style="[^"]*"><span class="tbf-title__fit">Open roles<\/span><\/h2>$/u;
  assert.match(fitted, shape, "a title fits by default");
  assert.match(fitted, /--tbf-title-w0:calc\([^;]*var\(--tbf-glyph-79\)/u, "each word is a sum of glyph widths");
  const oneLine = /--tbf-title-size:min\(calc\(100cqi \/ \(calc\(var\(--tbf-title-w0\) \+ var\(--tbf-title-w1\)/u;
  assert.match(fitted, oneLine, "one line is the first candidate");
  assert.match(fitted, /clamp\(0px, \(1em - /u, "a candidate smaller than the title's own size is passed over");
  const long = html(h(react.Title, { level: 2 }, "Break a rule and the app does not run"));
  assert.match(long, /max\(calc\(var\(--tbf-title-w0\) \+ var\(--tbf-title-w1\)[^;]*\)/u, "longer titles try balanced splits");
  const czech = html(h(react.Title, { level: 2 }, "Správa"));
  assert.match(czech, /var\(--tbf-glyph-97\)/u, "a letter with a diacritic is measured as its base letter");
  const other = html(h(react.Title, { level: 2 }, "Ø"));
  assert.match(other, /var\(--tbf-glyph-other\)/u, "a character outside the measured range takes the average letter width");
  const told = html(h(react.Title, { level: 1, text: "Made for you" }, h("span", null, "styled")));
  assert.match(told, /^<h1 class="tbf-title"/u, "level 1 is a page title");
  assert.match(told, /var\(--tbf-glyph-77\)/u, "text replaces the children as the text to fit");
  assert.equal(html(h(react.Title, { fit: false, level: 3 }, "Plain")), "<h3>Plain</h3>", "fit false keeps a plain heading");
  assert.equal(html(h(react.Title, { level: 3 })), "<h3></h3>", "a title with no text is not fitted");
  const { normalizeFrontendConfig } = await context.importDist("config");
  const forVersion = context.packageVersion;
  assert.equal(normalizeFrontendConfig({ forVersion }).design.titles.fit, null, "title fit is off unless configured");
  assert.throws(
    () => normalizeFrontendConfig({ design: { titles: { fit: { below: "huge" } } }, forVersion }),
    /design\.titles\.fit\.below huge is not a design breakpoint/u,
    "fit below names a design breakpoint",
  );
  assert.throws(
    () => normalizeFrontendConfig({ design: { titles: { fit: {} } }, forVersion }),
    /design\.titles\.fit\.font is required/u,
    "fit needs a title font it can read",
  );
}

async function verifyHeadings(context) {
  await verifyHeadingLevels(context);
  await verifyTitleFit(context);
}

export { verifyHeadings };
