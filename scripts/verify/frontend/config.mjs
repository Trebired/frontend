import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

async function verifyFrontendConfig(context) {
  const config = await context.importDist("config");
  const fixture = path.join(context.rootDir, ".tmp", "verify-frontend", "config");
  await fs.rm(fixture, { force: true, recursive: true });
  await fs.mkdir(path.join(fixture, context.configDirName, "frontend"), { recursive: true });
  assertDefaultConfig(await config.loadConfig(fixture), context);

  const configPath = path.join(fixture, context.configRelPath);
  await fs.writeFile(configPath, configuredSource(context));
  const loaded = await config.loadConfig(fixture);
  assertLoadedConfig(loaded, configPath, config, context);
  assertTokenHelpers(config);
  await assert.rejects(
    () => fs.access(path.join(fixture, context.configDirName, "frontend", "generated", "styles.scss")),
    /ENOENT/u,
  );

  await fs.writeFile(
    configPath,
    `export default { forVersion: "${context.packageVersion}", prefix: "bad prefix" };\n`,
  );
  await assert.rejects(() => config.loadConfig(fixture), /invalid-config/u);
  await fs.writeFile(configPath, "export default { fonts: { families: {} } };\n");
  await assert.rejects(() => config.loadConfig(fixture), /not supported/u);
  await fs.writeFile(
    configPath,
    `export default { forVersion: "${context.packageVersion}", assets: { fonts: { families: { bad: { package: "https://bad" } } } } };\n`,
  );
  await assert.rejects(() => config.loadConfig(fixture), /Fontsource package name/u);
  await verifyTextBody(config, fixture, configPath, context);
}

async function verifyTextBody(config, fixture, configPath, context) {
  await fs.writeFile(configPath, `export default { forVersion: "${context.packageVersion}", design: { scales: { textBody: "lg" } } };\n`);
  const loaded = await config.loadConfig(fixture);
  assert.equal(loaded.config.design.scales.textBody, "lg");
  assert.ok(loaded.generatedScss.includes("--text-size-body: var(--text-size-lg);"), "the body step is the one a site names");
  await fs.writeFile(configPath, `export default { forVersion: "${context.packageVersion}", design: { scales: { textBody: "huge" } } };\n`);
  await assert.rejects(() => config.loadConfig(fixture), /scales.textBody must name a step/u);
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

  assert.equal(String(helpers.color("gray", 900)), "var(--gray-900)");
  assert.equal(String(helpers.modeColor("gray", 900, "dark")), "var(--gray-900-dark)");
  assert.equal(String(helpers.semantic("background-surface-1")), "var(--background-surface-1)");
  assert.equal(
    String(helpers.variable("radius-md", helpers.variable("radius", "0"))),
    "var(--radius-md, var(--radius, 0))",
  );
  assert.equal(
    String(helpers.border(helpers.semantic("background-surface-1"))),
    "var(--border-width) solid var(--background-surface-1)",
  );
  assert.equal(
    String(helpers.colorMix(helpers.color("blue", 400), "22%")),
    "color-mix(in srgb, var(--blue-400) 22%, transparent)",
  );
}

