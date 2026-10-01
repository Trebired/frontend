import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

async function verifyContrast(rootDir, importDist) {
  const api = await importDist("");
  assert.equal(typeof api.bindContrast, "function", "the contrast binding is part of the package");
  assert.equal(api.ON_DARK_ATTR, "data-tbf-on-dark", "the state it sets is namespaced");
  assert.equal(api.CONTRAST_ATTR, "data-tbf-contrast", "a site opts an element in with one attribute");
  assert.equal(api.MIRROR_ATTR, "data-tbf-contrast-mirror", "and mirrors another surface with another");

  const styles = await fs.readFile(path.join(rootDir, "dist", "contrast", "styles", "index.scss"), "utf8");
  assert.match(styles, /ns\.data\("on-dark", "true"\)/u, "the dark state is what carries the swap");
  for (const token of ["text", "text-muted", "border"]) {
    assert.ok(
      styles.includes(`ns.css-var("${token}")`),
      `${token} is handed to the contents, so a link or a label inside reads without knowing where it is`,
    );
  }
  for (const over of ["contrast-dark-text", "contrast-dark-text-muted", "contrast-dark-border"]) {
    assert.ok(styles.includes(over), `${over} lets a site set what dark means for it`);
  }

  assert.equal(
    api.bindContrast({ querySelectorAll: () => [] }) instanceof Function
    ||typeof api.bindContrast({ querySelectorAll: () => [] }) === "function",
    true,
    "binding returns the teardown",
  );

  assert.equal(api.SURFACE_ATTR, "data-tbf-contrast-surface", "a panel that paints its own background says so");
  assert.ok(
    styles.includes('ns.css-var("contrast-base-" + $token)'),
    "the page's own value for each colour is kept at the root, so restoring it is exact",
  );
  assert.match(
    styles,
    /ns\.data\("on-dark", "false"\)/u,
    "the light state is written too, or chrome keeps dark colours after it leaves dark content",
  );
  verifyPinnedTokens(styles);

  assert.match(styles, /contrast-duration/u, "a change of state eases rather than snapping");
  await verifyAdaptiveColour(rootDir);
  await verifyBackdropReading(rootDir, api, styles);
  await verifySiteHeaderDeclaresItsState(importDist);
}

function verifyPinnedTokens(styles) {
  const pinned = [
    "shell-header-link-color",
    "shell-header-link-active-color",
    "shell-language-trigger-color",
    "shell-header-brand-button-color",
  ];
  for (const token of pinned) {
    assert.ok(
      styles.includes(`ns.css-var("${token}")`),
      `${token} is set on the surface, or a site that pinned it for one background keeps that colour over the other`,
    );
    assert.ok(
      styles.includes(`"${token}"`),
      `${token} is in the list captured at the root, or there is nothing exact to restore it to`,
    );
  }
}

async function verifyAdaptiveColour(rootDir) {
  const adaptive = await fs.readFile(path.join(rootDir, "dist", "contrast", "styles", "adaptive.scss"), "utf8");
  assert.match(adaptive, /^\*,/mu, "the adaptive colour is declared on every element, or it freezes at the root");
  for (const token of ["adaptive", "adaptive-muted", "adaptive-border"]) {
    assert.ok(adaptive.includes(`ns.css-var("${token}")`), `${token} is part of the adaptive colour a component can read`);
  }
  const controls = await fs.readFile(path.join(rootDir, "dist", "primitives", "styles", "_controls.scss"), "utf8");
  assert.match(
    controls,
    /secondary-color"\)[\s\S]{0,200}css-var\("adaptive"\)/u,
    "an outlined button reads against the surface it sits on rather than inheriting a colour chosen elsewhere",
  );
}

async function verifyBackdropReading(rootDir, api, styles) {
  const source = await fs.readFile(path.join(rootDir, "dist", "contrast", "index.js"), "utf8");
  assert.ok(source.includes("DEFAULT_SURFACES"), "a solid panel is judged by its own background, not by what is behind it");
  assert.equal(
    /\[\/,\]/u.test(source),
    false,
    "a comma is not an alpha separator, or rgb(0, 0, 0) reads as transparent and a dark backdrop is skipped",
  );
  assert.ok(source.includes("isShown"), "an element with no box is left alone rather than given a state it never measured");
  assert.ok(
    source.includes("shownSource"),
    "a mirror follows the first source that is actually shown, or the menu copies a link the phone has hidden",
  );
  assert.ok(
    source.includes("BASE_BACKGROUND"),
    "a panel is judged by the background it has without the state, or setting the state changes the reading and it flickers",
  );
  assert.ok(
    source.includes("hits.slice(behind + 1)"),
    "only what lies behind the element is its backdrop, or something painted in front of it decides its colour",
  );
  assert.ok(
    source.includes("indexOf(item)"),
    "a point where the element is not hit is not a reading, or a page mid-load reports the document root as the backdrop",
  );

  assert.equal(api.SETTLING_ATTR, "data-tbf-contrast-settling", "the swap marks the document so nothing tweens across it");
  assert.equal(typeof api.settleContrast, "function", "a page change can ask for the same suppression");
  assert.match(
    styles,
    /contrast-settling[\s\S]*transition: none/u,
    "chrome does not animate its colours across a page change, or a logo fades from the old colour to the new one",
  );
  const navigate = await fs.readFile(path.join(rootDir, "dist", "spa", "navigate.js"), "utf8");
  assert.ok(navigate.includes("settleContrast"), "the soft navigation marks the swap, which is when the colours change");

  assert.equal(typeof api.createContrastBootScript, "function", "a site can seed the state before anything is parsed");
  const boot = api.createContrastBootScript();
  assert.match(boot, /pagehide/u, "the state is remembered when the page goes away");
  assert.match(boot, /back_forward|reload/u, "and put back on a reload, which is when the browser restores the scroll position");
  assert.ok(!boot.includes("elementsFromPoint"), "the seed is applied from the head, where there is nothing to measure yet");
  assert.match(
    styles,
    /contrast-seed/u,
    "the seed is CSS, or it cannot reach the first painted frame: the browser paints before the document finishes parsing",
  );

  const footer = await fs.readFile(path.join(rootDir, "dist", "layout", "styles", "site-footer.scss"), "utf8");
  assert.ok(
    footer.includes('css-var("contrast-ink")'),
    "an inverted footer paints itself with the page's ink, not with the token the dark state rewrites",
  );
}

async function verifySiteHeaderDeclaresItsState(importDist) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  const react = await importDist("react");
  const html = renderToStaticMarkup(createElement(react.SiteHeader, { brand: "Site", links: [], onDark: true }));
  assert.match(html, /data-tbf-on-dark="true"/u, "the server can declare the state, or the first frame waits for a measurement");
  const unset = renderToStaticMarkup(createElement(react.SiteHeader, { brand: "Site", links: [] }));
  assert.equal(unset.includes("data-tbf-on-dark"), false, "and a header that declares nothing is left to the measurement");
}

export { verifyContrast };
