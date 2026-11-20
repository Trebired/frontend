import assert from "node:assert/strict";

const tick = () => new Promise((resolve) => setTimeout(resolve, 20));

function documentTree() {
  return [
    { href: "/repo/documents/readme", icon: "remixicon book-open-line", kind: "file", name: "README.md", rel_path: "README.md" },
    { href: "/repo/documents/license", kind: "file", name: "LICENSE", rel_path: "LICENSE" },
  ];
}

async function verifyStaticLinkTree(explorer) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  const html = renderToStaticMarkup(createElement(explorer.FileTreeView, {
        highlightedPaths: ["LICENSE"],
        interactive: false,
        tree: documentTree(),
  }));
  assert.ok(html.includes('href="/repo/documents/readme"') && html.includes("data-tbf-soft-redirect"),
  "a file with an href is a link, so the tree navigates without browser code");
  assert.match(html, /<a[^>]*aria-current="page"[^>]*href="\/repo\/documents\/license"/u, "the highlighted link is marked as the current page");
}

async function verifyInteractiveLinkRow(explorer) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  explorer.renderFileTreeExplorer(host, { tree: documentTree() });
  await tick();
  const link = host.querySelector("[data-tbf-file-tree-path='LICENSE'] a[role='treeitem']");
  assert.equal(link && link.getAttribute("href"), "/repo/documents/license", "an interactive tree renders the same link rows");
  host.remove();
}

async function verifyFileTreeLinks(importDist) {
  const explorer = await importDist("explorer");
  await verifyStaticLinkTree(explorer);
  await verifyInteractiveLinkRow(explorer);
}

export { verifyFileTreeLinks };
