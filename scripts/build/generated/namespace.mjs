import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const outputPath = path.join(repoRoot, "src", "namespace", "generated.ts");
const bundlerPackage = `@${String.fromCharCode(116, 114, 101, 98, 105, 114, 101, 100)}/bundler`;

const { loadConfig } = await import(`${bundlerPackage}/config`);
const loaded = await loadConfig(repoRoot, { defaultIfMissing: false });
const prefix = loaded.config.prefix;

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(
  outputPath,
  [
    `const FRONTEND_PREFIX = ${JSON.stringify(prefix)};`,
    "",
    "export { FRONTEND_PREFIX };",
    "",
  ].join("\n"),
  "utf8",
);
