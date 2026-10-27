import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

async function verifyQuote(importDist, rootDir) {
  const react = await importDist("react");
  const html = renderToStaticMarkup(h(react.Quote, { cite: "- Someone, 2015" }, "Words worth keeping."));
  assert.match(html, /^<figure class="tbf-quote">/u, "a quote is a figure, so its source belongs to it");
  assert.match(html, /<svg aria-hidden="true" class="tbf-quote__mark"/u, "the quote mark is decoration, hidden from screen readers");
  assert.match(html, /<blockquote class="tbf-quote__text">Words worth keeping\.<\/blockquote>/u, "the words are a real blockquote");
  assert.match(html, /<figcaption class="tbf-quote__cite">- Someone, 2015<\/figcaption>/u, "the source is its caption");
  assert.ok(!renderToStaticMarkup(h(react.Quote, null, "Alone.")).includes("figcaption"), "a quote without a source renders no caption");
  const styles = await fs.readFile(path.join(rootDir, "dist", "primitives", "styles", "_quote.scss"), "utf8");
  assert.match(styles, /border-inline-start: token\("root-border-width"/u, "the rule runs down the start edge");
  assert.match(styles, /"cite"\)\} \{\n {2}align-self: flex-end;/u, "the source sits at the end, under the words");
}

export { verifyQuote };
