import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const outputPath = path.join(repoRoot, "src", "namespace", "identity.ts");

const packageJson = JSON.parse(await fs.readFile(path.join(repoRoot, "package.json"), "utf8"));
const name = String(packageJson.name || "").trim();
const version = String(packageJson.version || "").trim();

if (!name) throw new Error("missing-package-name");
if (!version) throw new Error("missing-package-version");

const source = [
  `const FRONTEND_PACKAGE_NAME = ${JSON.stringify(name)};`,
  `const FRONTEND_PACKAGE_VERSION = ${JSON.stringify(version)};`,
  "",
  "export { FRONTEND_PACKAGE_NAME, FRONTEND_PACKAGE_VERSION };",
  "",
].join("\n");

await fs.writeFile(outputPath, source, "utf8");
