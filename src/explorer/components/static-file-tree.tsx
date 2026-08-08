import type { CSSProperties } from "react";
import { createElement } from "react";

import {
  normalizePath,
  readFileTreeIconSpec,
  text,
} from "#m6ckog6p21a3";
import {
  FileTreeCount,
  FileTreeIcon,
  FileTreeName,
  FileTreeToggle,
  fileTreeLeftBorderColor,
} from "./file/tree/parts.js";
import { FileTreeShell } from "./file/tree/shell.js";

const FILE_TREE_INDENT = 18;
const FILE_TREE_ROW_HEIGHT = 34;

type StaticFileTreeViewProps = {
  emptyMessage?: string;
  highlightedPaths?: Set<string>;
  hostRef?: any;
  initialOpenState?: Record<string, boolean>;
  lang?: string;
  scrollbarSize?: string;
  scrollbarWidth?: number;
  tree?: any[];
  treeHeight?: number;
};

function isDirNode(node: any) {
  return text(node?.kind).toLowerCase() === "dir";
}

function nodePath(node: any) {
  return normalizePath(node?.rel_path || node?.path || node?.id);
}

function isStaticNodeOpen(node: any, initialOpenState: any) {
  if (!isDirNode(node)) return false;
  const state = initialOpenState && typeof initialOpenState === "object" ? initialOpenState : {};
  const relPath = nodePath(node);
  const id = text(node?.id);
  return Boolean((relPath && state[relPath]) || (id && state[id]));
}

function flattenStaticRows(nodesInput: any, initialOpenState: any, level = 1): any[] {
  const rows: any[] = [];
  const nodes = Array.isArray(nodesInput) ? nodesInput : [];
  nodes.forEach((node) => {
    const isOpen = isStaticNodeOpen(node, initialOpenState);
    rows.push({ isOpen, level, node });
    if (isOpen) rows.push(...flattenStaticRows(node?.children, initialOpenState, level + 1));
  });
  return rows;
}

function staticRowModel(row: any, highlightedPaths: Set<string>) {
  const node = row?.node && typeof row.node === "object" ? row.node : {};
  const kind = text(node.kind);
  const relPath = nodePath(node);
  return {
    fileCount: Math.max(0, Number(node.file_count) || 0),
    highlighted: highlightedPaths instanceof Set && highlightedPaths.has(relPath),
    iconSpec: readFileTreeIconSpec(node),
    isOpen: Boolean(row?.isOpen),
    kind,
    name: text(node.name) || relPath || "Entry",
  };
}

function staticRowBackground(model: ReturnType<typeof staticRowModel>) {
  return model.highlighted
    ? "color-mix(in srgb, var(--gray-800) 60%, transparent)"
    : "transparent";
}

function StaticFileTreeRow(props: { highlightedPaths: Set<string>; row: any }) {
  const model = staticRowModel(props.row, props.highlightedPaths);
  const rowLevel = Math.max(1, Number(props.row?.level) || 1);
  return (
    <div
      role="treeitem"
      aria-level={rowLevel}
      aria-expanded={model.kind === "dir" ? model.isOpen : undefined}
      className="inline-row ver-center"
      style={{
        borderBottom: "var(--border-width) solid var(--border-surface-1)",
        height: FILE_TREE_ROW_HEIGHT,
        minHeight: FILE_TREE_ROW_HEIGHT,
      }}
    >
      <button
        type="button"
        className={`width-max inline-row gap-xs ver-center text-left${model.kind === "dir" ? "" : " text-muted"}`}
        style={{
          background: staticRowBackground(model),
          border: "var(--border-width) solid transparent",
          borderLeft: `calc(var(--border-width) * 2) solid ${fileTreeLeftBorderColor(model)}`,
          borderRadius: 0,
          cursor: "default",
          minHeight: 0,
          padding: "5px 10px",
          paddingLeft: 10 + (rowLevel - 1) * FILE_TREE_INDENT,
          width: "100%",
        }}
        aria-disabled="true"
        tabIndex={-1}
      >
        <FileTreeToggle isDir={model.kind === "dir"} isOpen={model.isOpen} />
        <FileTreeIcon highlighted={model.highlighted} iconSpec={model.iconSpec} />
        <FileTreeName name={model.name} />
        <FileTreeCount fileCount={model.fileCount} kind={model.kind} />
      </button>
    </div>
  );
}

function scrollStyleFor(options: StaticFileTreeViewProps, rows: any[]) {
  const treeHeight = Number(options.treeHeight) > 0 ? Number(options.treeHeight) : 360;
  const contentHeight = rows.length * FILE_TREE_ROW_HEIGHT;
  const constrainedHeight = Math.min(contentHeight, treeHeight);
  const needsScroll = contentHeight > treeHeight;
  return {
    maxHeight: treeHeight,
    minHeight: constrainedHeight || undefined,
    overflowX: "hidden",
    overflowY: needsScroll ? "auto" : "visible",
    scrollbarColor: "var(--scroll-thumb) var(--gray-800)",
    scrollbarGutter: needsScroll ? "stable" : "auto",
    scrollbarWidth: "thin",
    width: "100%",
  } as CSSProperties;
}

function renderStaticFileTreeRow(row: any, index: number, options: StaticFileTreeViewProps) {
  const key = nodePath(row?.node) || text(row?.node?.id) || `${row.level}:${index}`;
  return (
    <StaticFileTreeRow
      key={key}
      row={row}
      highlightedPaths={options.highlightedPaths || new Set()}
    />
  );
}

function StaticFileTreeView(options: StaticFileTreeViewProps) {
  const rows = flattenStaticRows(options.tree, options.initialOpenState);
  const emptyMessage = text(options.emptyMessage, "No file tree available.");
  const shellProps = {
    hostRef: options.hostRef,
    scrollbarSize: options.scrollbarSize,
    scrollbarWidth: options.scrollbarWidth,
    style: { maxWidth: "100%", width: "100%" },
  };
  if (!rows.length) {
    return (
      <FileTreeShell {...shellProps}>
        <div className="text-muted padding-sm">{emptyMessage}</div>
      </FileTreeShell>
    );
  }
  return (
    <FileTreeShell {...shellProps}>
      {createElement(
        "scroll-overflow",
        { style: { display: "contents" } },
        <div className="scroll scroll-min tbf-file-tree-scroll" style={scrollStyleFor(options, rows)}>
          <div role="tree" aria-multiselectable="true" style={{ minWidth: 220, width: "100%" }}>
            {rows.map((row, index) => renderStaticFileTreeRow(row, index, options))}
          </div>
        </div>,
      )}
    </FileTreeShell>
  );
}

export { StaticFileTreeView };
export type { StaticFileTreeViewProps };
