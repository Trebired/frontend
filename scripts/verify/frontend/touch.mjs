import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

function withTouch(run) {
  const original = window.matchMedia;
  window.matchMedia = (query) => ({ matches: query === "(hover: none)", media: query });
  try {
    return run();
  } finally {
    window.matchMedia = original;
  }
}

function verifyNoScrollWork(root) {
  const paragraph = document.createElement("p");
  paragraph.className = "verify-reveal";
  document.body.append(paragraph);
  const revealed = withTouch(() => root.bindReveals(document, { selector: ".verify-reveal" }));
  const frosted = withTouch(() => root.bindFrost(document));
  assert.equal(revealed, 0, "a touch device reveals nothing, or blocks slide into place while the page scrolls");
  assert.equal(paragraph.hasAttribute("data-tbf-reveal"), false, "a touch device leaves the blocks alone");
  assert.equal(frosted, 0, "a touch device measures no frost, since it paints no blur");
  paragraph.remove();
}

function verifyScrollScripts(root) {
  const { bodyScripts, bootScripts } = root.frontendBoot();
  const tone = bodyScripts.join("");
  assert.match(tone, /addEventListener\('scroll',y,/u, "the header tone measures once a frame, not on every scroll event");
  assert.match(tone, /requestAnimationFrame\(function\(\)\{q=0;u\(\)\}\)/u);
  assert.match(tone, /if\(o\.getAttribute\(T\)!==c\)o\.setAttribute\(T,c\)/u, "the tone writes only on a change");
  const scroll = bootScripts.find((script) => script.includes("data-tbf-scrolled"));
  assert.match(scroll, /if\(h\.getAttribute\(A\)!==n\)h\.setAttribute\(A,n\)/u, "the scroll state writes only on a change");
}

async function verifySheets(context) {
  const read = (file) => fs.readFile(path.join(context.sourceDir, file), "utf8");
  const frost = await read("styles/utils/_frost.scss");
  assert.match(frost, /@media \(hover: none\) \{\n\s+backdrop-filter: none;/u, "a touch device paints a tint, never a live blur");
  assert.match(await read("reveal/styles/index.scss"), /\(hover: hover\)/u, "reveal motion needs a pointer that hovers");
  assert.doesNotMatch(await read("layout/styles/index.scss"), /100dvh/u, "page heights must not follow the address bar");
}

async function verifyTouch(context) {
  const root = await context.importDistRoot();
  verifyNoScrollWork(root);
  verifyScrollScripts(root);
  await verifySheets(context);
}

export { verifyTouch };
