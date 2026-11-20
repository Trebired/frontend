import assert from "node:assert/strict";

const TREE = [
  { children: [
      { kind: "dir", name: "Inner", rel_path: "a/b", children: [] },
      { kind: "file", name: "Item", rel_path: "a/item" }
    ], kind: "dir", name: "Outer", rel_path: "a" },
  { kind: "dir", name: "Other", rel_path: "c", children: [] },
  { kind: "file", name: "Loose", rel_path: "loose" },
];

async function settle() {
  for (let index = 0; index < 4; index += 1) await new Promise((resolve) => setTimeout(resolve, 0));
}

function pointer(type, target, x, y, extra = {}) {
  const Pointer = window.PointerEvent || window.MouseEvent;
  const event = new Pointer(type, { bubbles: true, button: 0, cancelable: true, clientX: x, clientY: y, ...extra });
  for (const [key, value] of Object.entries({ pointerId: 1, pointerType: "mouse" })) {
    if (event[key] === undefined) Object.defineProperty(event, key, { value });
  }
  target.dispatchEvent(event);
}

function verifyMarkup(React, renderToStaticMarkup, FileTreeView) {
  const plain = renderToStaticMarkup(React.createElement(FileTreeView, { tree: TREE }));
  assert.doesNotMatch(plain, /data-tbf-file-tree-drop/u, "a tree without onMove has no drop targets");
  assert.doesNotMatch(plain, /remixicon:draggable/u, "a tree without onMove has no drag handles");
  const html = renderToStaticMarkup(React.createElement(FileTreeView, { onMove: () => {}, rootLabel: "Top level", tree: TREE }));
  assert.match(html, /data-tbf-file-tree-drop="\."/u, "the root row is a drop target");
  assert.match(html, /Top level/u, "the root row shows its label");
  assert.match(html, /data-tbf-file-tree-drop="a"/u, "folders are drop targets");
  assert.match(html, /data-tbf-file-tree-path="loose" data-tbf-file-tree-drop="\."/u, "a file row drops into its own folder, here the root");
  assert.equal((html.match(/remixicon:draggable/gu) || []).length, 3, "every visible row gets a drag handle");
}

async function mountTree(context, extra = {}) {
  const React = await import("react");
  const { createRoot } = await import("react-dom/client");
  const { FileTreeView } = await context.importDist("explorer");
  document.body.innerHTML = '<div id="tree"></div>';
  const root = createRoot(document.getElementById("tree"));
  root.render(React.createElement(FileTreeView, { autoExpandPaths: ["a"], tree: TREE, ...extra }));
  await settle();
  return root;
}

async function dragOnto(context, from, hostSelector) {
  const moves = [];
  const root = await mountTree(context, { onMove: (source, target) => moves.push([source, target]) });
  const originalHit = document.elementFromPoint;
  const host = document.querySelector(hostSelector);
  document.elementFromPoint = () => host;
  pointer("pointerdown", document.querySelector(`[data-tbf-file-tree-path="${from}"] [role="treeitem"]`), 10, 10);
  pointer("pointermove", window, 40, 40);
  await settle();
  pointer("pointerup", window, 40, 40);
  await settle();
  document.elementFromPoint = originalHit;
  root.unmount();
  return moves;
}

async function verifySelectionFollowsClicks(context) {
  const root = await mountTree(context, { onMove: () => {} });
  const button = (path) => document.querySelector(`[data-tbf-file-tree-path="${path}"] [role="treeitem"]`);
  button("loose").click();
  await settle();
  button("c").click();
  await settle();
  assert.equal(button("c").getAttribute("aria-selected"), "true", "the clicked folder is selected");
  assert.equal(button("loose").getAttribute("aria-selected"), "false", "the file clicked before is no longer selected");
  root.unmount();
}

async function drag(context, from, to) {
  const React = await import("react");
  const { createRoot } = await import("react-dom/client");
  const { FileTreeView } = await context.importDist("explorer");
  document.body.innerHTML = '<div id="tree"></div>';
  const moves = [];
  const root = createRoot(document.getElementById("tree"));
  const onMove = (source, target) => moves.push([source, target]);
  root.render(React.createElement(FileTreeView, { autoExpandPaths: ["a"], onMove, rootLabel: "Top level", tree: TREE }));
  await settle();
  const row = (path) => document.querySelector(`[data-tbf-file-tree-path="${path}"] [role="treeitem"]`);
  const dropHost = to === "" ? document.querySelector('[data-tbf-file-tree-drop="."]') : document.querySelector(`[data-tbf-file-tree-drop="${to}"]`);
  const originalHit = document.elementFromPoint;
  document.elementFromPoint = () => dropHost;
  pointer("pointerdown", row(from), 10, 10);
  pointer("pointermove", window, 40, 40);
  await settle();
  pointer("pointerup", window, 40, 40);
  await settle();
  document.elementFromPoint = originalHit;
  root.unmount();
  return moves;
}

async function verifyTreeDrag(context) {
  const React = (await import("react")).default;
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { FileTreeView } = await context.importDist("explorer");
  verifyMarkup(React, renderToStaticMarkup, FileTreeView);
  assert.deepEqual(await drag(context, "loose", "c"), [["loose", "c"]], "a file drops into a folder");
  assert.deepEqual(await drag(context, "c", "a"), [["c", "a"]], "a folder drops into another folder");
  assert.deepEqual(await drag(context, "a/b", ""), [["a/b", ""]], "a nested folder drops onto the root row");
  assert.deepEqual(await drag(context, "a", "a/b"), [], "a folder cannot drop into its own child");
  assert.deepEqual(await drag(context, "c", ""), [], "dropping a root folder on the root is not a move");
  assert.deepEqual(await drag(context, "a", "a"), [], "a folder cannot drop onto itself");
  assert.deepEqual(await dragOnto(context, "a/b", '[data-tbf-file-tree-path="loose"]'), [["a/b", ""]], "dropping on a root file moves to the root");
  assert.deepEqual(
    await dragOnto(context, "loose", '[data-tbf-file-tree-path="a/item"]'),
    [["loose", "a"]],
    "dropping on a file moves into its folder"
  );
  assert.deepEqual(await dragOnto(context, "a/b", ".tbf-file-tree-shell"), [["a/b", ""]], "the tree card itself stands for the root");
  await verifySelectionFollowsClicks(context);
}

export { verifyTreeDrag };