function configuredSource(context) {
  return [
    "export default {",
    `  forVersion: "${context.packageVersion}",`,
    "  assets: {",
    "    fonts: { families: { sans: { package: \"inter\", family: \"Inter\" } } },",
    "    icons: {",
    "      aliases: { add: \"remixicon:add-line\", github: { pack: \"simple-icons\", name: \"github\" } },",
    "      packs: [\"simple-icons\"],",
    "      endpoint: \"/icons/svg\",",
    "    },",
    "  },",
    "  design: {",
    "    interactions: { activePress: { brightness: 0.8, enabled: true } },",
    "    semantics: { color: { brand: \"#123456\" } },",
    "  },",
    "  components: {",
    "    overlays: {",
    "      modal: { content: { background: \"#111111\" }, motion: { initialScale: \"0.92\" } },",
    "    },",
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

function assertScalesInRem(css) {
  const spacing = css.split("\n").filter((line) => line.includes("--space-"));
  const text = css.split("\n").filter((line) => line.includes("--text-size-"));
  assert.ok(spacing.length > 0 && text.length > 0, "the scales are emitted at all");
  for (const line of [...spacing, ...text]) {
    assert.equal(line.includes("px"), false, `a reader's own font size has to move this: ${line.trim()}`);
  }
}

function assertDefaultConfig(defaults, context) {
  assert.equal(defaults.configPath, null);
  assert.equal(defaults.config.prefix, "tbf");
  assert.equal(defaults.config.assets.icons.mode, "server");
  assert.equal(defaults.config.design.interactions.activePress.enabled, false);
  assert.equal(defaults.config.design.interactions.activePress.brightness, "0.9");
  assert.equal(defaults.config.design.interactions.activePress.filter, "none");
  assert.equal(defaults.generatedScss.includes(context.packageName), false);
  assert.ok(defaults.generatedScss.includes("--tbf-interaction-active-filter: none;"));
  assert.ok(defaults.generatedScss.includes("--tbf-icon-mode: \"server\";"));
  assert.ok(defaults.generatedScss.includes("--tbf-overlay-modal-content-width: min(45rem, calc(100vw - 3rem));"));
  assert.ok(defaults.generatedScss.includes("--tbf-ui-upload-preview-size: 4rem;"));
  assert.ok(defaults.generatedScss.includes("--tbf-media-lightbox-control-radius: 0;"));
  assert.ok(defaults.generatedScss.includes("--tbf-media-lightbox-control-state-hover-bg: "));
  assert.ok(defaults.generatedScss.includes("--tbf-media-expandable-image-icon-size: 2.5rem;"));
  assertScalesInRem(defaults.generatedScss);
  assert.equal(defaults.config.design.scales.textBody, "md");
  assert.ok(defaults.generatedScss.includes("--text-size-body: var(--text-size-md);"), "paragraphs read the scale, not a constant");
  for (const system of ["modal", "theme", "layout", "language", "logs", "sidebar", "fullscreen"]) {
    assert.ok(defaults.generatedScss.includes(`${system}/styles/index.scss`));
  }
}

function assertLoadedConfig(loaded, configPath, config, context) {
  assertLoadedConfigShape(loaded, configPath);
  assertLoadedScss(loaded);
  assertNormalizeFrontendConfig(config, context);
  assert.equal(typeof config.writeGeneratedFrontendScss, "undefined");
}

function assertLoadedConfigShape(loaded, configPath) {
  assert.equal(loaded.configPath, configPath);
  assert.deepEqual(loaded.config.assets.icons.aliases, {
      add: "remixicon:add-line",
      github: "simple-icons:github",
  });
  assert.deepEqual(loaded.config.assets.icons.packs, ["simple-icons"]);
  assert.equal(loaded.config.assets.icons.mode, "server");
  assert.equal(loaded.config.assets.fonts.families[0].packageName, "inter");
  assert.equal(loaded.config.design.interactions.activePress.filter, "brightness(0.8)");
}

function assertLoadedScss(loaded) {
  assert.ok(loaded.generatedScss.includes('@use "sass:meta";'));
  assert.ok(loaded.generatedScss.includes("@include meta.load-css("));
  assert.ok(loaded.generatedScss.includes("@fontsource/inter/files/inter-latin-400-normal.woff2"));
  assert.ok(
    loaded.generatedScss.indexOf("@fontsource/inter/files/inter-latin-400-normal.woff2") <
    loaded.generatedScss.indexOf("styles/tokens.scss"),
  );
  assert.equal(loaded.generatedScss.includes("modal/styles/index.scss"), false);
  assert.ok(loaded.generatedScss.includes("--tbf-color-brand: #123456;"));
  assert.ok(loaded.generatedScss.includes("--tbf-interaction-active-filter: brightness(0.8);"));
  assert.ok(loaded.generatedScss.includes("--tbf-overlay-modal-content-bg: #111111;"));
  assert.ok(loaded.generatedScss.includes("--tbf-overlay-modal-motion-initial-scale: 0.92;"));
  assert.ok(loaded.generatedScss.includes("--tbf-runtime-progress-color: #111111;"));
  assert.ok(loaded.generatedScss.includes("--tbf-ui-link-root-color: #222222;"));
  assert.ok(loaded.generatedScss.includes("--tbf-ui-link-state-hover-color: #333333;"));
  assert.ok(loaded.generatedScss.includes("--tbf-ui-upload-preview-size: 88px;"));
  assert.ok(loaded.generatedScss.includes("--tbf-ui-upload-surface-bg: #eeeeee;"));
}

function assertNormalizeFrontendConfig(config, context) {
  assert.equal(
    config.normalizeFrontendConfig({
        forVersion: context.packageVersion,
        design: { interactions: { activePress: { enabled: false } } },
    }).design.interactions.activePress.filter,
    "none"
  );
  assert.equal(
    config.normalizeFrontendConfig({
        forVersion: context.packageVersion,
        assets: { icons: { endpoint: false, mode: "static" } },
    }).assets.icons.endpoint,
    ""
  );
  assert.equal(
    config.normalizeFrontendConfig({
        forVersion: context.packageVersion,
        design: { interactions: { activePress: { enabled: true } } },
    }).design.interactions.activePress.filter,
    "brightness(0.9)"
  );
  assert.throws(() => config.normalizeFrontendConfig({
        forVersion: context.packageVersion,
        assets: { icons: { endpoint: false } },
    }), /endpoint/u);
}

export { verifyFrontendConfig };
