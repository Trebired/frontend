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
}

export { verifyContrast };
