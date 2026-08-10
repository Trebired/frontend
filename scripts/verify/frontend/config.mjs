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
  assertTokenHelpers(config);
  await assert.rejects(
    () => fs.access(path.join(fixture, context.configDirName, "frontend", "generated", "styles.scss")),
    /ENOENT/u,
  );

  await fs.writeFile(configPath, "export default { prefix: \"bad prefix\" };\n");
  await assert.rejects(() => config.loadFrontendConfig(fixture), /invalid-config/u);
  await fs.writeFile(configPath, "export default { fonts: { families: {} } };\n");
  await assert.rejects(() => config.loadFrontendConfig(fixture), /not supported/u);
  await fs.writeFile(configPath, "export default { assets: { fonts: { families: { bad: { package: \"https://bad\" } } } } };\n");
  await assert.rejects(() => config.loadFrontendConfig(fixture), /Fontsource package name/u);
}

function assertTokenHelpers(config) {
  const helpers = config.createFrontendTokenHelpers({
      modes: {
        dark: {
          scale: {
            blue: { 400: "#bbd0fb" },
            gray: { 900: "#1f1f20" },
          },
        },
        light: {
          scale: {
            blue: { 400: "#273659" },
            gray: { 900: "#f3f3f4" },
          },
        },
      },
      semantic: {
        "background-surface-1": { family: "gray", step: "900" },
      },
  });

  assert.equal(helpers.color("gray", 900), "var(--gray-900)");
  assert.equal(helpers.modeColor("gray", 900, "dark"), "var(--gray-900-dark)");
  assert.equal(helpers.semantic("background-surface-1"), "var(--background-surface-1)");
  assert.equal(helpers.variable("radius-md", helpers.variable("radius", "0")), "var(--radius-md, var(--radius, 0))");
  assert.equal(helpers.border(helpers.semantic("background-surface-1")), "var(--border-width) solid var(--background-surface-1)");
  assert.equal(helpers.colorMix(helpers.color("blue", 400), "22%"), "color-mix(in srgb, var(--blue-400) 22%, transparent)");
}

function configuredSource() {
  return [
    "export default {",
    "  prefix: \"app\",",
    "  assets: {",
    "    fonts: { families: { sans: { package: \"inter\", family: \"Inter\" } } },",
    "    icons: { packs: [\"simple-icons\"], endpoint: \"/icons/svg\" },",
    "  },",
    "  design: {",
    "    interactions: { activePress: { brightness: 0.8, enabled: true } },",
    "    semantics: { color: { brand: \"#123456\" } },",
    "  },",
    "  components: {",
    "    primitives: {",
    "      textLink: { root: { color: \"#222222\" }, states: { hover: { color: \"#333333\" } } },",
    "      upload: { preview: { size: \"88px\" }, surface: { background: \"#eeeeee\" } },",
    "    },",
    "  },",
    "  runtime: { progress: { color: \"#111111\" } },",
    "  systems: { modal: false, icons: true },",
    "};",
    "",
  ].join("\n");
}

function assertDefaultConfig(defaults, context) {
  assert.equal(defaults.configPath, null);
  assert.equal(defaults.config.prefix, "tbf");
  assert.equal(defaults.config.design.interactions.activePress.enabled, false);
  assert.equal(defaults.config.design.interactions.activePress.brightness, "0.9");
  assert.equal(defaults.config.design.interactions.activePress.filter, "none");
  assert.equal(defaults.generatedScss.includes(context.packageName), false);
  assert.ok(defaults.generatedScss.includes("--tbf-interaction-active-filter: none;"));
  assert.ok(defaults.generatedScss.includes("--tbf-primitives-upload-preview-size: 64px;"));
  for (const system of ["modal", "theme", "layout", "language", "logs", "sidebar", "fullscreen"]) {
    assert.ok(defaults.generatedScss.includes(`${system}/styles/index.scss`));
  }
}

function assertLoadedConfig(loaded, configPath, config) {
  assert.equal(loaded.configPath, configPath);
  assert.deepEqual(loaded.config.assets.icons.packs, ["simple-icons"]);
  assert.equal(loaded.config.assets.fonts.families[0].packageName, "inter");
  assert.equal(loaded.config.design.interactions.activePress.filter, "brightness(0.8)");
  assert.ok(loaded.generatedScss.includes("@fontsource/inter/files/inter-latin-400-normal.woff2"));
  assert.equal(loaded.generatedScss.includes("modal/styles/index.scss"), false);
  assert.ok(loaded.generatedScss.includes("--app-color-brand: #123456;"));
  assert.ok(loaded.generatedScss.includes("--app-interaction-active-filter: brightness(0.8);"));
  assert.ok(loaded.generatedScss.includes("--app-runtime-progress-color: #111111;"));
  assert.ok(loaded.generatedScss.includes("--app-primitives-text-link-root-color: #222222;"));
  assert.ok(loaded.generatedScss.includes("--app-primitives-text-link-states-hover-color: #333333;"));
  assert.ok(loaded.generatedScss.includes("--app-primitives-upload-preview-size: 88px;"));
  assert.ok(loaded.generatedScss.includes("--app-primitives-upload-surface-background: #eeeeee;"));
  assert.equal(
    config.normalizeFrontendConfig({ design: { interactions: { activePress: { enabled: false } } } }).design.interactions.activePress.filter,
    "none"
  );
  assert.equal(
    config.normalizeFrontendConfig({ design: { interactions: { activePress: { enabled: true } } } }).design.interactions.activePress.filter,
    "brightness(0.9)"
  );
  assert.equal(typeof config.writeGeneratedFrontendScss, "undefined");
}

export { verifyFrontendConfig };
