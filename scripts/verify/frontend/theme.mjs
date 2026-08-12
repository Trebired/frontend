import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { workspaceConfigDir } from "#kdfvp4fq2m77";
import { settleDom } from "./timing.mjs";

async function verifyFrontendTheme(context) {
  await verifyThemeConfigModes(context);
  await verifyThemeConfigDependencies(context);
  await verifyThemeRuntimeModes(context);
  await verifyThemeBrowserSync(context);
  await verifyThemeRuntimeRebind(context);
  await verifyThemeControls(context);
  await verifyThemeComponents(context);
}

function modeConfigSource() {
  return [
    "import { surface } from \"./tokens.js\";",
    "",
    "export default {",
    "  prefix: \"app\",",
    "  runtime: {",
    "    theme: {",
    "      defaultMode: \"sepia\",",
    "      modes: {",
    "        dark: { tokens: { color: { surface: surface.dark } } },",
    "        light: { tokens: { color: { surface: surface.light } } },",
    "        sepia: { label: \"Sepia\", scheme: \"light\", tokens: { color: { surface: surface.sepia } } },",
    "      },",
    "    },",
    "  },",
    "};",
    "",
  ].join("\n");
}

function tokenSource(sepia) {
  return [
    "const surface = {",
    "  dark: \"#101014\",",
    "  light: \"#ffffff\",",
    `  sepia: "${sepia}",`,
    "};",
    "",
    "export { surface };",
    "",
  ].join("\n");
}

async function writeThemeFixture(rootDir, name, sepia) {
  const fixture = path.join(rootDir, ".tmp", "verify-frontend", name);
  const configDir = path.join(fixture, await workspaceConfigDir(rootDir), "frontend");
  await fs.rm(fixture, { force: true, recursive: true });
  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(path.join(configDir, "config.ts"), modeConfigSource());
  await fs.writeFile(path.join(configDir, "tokens.ts"), tokenSource(sepia));
  return { configDir, fixture };
}

async function verifyThemeConfigModes(context) {
  const config = await context.importDist("config");
  const { fixture } = await writeThemeFixture(context.rootDir, "theme-config", "#f4ecd8");
  const loaded = await config.loadFrontendConfig(fixture);
  const scss = loaded.generatedScss;

  assert.deepEqual(loaded.config.runtime.theme.modes.map((mode) => mode.key), ["dark", "light", "sepia"]);
  assert.equal(loaded.config.runtime.theme.dark, "dark");
  assert.equal(loaded.config.runtime.theme.light, "light");
  assert.equal(loaded.config.runtime.theme.defaultMode, "sepia");
  assert.ok(scss.includes("--app-theme-modes: \"dark light sepia\";"));
  assert.ok(scss.includes("--app-theme-default: \"sepia\";"));
  assert.ok(scss.includes("[data-tbf-theme=\"sepia\"] {"));
  assert.ok(scss.includes("--app-color-surface: #f4ecd8;"));
  assert.ok(scss.includes("@media (prefers-color-scheme: dark) {"));
  assert.ok(scss.includes(":root:not([data-tbf-theme]) {"));
  assert.equal(config.THEME_MODE_ATTRIBUTE, "data-tbf-theme");
  assert.throws(
    () => config.normalizeFrontendConfig({ runtime: { theme: { modes: { dark: { color: "#000" } } } } }),
    /invalid-config/u,
  );
  assert.throws(
    () => config.normalizeFrontendConfig({ runtime: { theme: { dark: "missing", modes: { light: {} } } } }),
    /theme\.dark must name a mode/u,
  );
}

async function verifyThemeConfigDependencies(context) {
  const config = await context.importDist("config");
  const { configDir, fixture } = await writeThemeFixture(context.rootDir, "theme-deps", "#f4ecd8");
  const tokensPath = path.join(configDir, "tokens.ts");

  const first = await config.loadFrontendConfig(fixture);
  assert.ok(first.dependencies.includes(path.join(configDir, "config.ts")));
  assert.ok(first.dependencies.includes(tokensPath));
  assert.ok(first.generatedScss.includes("--app-color-surface: #f4ecd8;"));

  await fs.writeFile(tokensPath, tokenSource("#0f0f0f"));
  const second = await config.loadFrontendConfig(fixture);
  assert.ok(second.generatedScss.includes("--app-color-surface: #0f0f0f;"));
  assert.equal(second.generatedScss.includes("#f4ecd8"), false);
}

async function verifyThemeRuntimeModes(context) {
  const theme = await context.importDist("theme");
  const config = await context.importDist("config");
  assert.equal(config.THEME_MODE_ATTRIBUTE, theme.THEME_ATTR);

  theme.configureThemeModes({ modes: ["dark", "light", "sepia"] });
  assert.deepEqual(theme.themeModeKeys(), ["dark", "light", "sepia"]);
  assert.equal(theme.getThemeModes().dark, "dark");
  assert.equal(theme.getThemeModes().light, "light");

  theme.applyTheme("dark");
  assert.equal(theme.nextTheme(), "light");
  theme.applyTheme("sepia");
  assert.equal(theme.nextTheme(), "dark");
  assert.equal(await theme.setTheme("sepia"), "sepia");
  assert.equal(document.documentElement.getAttribute("data-tbf-theme"), "sepia");
  assert.equal(await theme.setTheme("nope"), theme.systemThemeKey());

  const boot = theme.createThemeBootScript("sepia");
  assert.ok(boot.includes("sepia"));
  assert.ok(boot.includes("prefers-color-scheme: light"));
  assert.equal(boot.includes("<"), false);

  theme.configureThemeModes(null);
  assert.deepEqual(theme.themeModeKeys(), ["dark", "light"]);
}

