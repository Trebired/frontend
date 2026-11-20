import assert from "node:assert/strict";

const tick = () => new Promise((resolve) => setTimeout(resolve, 20));

function click(target) {
  target.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
}

function viewerInput() {
  return {
    fileBlobApiUrl: "/blob",
    initialFile: { content: "", path: "src/logo.png" },
    requestedPath: "src/logo.png",
    tree: [
      {
        children: [{ kind: "file", name: "logo.png", path: "src/logo.png" }],
        kind: "dir",
        name: "src",
        path: "src",
      },
      { children: [{ kind: "file", name: "a.ts", path: "lib/a.ts" }], kind: "dir", name: "lib", path: "lib" },
    ],
    treeLoaded: true,
  };
}

async function verifyTreeFolderToggleKeepsFile(importDist) {
  const { mountEditorViewer } = await importDist("editor");
  const host = document.createElement("div");
  document.body.appendChild(host);
  mountEditorViewer(host, viewerInput());
  await tick();
  const row = (path) => host.querySelector(`[data-tbf-file-tree-path='${path}'] [role='treeitem']`);
  const image = () => host.querySelector("img");
  assert.ok(image(), "the requested image file is open");
  const urlBefore = window.location.href;
  click(row("lib"));
  await tick();
  assert.equal(row("lib").getAttribute("aria-expanded"), "true", "a folder click expands the folder");
  assert.ok(row("lib/a.ts"), "the expanded folder shows its files");
  assert.ok(image(), "a folder click keeps the open file open");
  assert.equal(window.location.href, urlBefore, "a folder click leaves the URL on the open file");
  click(row("src"));
  await tick();
  assert.equal(row("src").getAttribute("aria-expanded"), "false", "a folder click collapses an open folder");
  assert.ok(image(), "collapsing the open file's folder keeps it open");
  host.remove();
}

export { verifyTreeFolderToggleKeepsFile };
