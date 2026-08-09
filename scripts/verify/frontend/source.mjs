import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const configDirName = `.${"tre"}bired`;
const configRelPath = `${configDirName}/frontend/config.ts`;

async function verifyFrontendSource(context) {
  await verifyNoStandaloneWrapUtility(context.sourceDir);
  await verifyStylePackaging(context.rootDir);
  await verifyNoCustomElements(context.sourceDir, context.distDir);
  await verifyNoProductNames(context.rootDir, context.sourceDir);
  await verifyRadiusFallbacks(context.sourceDir);
}

async function verifyNoStandaloneWrapUtility(sourceDir) {
  const files = await sourceFiles(sourceDir);
  for (const file of files) {
    const source = await fs.readFile(file, "utf8");
    assert.equal(/(^|[^\w&-])\.wrap\b/u.test(source), false, `${file} defines a standalone wrap utility.`);
    assert.equal(
      /\bclass(Name)?\s*=\s*["'`][^"'`]*\bwrap\b/u.test(source),
      false,
      `${file} references a wrap utility.`,
    );
  }
}

async function verifyStylePackaging(rootDir) {
  assert.equal(await pathExists(path.join(rootDir, "src", "styles.css")), false);
  const packageJson = JSON.parse(await fs.readFile(path.join(rootDir, "package.json"), "utf8"));
  assertStructuredExports(packageJson);
  await verifyBundlerConfigStyles(rootDir, packageJson);
}

function assertStructuredExports(packageJson) {
  const exportKeys = Object.keys(packageJson.exports || {}).sort();
  assert.deepEqual(exportKeys, [".", "./config", "./react", "./server"]);
  for (const key of exportKeys) {
    assert.equal(key.includes("*"), false, `${key} is a wildcard export.`);
    assert.equal(key.includes("/styles"), false, `${key} exposes Sass internals.`);
    assert.equal(key.includes("/components"), false, `${key} exposes component internals.`);
  }
  assert.equal(packageJson.exports["./styles.css"], undefined);
}

async function verifyBundlerConfigStyles(rootDir, packageJson) {
  const fixture = path.join(rootDir, ".tmp", "verify-frontend", "config-styles");
  const packageName = `@${organizationName()}/frontend`;
  const packageRoot = path.join(fixture, "node_modules", ...packageName.split("/"));
  await fs.rm(fixture, { force: true, recursive: true });
  await fs.mkdir(packageRoot, { recursive: true });
  await fs.cp(path.join(rootDir, "dist"), path.join(packageRoot, "dist"), { recursive: true });
  await writeFontsourceFixture(fixture, "inter", ["latin", "latin-ext"], [400, 700], ["normal", "italic"]);
  await fs.writeFile(path.join(packageRoot, "package.json"), JSON.stringify(packageJson, null, 2));
  await writeFile(fixture, configRelPath, [
    `import { defineFrontendConfig } from "${packageName}/config";`,
    "",
    "export default defineFrontendConfig({",
    "  prefix: \"verify\",",
    "  fonts: {",
    "    families: {",
    "      sans: {",
    "        package: \"inter\",",
    "        family: \"Inter\",",
    "        subsets: [\"latin\", \"latin-ext\"],",
    "        weights: [400, 700],",
    "        styles: [\"normal\", \"italic\"],",
    "      },",
    "    },",
    "    sans: \"\\\"Inter\\\", system-ui, sans-serif\",",
    "  },",
    "  scales: { spacing: { xs2: 4, xs: 8, sm: 12, md: 24, lg: 40 } },",
    "  systems: { flash: true, inputs: true, modal: false },",
    "  theme: { cssVariables: true, tokens: { color: { brand: \"#123456\" } } },",
    "});",
    "",
  ].join("\n"));
  await writeFile(fixture, "src/screen.client.ts", [
    "document.documentElement.dataset.verify = \"ready\";",
    "",
  ].join("\n"));
  const { bundle } = await import(`@${organizationName()}/bundler`);
  const result = await bundle({
    discover: {
      dir: "src",
      rules: [{ key: "client", include: ["**/*.client.ts"], strategy: "entry" }],
    },
    outDir: "dist",
    rootDir: fixture,
  });
  const cssOutput = result.outputs.find((item) => item.endsWith(".css"));
  assert.ok(cssOutput, "expected bundled frontend SCSS output");
  const css = await fs.readFile(cssOutput, "utf8");
  assert.equal(css.includes("--tbf-radius"), true);
  assert.equal(css.includes("--verify-color-brand: #123456;"), true);
  assert.equal(css.includes("@font-face"), true);
  assert.equal(css.includes('font-family: "Inter"'), true);
  assert.equal(css.includes("--tbf-font-family-sans"), true);
  assert.equal(css.includes(".inline-row"), true);
  assert.equal(css.includes(".inline-row.wrap"), true);
  assert.equal(css.includes(".gap-xs2"), true);
  assert.equal(css.includes(".bg-canvas"), true);
  assert.equal(css.includes(".tbf-layout"), true);
  assert.match(css, /\.tbf-layout,\s*\[data-tbf-layout-root\]\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*100%;/su);
  assert.match(css, /\[data-tbf-layout-root\]\s*>\s*\[data-tbf-layout-main\]\s*\{[^}]*grid-column:\s*2;/su);
  assert.equal(css.includes(".tbf-flash"), true);
  assert.equal(css.includes(".tbf-upload"), true);
  assert.equal(css.includes(".tbf-sidebar-shell"), true);
  assert.equal(css.includes(".tbf-fullscreen-overlay"), true);
  assert.equal(css.includes(".tbf-graph"), true);
  assert.equal(css.includes(".tbf-card"), true);
  assert.equal(css.includes(".card-row"), true);
  assert.equal(css.includes(".pill"), true);
  assert.equal(css.includes(".tbf-disclosure"), true);
  assert.equal(css.includes(".tbf-modal,\n[data-tbf-modal]"), false);
  assert.equal(css.includes("assets/assets/"), false);
  assert.equal(css.includes("/../assets/"), false);
}

async function verifyNoCustomElements(sourceDir, distDir) {
  const files = [
    ...await sourceFiles(sourceDir),
    ...await sourceFiles(distDir),
  ];
  const banned = [
    /customElements/u,
    /extends\s+HTMLElement/u,
    /document\.createElement\(["'`][a-z]+-[a-z0-9-]+["'`]\)/u,
    /<\s*[a-z]+-[a-z0-9-]+/u,
    /\b(action-form|action-button|tooltip-trigger|modal-trigger|theme-toggle)\b/u,
  ];
  for (const file of files) {
    const source = await fs.readFile(file, "utf8");
    for (const pattern of banned) {
      assert.equal(pattern.test(source), false, `${file} references custom element behavior.`);
    }
  }
}

async function verifyNoProductNames(rootDir, sourceDir) {
  const files = [
    ...await sourceFiles(sourceDir),
    path.join(rootDir, "README.md"),
  ];
  const banned = [
    String.fromCharCode(111, 112, 101, 114, 108, 111, 114, 110),
    "project_05",
  ];
  for (const file of files) {
    const source = await fs.readFile(file, "utf8");
    banned.forEach((name) => {
      assert.equal(source.toLowerCase().includes(name), false, `${file} contains product-owned name.`);
    });
  }
}

async function verifyRadiusFallbacks(sourceDir) {
  const tokens = await fs.readFile(path.join(sourceDir, "styles", "tokens.scss"), "utf8");
  assert.ok(tokens.includes("--tbf-radius: var(--radius-md, 0);"));
  assert.ok(tokens.includes("--tbf-radius-sm: var(--radius-sm, 0);"));
  const files = await sourceFiles(sourceDir);
  for (const file of files.filter((item) => item.endsWith(".scss"))) {
    const source = await fs.readFile(file, "utf8");
    assert.equal(/border-radius:\s*var\(--tbf-radius(?:-sm)?\);/u.test(source), false, `${file} lacks radius fallback.`);
  }
}

async function sourceFiles(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await sourceFiles(full));
    else if (/\.(ts|tsx|scss|js|d\.ts)$/u.test(entry.name)) out.push(full);
  }
  return out;
}

function organizationName() {
  return String.fromCharCode(116, 114, 101, 98, 105, 114, 101, 100);
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function writeFontsourceFixture(fixture, packageName, subsets, weights, styles) {
  const packageRoot = path.join(fixture, "node_modules", "@fontsource", packageName);
  await fs.mkdir(path.join(packageRoot, "files"), { recursive: true });
  await fs.writeFile(path.join(packageRoot, "package.json"), JSON.stringify({
    name: `@fontsource/${packageName}`,
    version: "0.0.0",
  }, null, 2));
  for (const subset of subsets) {
    for (const weight of weights) {
      for (const style of styles) {
        await fs.writeFile(
          path.join(packageRoot, "files", `${packageName}-${subset}-${weight}-${style}.woff2`),
          "",
        );
      }
    }
  }
}

async function writeFile(root, rel, contents) {
  const filePath = path.join(root, rel);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, contents);
}

export { verifyFrontendSource };
