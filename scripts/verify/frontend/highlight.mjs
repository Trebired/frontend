import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function verifyHighlightAttrs(root) {
  assert.deepEqual(root.highlightAttrs("repo_transfer"), { "data-tbf-highlight": "repo_transfer" }, "an element id becomes the highlight attribute");
  assert.deepEqual(root.highlightAttrs("two words"), {}, "a value with spaces is never an id");
  assert.deepEqual(root.highlightAttrs(""), {}, "an empty id adds nothing");
}

async function verifyHighlightRing(root) {
  document.body.innerHTML = '<main><div id="target" class="target">Target</div><div class="target">Other</div></main>';
  assert.equal(root.highlightElement("missing"), false, "a missing id highlights nothing");
  assert.equal(root.highlightElement(".target"), false, "a class selector is not an id");
  assert.equal(root.highlightElement("target", { duration: 300 }), true, "an existing id is highlighted");
  assert.equal(document.querySelectorAll("[data-tbf-highlight-ring]").length, 1, "one ring is drawn");
  root.highlightElement("target", { duration: 300 });
  assert.equal(document.querySelectorAll("[data-tbf-highlight-ring]").length, 1, "a new highlight replaces the previous ring");
  await wait(400);
  assert.equal(document.querySelectorAll("[data-tbf-highlight-ring]").length, 0, "the ring is removed after its duration");
  root.highlightElement("target");
  root.clearHighlight();
  assert.equal(document.querySelectorAll("[data-tbf-highlight-ring]").length, 0, "clearHighlight removes the ring");
}

async function verifyHighlightAfterSoftRedirect(root) {
  document.body.innerHTML = [
    "<main data-tbf-live-content>",
    '<div id="go" data-tbf-href="/next" data-tbf-highlight="next_target">Go</div>',
    "</main>",
  ].join("");
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async() => new Response(
    [
      "<!doctype html><html><head><title>Next</title></head><body>",
      '<main data-tbf-live-content><section id="next_target">Here</section></main>',
      "</body></html>",
    ].join(""),
    { headers: { "Content-Type": "text/html" } },
  );
  const runtime = root.bindFrontendRuntime(document, { observe: false, quiet: true });
  try {
    document.getElementById("go").click();
    for (let index = 0; index < 40 && !document.querySelector("[data-tbf-highlight-ring]"); index += 1) await wait(25);
    assert.ok(document.getElementById("next_target"), "the soft redirect swapped the page");
    assert.equal(document.querySelectorAll("[data-tbf-highlight-ring]").length, 1, "the target on the new page is highlighted");
  } finally {
    root.clearHighlight();
    runtime.disconnect();
    globalThis.fetch = previousFetch;
    history.replaceState({}, "", "/current");
  }
}

async function verifyHighlightTriggerMarkup(importDist) {
  const react = await importDist("react");
  const html = renderToStaticMarkup(
    createElement(react.card_body ? () => react.card_body({ actionTrigger: { highlight: "repo_transfer", href: "/repo" }, title: "Repo" }) : "div"),
  );
  assert.match(html, /data-tbf-href="\/repo"/u, "the card links to its page");
  assert.match(html, /data-tbf-highlight="repo_transfer"/u, "the card names the element to highlight");
  const target = renderToStaticMarkup(createElement(() => react.card_body({ id: "repo_transfer", title: "Transfer" })));
  assert.match(target, /id="repo_transfer"/u, "a card row can be a highlight target");
}

async function verifyHighlight(context) {
  const root = await context.importDistRoot();
  verifyHighlightAttrs(root);
  await verifyHighlightRing(root);
  await verifyHighlightAfterSoftRedirect(root);
  await verifyHighlightTriggerMarkup(context.importDist);
}

export { verifyHighlight };
