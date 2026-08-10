import { createElement } from "react";
import { createRoot } from "react-dom/client";

import { FileTreeView } from "./components/index.js";
import { text } from "./tree.js";
import { primitiveTextClassName } from "#hzrmwbvgt2ax";

const fileTreeRoots = new WeakMap<HTMLElement, ReturnType<typeof createRoot>>();

function getFileTreeRoot(container: HTMLElement | null) {
  if (!(container instanceof HTMLElement)) return null;
  let root = fileTreeRoots.get(container);
  if (!root) {
    root = createRoot(container);
    fileTreeRoots.set(container, root);
  }
  return root;
}

function renderFileTreeExplorer(container: HTMLElement | null, input: any) {
  const root = getFileTreeRoot(container);
  if (!root) return;
  const source = input && typeof input === "object" ? input : {};
  if (text(source.message)) {
    root.render(createElement("div", { className: primitiveTextClassName({ muted: true }) }, text(source.message)));
    return;
  }
  root.render(createElement(FileTreeView, {
        autoExpandPaths: Array.isArray(source.autoExpandPaths) ? source.autoExpandPaths : [],
        emptyMessage: text(source.emptyMessage),
        highlightedPaths: Array.isArray(source.highlightedPaths) ? source.highlightedPaths : [],
        interactive: source.interactive !== false,
        mode: text(source.mode) || "browse",
        onFileOpen: typeof source.onFileOpen === "function" ? source.onFileOpen : () => {},
        onFileSelect: typeof source.onFileSelect === "function" ? source.onFileSelect : () => {},
        onPathOpen: typeof source.onPathOpen === "function" ? source.onPathOpen : () => {},
        tree: Array.isArray(source.tree) ? source.tree : [],
  }));
}

function clearFileTreeExplorer(container: HTMLElement | null, message = "") {
  const root = getFileTreeRoot(container);
  if (!root) return;
  root.render(createElement("div", { className: primitiveTextClassName({ muted: true }) }, text(message, "No file tree selected.")));
}

export * from "./components/index.js";
export * from "./tree.js";
export { clearFileTreeExplorer, getFileTreeRoot, renderFileTreeExplorer };