async function verifyThemeBrowserSync(context) {
  const theme = await context.importDist("theme");
  document.head.innerHTML = '<link id="app_favicon" rel="icon" href="/favicon.svg">';
  theme.configureThemeBrowserSync({
      effectiveCookie: { name: "theme_effective" },
      favicon: { href: (key) => `/favicon.svg?theme=${key}` },
  });
  theme.applyTheme("light");
  assert.ok(document.cookie.includes("theme_effective=light"));
  assert.equal(
    document.getElementById("app_favicon").getAttribute("href"),
    "/favicon.svg?theme=light",
  );
}

async function verifyThemeRuntimeRebind(context) {
  const theme = await context.importDist("theme");
  theme.configureThemeModes(null);
  await theme.bindThemeRuntime(document, { defaultTheme: "dark" });
  await theme.setTheme("light");

  const scope = document.createElement("section");
  scope.innerHTML = [
    '<button data-tbf-theme-button data-tbf-theme-light-label="Light">',
    "<span data-tbf-theme-label></span>",
    "</button>",
  ].join("");
  await theme.bindThemeRuntime(scope, { defaultTheme: "dark" });
  assert.equal(document.documentElement.getAttribute("data-tbf-theme"), "light");
  assert.equal(scope.querySelector("[data-tbf-theme-button]").getAttribute("data-tbf-theme-current"), "light");
}

async function verifyThemeControls(context) {
  const theme = await context.importDist("theme");
  theme.configureThemeModes(null);
  document.body.innerHTML = [
    '<button data-tbf-theme-button aria-pressed="true" data-tbf-theme-dark-label="Dark">',
    "<span data-tbf-theme-label></span>",
    "</button>",
  ].join("");
  theme.applyTheme("dark");
  theme.bindThemeControls(document);
  const defaultButton = document.querySelector("[data-tbf-theme-button]");
  assert.equal(defaultButton.hasAttribute("aria-pressed"), false);
  assert.equal(defaultButton.getAttribute("data-tbf-theme-current"), "dark");

  theme.configureThemeModes({ modes: ["dark", "light", "sepia"] });
  document.body.innerHTML = [
    '<button data-tbf-theme-button data-tbf-theme-sepia-label="Sepia">',
    "<span data-tbf-theme-label></span>",
    "</button>",
    "<select data-tbf-theme-select>",
    '<option value="dark">Dark</option>',
    '<option value="light">Light</option>',
    '<option value="sepia">Sepia</option>',
    "</select>",
  ].join("");
  theme.applyTheme("dark");
  theme.bindThemeControls(document);

  const select = document.querySelector("[data-tbf-theme-select]");
  const button = document.querySelector("[data-tbf-theme-button]");
  assert.equal(select.value, "dark");
  assert.equal(button.hasAttribute("aria-pressed"), false);

  select.value = "sepia";
  select.dispatchEvent(new Event("change", { bubbles: true }));
  await settleDom();
  assert.equal(document.documentElement.getAttribute("data-tbf-theme"), "sepia");
  assert.equal(button.getAttribute("data-tbf-theme-current"), "sepia");
  assert.equal(button.querySelector("[data-tbf-theme-label]").textContent, "Sepia");

  button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await settleDom();
  assert.equal(document.documentElement.getAttribute("data-tbf-theme"), "dark");
  assert.equal(select.value, "dark");
  theme.configureThemeModes(null);
}

async function verifyThemeComponents(context) {
  const { ThemeBootScript, ThemeSelect } = await context.importDist("react");
  const modes = ["dark", "light", { key: "sepia", label: "Paper" }];

  const selectHtml = renderToStaticMarkup(h(ThemeSelect, { label: "Theme", modes, value: "sepia" }));
  assert.ok(selectHtml.includes('data-tbf-theme-select=""'));
  assert.ok(selectHtml.includes('value="sepia"'));
  assert.ok(selectHtml.includes("Paper"));
  assert.ok(selectHtml.includes('aria-label="Theme"'));

  const buttonsHtml = renderToStaticMarkup(h(ThemeSelect, { modes, value: "sepia", variant: "buttons" }));
  assert.ok(buttonsHtml.includes('role="radiogroup"'));
  assert.ok(buttonsHtml.includes('data-tbf-theme-value="sepia"'));
  assert.ok(buttonsHtml.includes('aria-checked="true"'));

  const bootHtml = renderToStaticMarkup(h(ThemeBootScript, { modes, theme: "sepia" }));
  assert.ok(bootHtml.includes("sepia"));
  assert.equal(/<script[^>]*>[^]*<[a-z]/u.test(bootHtml.replace("</script>", "")), false);
}

export { verifyFrontendTheme };
