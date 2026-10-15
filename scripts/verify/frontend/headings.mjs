import assert from "node:assert/strict";

async function render(context) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const react = await context.importDist("react");
  return { h: (await import("react")).createElement, html: renderToStaticMarkup, react };
}

async function verifyHeadingLevels(context) {
  const { h, html, react } = await render(context);
  const card = (title, ...children) => h(
    "div",
    { className: "card" },
    h(react.HeadingScope, null, h(react.Title, null, title), ...children),
  );
  assert.equal(
    html(h(react.Title, null, "Page")),
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
  const modal = html(card("Page card", h(react.ModalContent, null, h(react.Title, null, "Modal"), card("In modal"))));
  assert.match(modal, /<h2>Modal<\/h2>/u, "a modal title is h2 wherever the modal sits");
  assert.match(modal, /<h3>In modal<\/h3>/u, "a card inside a modal is h3");
  assert.match(html(h(react.Title, { level: 2 }, "Hero")), /<h2>Hero<\/h2>/u, "an explicit level wins");
  const copy = html(card("Section", h(react.copy_card, { target: "#x", title: "Nested copy" })));
  assert.match(copy, /<h3>Nested copy<\/h3>/u, "a copy card inside a card is h3 without being told");
  const block = html(h(react.TitleDescription, { title: "Block" }, card("Child")));
  assert.match(
    block,
    /<h2>Block<\/h2>[\s\S]*<h3>Child<\/h3>/u,
    "a TitleDescription's children sit exactly one level below it",
  );
  const graph = html(card("Metrics", h(react.cpu_graph, { datasets: [], id: "lvl_graph", title: "CPU" })));
  assert.match(graph, /id="lvl_graph_mount"[^>]*data-tbf-heading-level="3"/u, "a graph nested in a card titles itself h3");
}

export { verifyHeadingLevels };
