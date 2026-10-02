import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

async function verifySectionSurfaces(context) {
  const react = await context.importDist("react");
  assert.equal(typeof react.PinnedSplit, "function", "a column that stays while the rest scrolls is part of the package");
  assert.equal(typeof react.TrackList, "function", "so is a list drawn on a continuous rule");
  assert.equal(typeof react.TrackItem, "function", "with an item that marks the line");

  const split = renderToStaticMarkup(
    h(react.PinnedSplit, { aside: h("h2", null, "Aside"), asideSide: "end" }, h("p", null, "Body")),
  );
  assert.match(split, /tbf-pinned-split__aside/u, "the pinned column is its own element, so it can be made sticky");
  assert.match(split, /data-tbf-pinned-aside="end"/u, "which side pins is declared, not left to source order");

  const track = renderToStaticMarkup(
    h(react.TrackList, null, h(react.TrackItem, { marker: "01" }, h("p", null, "Step"))),
  );
  assert.match(track, /<ol[^>]*tbf-track/u, "steps are an ordered list, because their order is the point");
  assert.match(track, /tbf-track__mark[^>]*>01</u, "each step marks the line with its own label");
  assert.match(track, /aria-hidden="true"[^>]*tbf-track__mark/u, "the mark is decoration, so it is not read out twice");

  const styles = await fs.readFile(path.join(context.rootDir, "dist", "surface", "styles", "track.scss"), "utf8");
  assert.match(styles, /position: sticky/u, "the pinned column actually pins");
  for (const token of ["adaptive", "adaptive-border"]) {
    assert.ok(styles.includes(`ns.css-var("${token}")`), `the track reads ${token}, so it suits the surface it is on`);
  }
}

export { verifySectionSurfaces };
