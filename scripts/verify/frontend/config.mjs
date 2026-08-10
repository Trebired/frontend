import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

async function verifyFrontendConfig(context) {
  const config = await context.importDist("config");
  const fixture = path.join(context.rootDir, ".tmp", "verify-frontend", "config");
  await fs.rm(fixture, { force: true, recursive: true });
  await fs.mkdir(path.join(fixture, context.configDirName, "frontend"), { recursive: true });
  assertDefaultConfig(await config.loadFrontendConfig(fixture), context);

  const configPath = path.join(fixture, context.configRelPath);
  await fs.writeFile(configPath, configuredSource());
  const loaded = await config.loadFrontendConfig(fixture);
  assertLoadedConfig(loaded, configPath, config);
  await assert.rejects(
    () => fs.access(path.join(fixture, context.configDirName, "frontend", "generated", "styles.scss")),
    /ENOENT/u,
  );

  await fs.writeFile(configPath, "export default { prefix: \"bad prefix\" };\n");
  await assert.rejects(() => config.loadFrontendConfig(fixture), /invalid-config/u);
  await fs.writeFile(configPath, "export default { fonts: { families: { bad: { package: \"https://bad\" } } } };\n");
  await assert.rejects(() => config.loadFrontendConfig(fixture), /Fontsource package name/u);
}

function configuredSource() {
  return [
    "export default {",
    "  fonts: { families: { sans: { package: \"inter\", family: \"Inter\" } } },",
    "  prefix: \"app\",",
    "  interactions: { active: { brightness: 0.8, enabled: true } },",
    "  components: {",
    "    progress: { color: \"#111111\" },",
    "    textLink: { color: \"#222222\", hover: { color: \"#333333\" } },",
    "  },",
    "  icons: { packs: [\"simple-icons\"], endpoint: \"/icons/svg\" },",
    "  systems: { modal: false, icons: true },",
    "  theme: { cssVariables: true, tokens: { color: { brand: \"#123456\" } } },",
    "};",
    "",
  ].join("\n");
}

function assertDefaultConfig(defaults, context) {
  assert.equal(defaults.configPath, null);
  assert.equal(defaults.config.prefix, "tbf");
  assert.equal(defaults.config.interactions.active.enabled, false);
  assert.equal(defaults.config.interactions.active.brightness, "0.9");
  assert.equal(defaults.config.interactions.active.filter, "none");
  assert.equal(defaults.generatedScss.includes(context.packageName), false);
  assert.ok(defaults.generatedScss.includes("--tbf-interaction-active-filter: none;"));
  for (const system of ["modal", "theme", "layout", "language", "logs", "sidebar", "fullscreen"]) {
    assert.ok(defaults.generatedScss.includes(`${system}/styles/index.scss`));
  }
}

function assertLoadedConfig(loaded, configPath, config) {
  assert.equal(loaded.configPath, configPath);
  assert.deepEqual(loaded.config.icons.packs, ["simple-icons"]);
  assert.equal(loaded.config.fonts.families[0].packageName, "inter");
  assert.equal(loaded.config.interactions.active.filter, "brightness(0.8)");
  assert.ok(loaded.generatedScss.includes("@fontsource/inter/files/inter-latin-400-normal.woff2"));
  assert.equal(loaded.generatedScss.includes("modal/styles/index.scss"), false);
  assert.ok(loaded.generatedScss.includes("--app-color-brand: #123456;"));
  assert.ok(loaded.generatedScss.includes("--app-interaction-active-filter: brightness(0.8);"));
  assert.ok(loaded.generatedScss.includes("--app-progress-color: #111111;"));
  assert.ok(loaded.generatedScss.includes("--app-text-link-color: #222222;"));
  assert.ok(loaded.generatedScss.includes("--app-text-link-hover-color: #333333;"));
  assert.equal(config.normalizeFrontendConfig({ interactions: { active: { enabled: false } } }).interactions.active.filter, "none");
  assert.equal(config.normalizeFrontendConfig({ interactions: { active: { enabled: true } } }).interactions.active.filter, "brightness(0.9)");
  assert.equal(typeof config.writeGeneratedFrontendScss, "undefined");
}

export { verifyFrontendConfig };
