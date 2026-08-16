import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const outputPath = path.join(repoRoot, "src", "namespace", "generated.ts");

const { writeNamespaceModule } = await import("@trebired/bundler/config");

await writeNamespaceModule({ outFile: path.relative(repoRoot, outputPath), rootDir: repoRoot });
