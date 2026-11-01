import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

function presetSource(forVersion, extra = "") {
  return [
    "import { duration } from \"./motion.ts\";",
    "",
    "export default {",
    `  forVersion: "${forVersion}",`,
    "  components: { primitives: { tabs: { motion: { duration, easing: \"ease\" } } } },",
    "  systems: { tooltip: false },",
    extra,
    "};",
    "",
  ].join("\n");
}

function appSource(packageVersion, preset) {
  return [
    "export default {",
    `  forVersion: "${packageVersion}",`,
    `  presets: { use: ["${preset}"] },`,
    "  components: { primitives: { tabs: { motion: { easing: \"linear\" } } } },",
    "};",
    "",
  ].join("\n");
}

async function writePresetFixture(context, name, presetConfig) {
  const fixture = path.join(context.rootDir, ".tmp", "verify-frontend", name);
  const preset = path.join(fixture, "node_modules", "@fixture", "preset");
  const presetConfigDir = path.join(preset, context.configDirName, "frontend");
  const appConfigDir = path.join(fixture, context.configDirName, "frontend");
  await fs.rm(fixture, { force: true, recursive: true });
  await fs.mkdir(presetConfigDir, { recursive: true });
  await fs.mkdir(appConfigDir, { recursive: true });
  await fs.writeFile(path.join(fixture, "package.json"), JSON.stringify({ name: `fixture-${name}`, private: true }));
  await fs.writeFile(path.join(preset, "package.json"), JSON.stringify({ name: "@fixture/preset", version: "1.0.0" }));
  await fs.writeFile(path.join(presetConfigDir, "config.ts"), presetConfig);
  await fs.writeFile(path.join(presetConfigDir, "motion.ts"), "export const duration = \"500ms\";\n");
  await fs.writeFile(path.join(appConfigDir, "config.ts"), appSource(context.packageVersion, "@fixture/preset"));
  return { fixture, presetConfigDir };
}

async function verifyPresetMerge(context, config) {
  const { fixture, presetConfigDir } = await writePresetFixture(context, "presets", presetSource(context.packageVersion));
  const loaded = await config.loadConfig(fixture);
  assert.equal(loaded.config.components.primitives.tabs.motion.duration, "500ms");
  assert.equal(loaded.config.components.primitives.tabs.motion.easing, "linear");
  assert.equal(loaded.config.systems.tooltip, false);
  assert.ok(loaded.dependencies.includes(path.join(presetConfigDir, "motion.ts")));
  assert.ok(loaded.generatedScss.includes("--tbf-ui-tabs-motion-duration: 500ms;"));

  await fs.writeFile(path.join(presetConfigDir, "motion.ts"), "export const duration = \"700ms\";\n");
  const reloaded = await config.loadConfig(fixture);
  assert.equal(reloaded.config.components.primitives.tabs.motion.duration, "700ms");
}

async function verifyPresetRefusals(context, config) {
  const nested = await writePresetFixture(
    context,
    "presets-nested",
    presetSource(context.packageVersion, "  presets: { use: [\"other\"] },"),
  );
  await assert.rejects(() => config.loadConfig(nested.fixture), /cannot declare presets/u);

  const stale = await writePresetFixture(context, "presets-stale", presetSource("1.0.0"));
  await assert.rejects(() => config.loadConfig(stale.fixture), /preset @fixture\/preset config targets 1\.0\.0/u);

  const missing = await writePresetFixture(context, "presets-missing", presetSource(context.packageVersion));
  await fs.rm(path.join(missing.fixture, "node_modules"), { force: true, recursive: true });
  await assert.rejects(() => config.loadConfig(missing.fixture), /is not installed/u);
}

async function verifyFrontendPresets(context) {
  const config = await context.importDist("config");
  await verifyPresetMerge(context, config);
  await verifyPresetRefusals(context, config);
}

export { verifyFrontendPresets };
