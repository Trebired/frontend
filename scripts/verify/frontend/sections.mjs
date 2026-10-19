import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

async function verifySectionSurfaces(context) {
  const react = await context.importDist("react");
  for (const name of ["PageBand", "Card", "CardHeader", "ActionRow", "TrackList", "PinnedSplit", "IconTile", "Tag", "Frame"]) {
    assert.equal(react[name], undefined, `${name} is not a component any more, a container is declared in the application config`);
  }

  const canvas = renderToStaticMarkup(
    h(react.BrandCanvas, { action: h("button", null, "Download"), caption: "Light", spec: "clear 1rem" }),
  );
  assert.match(canvas, /brand-canvas__caption-end/u, "a brand canvas carries an action beside its spec");

  const saving = renderToStaticMarkup(
    h(react.Button, { download: "logo.svg", href: "/logo.svg", size: "sm" }, "Download"),
  );
  assert.match(saving, /download="logo\.svg"/u, "a button that links to a file can offer it for saving");

  const hairline = await fs.readFile(new URL("../../../src/surface/styles/hairline.scss", import.meta.url), "utf8");
  assert.match(
    hairline,
    /surf-hairline-root-border"\)\},\s*\n\s*var\(#\{ns\.css-var\("border-width"\)\}, 1px\) solid/u,
    "a hairline panel is outlined by default",
  );

  await verifyThemeReachesComponents();
}

export { verifySectionSurfaces };

async function verifyThemeReachesComponents() {
  const tooltip = await fs.readFile(new URL("../../../src/config/default/component-tokens.ts", import.meta.url), "utf8");
  const tooltipPanel = tooltip.slice(tooltip.indexOf("tooltip: Object.freeze"), tooltip.indexOf("primitives:"));
  for (const frozen of ["background:", "border:", "color:", "fontFamily:", "radius:", "shadow:"]) {
    assert.ok(
      !tooltipPanel.includes(frozen),
      `a tooltip takes ${frozen} from the theme, not from a default frozen at the root`,
    );
  }

  const primitives = await fs.readFile(new URL("../../../src/config/default/primitive-tokens.ts", import.meta.url), "utf8");
  const buttonStart = primitives.indexOf("button: Object.freeze");
  const buttonRoot = primitives.slice(buttonStart, primitives.indexOf("sizes: {", buttonStart));
  for (const frozen of ["border:", "color:"]) {
    assert.ok(
      !buttonRoot.includes(frozen),
      `a button takes ${frozen} from the theme, not from a default frozen at the root`,
    );
  }

  const chrome = ["language", "actions", "surface", "flash"];
  for (const area of chrome) {
    const sheet = await fs.readFile(new URL(`../../../src/${area}/styles/index.scss`, import.meta.url), "utf8");
    assert.ok(
      !/var\(--(text-color|border-surface-[12]|background-surface-[12])\b/u.test(sheet),
      `${area} reads its colours through the frontend namespace, so they follow the contrast state`,
    );
  }

}
