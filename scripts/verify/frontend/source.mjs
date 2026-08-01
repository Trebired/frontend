import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

async function verifyFrontendSource(context) {
  await verifyNoWrapUtility(context.sourceDir);
  await verifyStylePackaging(context.rootDir);
  await verifyNoCustomElements(context.sourceDir, context.distDir);
  await verifyNoProductNames(context.rootDir, context.sourceDir);
  await verifyRadiusFallbacks(context.sourceDir);
}

async function verifyNoWrapUtility(sourceDir) {
  const files = await sourceFiles(sourceDir);
  for (const file of files) {
    const source = await fs.readFile(file, "utf8");
    assert.equal(/(^|[^\w-])\.wrap\b/u.test(source), false, `${file} defines a wrap utility.`);
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
  assert.equal(packageJson.exports["./styles.css"], undefined);
  for (const target of styleExportTargets(packageJson)) {
    await fs.access(path.join(rootDir, target));
  }
  await verifyBundlerScssPackageImports(rootDir, packageJson);
}

async function verifyBundlerScssPackageImports(rootDir, packageJson) {
  const fixture = path.join(rootDir, ".tmp", "verify-frontend", "scss-package");
  const packageName = `@${organizationName()}/frontend`;
  const packageRoot = path.join(fixture, "node_modules", ...packageName.split("/"));
  await fs.rm(fixture, { force: true, recursive: true });
  await fs.mkdir(packageRoot, { recursive: true });
  await fs.cp(path.join(rootDir, "dist"), path.join(packageRoot, "dist"), { recursive: true });
  await fs.writeFile(path.join(packageRoot, "package.json"), JSON.stringify(packageJson, null, 2));
  await writeFile(fixture, "src/screen.client.scss", [
    `@use "${packageName}/styles/tokens" as *;`,
    `@use "${packageName}/styles/utils" as *;`,
    `@use "${packageName}/flash/styles" as *;`,
    `@use "${packageName}/inputs/styles" as *;`,
    "",
    ".screen {",
    "  color: var(--tbf-text);",
    "}",
    "",
  ].join("\n"));
  const { bundle } = await import(`@${organizationName()}/bundler`);
  const result = await bundle({
    discover: {
      dir: "src",
      rules: [{ key: "style", include: ["**/*.client.scss"], strategy: "entry" }],
    },
    outDir: "dist",
    rootDir: fixture,
  });
  const cssOutput = result.outputs.find((item) => item.endsWith(".css"));
  assert.ok(cssOutput, "expected bundled frontend SCSS output");
  const css = await fs.readFile(cssOutput, "utf8");
  assert.equal(css.includes("--tbf-radius"), true);
  assert.equal(css.includes(".inline-row"), true);
  assert.equal(css.includes(".tbf-flash"), true);
  assert.equal(css.includes(".tbf-upload"), true);
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

function styleExportTargets(packageJson) {
  return Object.values(packageJson.exports || {})
    .flatMap((value) => [value?.sass, value?.style, value?.default])
    .filter((value, index, list) => typeof value === "string" && value.endsWith(".scss") && list.indexOf(value) === index)
    .map((value) => String(value).replace(/^\.\//u, ""));
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

async function writeFile(root, rel, contents) {
  const filePath = path.join(root, rel);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, contents);
}

export { verifyFrontendSource };
