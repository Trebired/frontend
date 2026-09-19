import assert from "node:assert/strict";

async function render(context) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const react = await context.importDist("react");
  return { h: (await import("react")).createElement, html: renderToStaticMarkup, react };
}

async function verifyHeadingLevels(context) {
  const { h, html, react } = await render(context);
  const card = (title, ...children) => h(react.Card, null, h(react.Title, null, title), ...children);
  assert.equal(html(h(react.Title, null, "Page")), "<h3>Page</h3>", "a heading outside any card is h3");
  const nested = html(card("Outer", card("Inner", card("Deep"))));
  assert.match(nested, /<h3>Outer<\/h3>/u, "a card title is h3");
  assert.match(nested, /<h4>Inner<\/h4>/u, "a card inside a card titles itself h4");
  assert.match(nested, /<h5>Deep<\/h5>/u, "each card level adds one");
  const modal = html(card("Page card", h(react.ModalContent, null, h(react.Title, null, "Modal"), card("In modal"))));
  assert.match(modal, /<h3>Modal<\/h3>/u, "a modal title is h3 wherever the modal sits");
  assert.match(modal, /<h4>In modal<\/h4>/u, "a card inside a modal is h4");
  assert.match(html(h(react.Title, { level: 2 }, "Hero")), /<h2>Hero<\/h2>/u, "an explicit level wins");
  const copy = html(card("Section", h(react.copy_card, { target: "#x", title: "Nested copy" })));
  assert.match(copy, /<h4>Nested copy<\/h4>/u, "a copy card inside a card is h4 without being told");
  const block = html(h(react.TitleDescription, { title: "Block" }, card("Child")));
  assert.match(block, /<h3>Block<\/h3>[\s\S]*<h4>Child<\/h4>/u, "a TitleDescription's children sit one level below it");
  const graph = html(card("Metrics", h(react.cpu_graph, { datasets: [], id: "lvl_graph", title: "CPU" })));
  assert.match(graph, /id="lvl_graph_mount"[^>]*data-tbf-heading-level="4"/u, "a graph nested in a card titles itself h4");
}

export { verifyHeadingLevels };
