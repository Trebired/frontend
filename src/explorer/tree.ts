import { objectRecord, toText as text } from "#ndsvdqv80epr";

type FileTreeNodeInput = Record<string, unknown>;

type FileTreeNode = FileTreeNodeInput& {
  children: FileTreeNode[];
  file_count: number;
  icon: string;
  id: string;
  kind: string;
  name: string;
  rel_path: string;
};

function normalizeFileTreePath(value: unknown) {
  return text(value)
  .replace(/\\/gu, "/")
  .replace(/^\/+/u, "")
  .replace(/\/+/gu, "/")
  .replace(/\/$/u, "");
}

function normalizeScrollbarSize(value: unknown) {
  const size = text(value).toLowerCase();
  return size === "xs" || size === "sm" || size === "md" || size === "lg"
  ? size
  : "sm";
}

function scrollbarWidthBySize(sizeInput: unknown) {
  const size = normalizeScrollbarSize(sizeInput);
  if (size === "xs") return 4;
  if (size === "md") return 8;
  if (size === "lg") return 10;
  return 6;
}

function readFileTreeIconSpec(nodeInput: unknown) {
  const node = objectNode(nodeInput);
  return text(node.icon);
}

function selectableEntryPath(relPath: unknown) {
  return /\.[a-z0-9]+$/iu.test(normalizeFileTreePath(relPath));
}

function objectNode(value: unknown): FileTreeNodeInput {
  return objectRecord<FileTreeNodeInput>(value);
}

function countTreeFiles(nodesInput: unknown): number {
  const nodes = Array.isArray(nodesInput) ? nodesInput : [];
  let total = 0;
  for (const nodeInput of nodes) {
    const node = objectNode(nodeInput);
    const kind = text(node.kind).toLowerCase();
    total += kind === "dir" ? countTreeFiles(node.children) : 1;
  }
  return total;
}

function normalizeTreeNodes(nodesInput: unknown, parentId = "root"): FileTreeNode[] {
  const nodes = Array.isArray(nodesInput) ? nodesInput : [];
  return nodes.map((nodeInput, index) => {
      const node = objectNode(nodeInput);
      const relPath = normalizeFileTreePath(node.rel_path || node.path);
      const kind = text(node.kind, "file");
      const name = text(node.name) || (relPath ? relPath.split("/").pop() || relPath : "");
      const fallbackId = `${parentId}/${name || kind || "node"}:${String(index)}`;
      const id = relPath || fallbackId;
      const children = kind === "dir" ? normalizeTreeNodes(node.children, id) : [];
      return {
        ...node,
        children,
        file_count: kind === "dir" ? countTreeFiles(children) : 0,
        icon: readFileTreeIconSpec(node),
        id,
        kind,
        name,
        rel_path: relPath,
      };
  });
}

function normalizePathList(values: unknown) {
  return Array.from(
    new Set((Array.isArray(values) ? values : []).map(normalizeFileTreePath).filter(Boolean)),
  );
}

function findTreeNodeByPath(nodesInput: unknown, pathInput: unknown): FileTreeNode | null {
  const wanted = normalizeFileTreePath(pathInput);
  if (!wanted) return null;
  const nodes = Array.isArray(nodesInput) ? nodesInput : [];
  for (const nodeInput of nodes) {
    const node = objectNode(nodeInput) as FileTreeNode;
    const relPath = normalizeFileTreePath(node.rel_path || node.path || node.id);
    if (relPath === wanted) return node;
    const nested = findTreeNodeByPath(node.children, wanted);
    if (nested) return nested;
  }
  return null;
}

function buildInitialOpenState(treeInput: unknown, pathsInput: unknown) {
  const out: Record<string, boolean> = {};
  const tree = Array.isArray(treeInput) ? treeInput : [];
  normalizePathList(pathsInput).forEach((relPath) => {
      const parts = relPath.split("/").filter(Boolean);
      for (let index = 0; index < parts.length - 1; index += 1) {
        const dirPath = parts.slice(0, index + 1).join("/");
        if (dirPath) out[dirPath] = true;
      }
      const targetNode = findTreeNodeByPath(tree, relPath);
      if (text(targetNode?.kind).toLowerCase() === "dir") out[relPath] = true;
  });
  return out;
}

function extensionFromName(pathInput: unknown) {
  const path = normalizeFileTreePath(pathInput);
  const name = path.split("/").pop() || path;
  const match = /\.([a-z0-9]+)$/iu.exec(name);
  return match ? match[1].toLowerCase() : "";
}

function isImagePath(pathInput: unknown) {
  return ["avif", "gif", "jpeg", "jpg", "png", "svg", "webp"].includes(
    extensionFromName(pathInput),
  );
}

function findFirstFilePath(nodesInput: unknown): string {
  const nodes = Array.isArray(nodesInput) ? nodesInput : [];
  for (const nodeInput of nodes) {
    const node = objectNode(nodeInput);
    const relPath = normalizeFileTreePath(node.rel_path || node.path);
    if (text(node.kind).toLowerCase() !== "dir" && relPath) return relPath;
    const nested = findFirstFilePath(node.children);
    if (nested) return nested;
  }
  return "";
}

export {
  buildInitialOpenState,
  extensionFromName,
  findFirstFilePath,
  findTreeNodeByPath,
  isImagePath,
  normalizeFileTreePath as normalizePath,
  normalizePathList,
  normalizeScrollbarSize,
  normalizeTreeNodes,
  readFileTreeIconSpec,
  scrollbarWidthBySize,
  selectableEntryPath,
  text,
};
export type { FileTreeNode, FileTreeNodeInput };
