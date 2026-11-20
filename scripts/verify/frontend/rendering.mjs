import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const REMOVED_EXPORTS = [
  "LiveIslandMount",
  "LiveIslandState",
  "createSitePages",
  "harvestInlineIcons",
  "live_island_mount",
  "mountLiveIsland",
  "mountReactRoot",
  "rehydrate",
  "renderReactRoot",
  "usePageRoute",
];

async function distFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async(entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return await distFiles(full);
        return entry.name.endsWith(".js") ? [full] : [];
  }));
  return nested.flat();
}

async function verifyNoHydration({ importDist, importDistRoot, rootDir }) {
  const entrypoints = [await importDistRoot(), await importDist("react")];
  for (const entry of entrypoints) {
    for (const name of REMOVED_EXPORTS) assert.equal(name in entry, false, `the package must not export ${name}: it renders on the server only`);
  }
  const files = await distFiles(path.join(rootDir, "dist"));
  for (const file of files) {
    const source = await fs.readFile(file, "utf8");
    assert.equal(source.includes("hydrateRoot"), false, `${path.relative(rootDir, file)} must not hydrate: pages render on the server only`);
  }
}

export { verifyNoHydration };
