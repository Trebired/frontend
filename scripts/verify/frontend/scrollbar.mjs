import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

async function verifyScrollbarFollowsTheDevice(rootDir, importDist) {
  const base = await fs.readFile(path.join(rootDir, "dist", "styles", "utils", "base.scss"), "utf8");
  assert.match(
    base,
    /html \{\n\s*color-scheme: var\(#\{ns\.css-var\("surf-scrollbar-root-scheme"\)\}, light dark\);/u,
    "the document declares its colour scheme in css, so native chrome is right at first paint",
  );
  const { createThemeBootScript } = await importDist("theme");
  const boot = createThemeBootScript("dark", { dark: "dark", light: "light", modes: { dark: {}, light: {} } });
  assert.equal(
    boot.includes("colorScheme"),
    false,
    "the theme boot script must not write an inline colour scheme: the scrollbar follows the device, like the favicon, and css already says so",
  );
}

export { verifyScrollbarFollowsTheDevice };
