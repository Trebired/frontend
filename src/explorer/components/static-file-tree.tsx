import type { CSSProperties } from "react";
import { handleTreeFocus, handleTreeKeyDown } from "./file/tree/keys.js";
import { createElement } from "react";

import { normalizePath, text } from "#m6ckog6p21a3";
import { FileTreeRow } from "./file/tree/row.js";
import { FileTreeShell } from "./file/tree/shell.js";
import { primitiveTextClassName } from "#hzrmwbvgt2ax";
import { frontendClassNames } from "#5vbaqj4pirp3";

const FILE_TREE_ROW_HEIGHT = 34;

type StaticFileTreeViewProps = {
  bare?: boolean;
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
    scrollbarColor: "var(--scroll-thumb) var(--background-surface-2, transparent)",
    scrollbarGutter: needsScroll ? "stable" : "auto",
    scrollbarWidth: "thin",
    width: "100%",
  } as CSSProperties;
}

function renderStaticFileTreeRow(row: any, index: number, options: StaticFileTreeViewProps) {
  const key = nodePath(row?.node) || text(row?.node?.id) || `${row.level}:${index}`;
  return (
    <FileTreeRow
    key={key}
    highlightedPaths={options.highlightedPaths || new Set()}
    interactive={false}
    isOpen={row.isOpen}
    level={row.level}
    node={row.node}
    />
  );
}

function StaticFileTreeView(options: StaticFileTreeViewProps) {
  const rows = flattenStaticRows(options.tree, options.initialOpenState);
  const emptyMessage = text(options.emptyMessage, "No file tree available.");
  const shellProps = {
    bare: options.bare === true,
    hostRef: options.hostRef,
    scrollbarSize: options.scrollbarSize,
    scrollbarWidth: options.scrollbarWidth,
    style: { maxWidth: "100%", width: "100%" },
  };
  if (!rows.length) {
    return (
      <FileTreeShell {...shellProps}>
      <div className={primitiveTextClassName({ muted: true })}>{emptyMessage}</div>
      </FileTreeShell>
    );
  }
  return (
    <FileTreeShell {...shellProps}>
    {createElement(
        "scroll-overflow",
        { style: { display: "contents" } },
        <div className={frontendClassNames("scroll", "scroll-min", "file-tree-scroll")} style={scrollStyleFor(options, rows)}>
        <div
        role="tree"
        aria-multiselectable="true"
        onFocus={handleTreeFocus}
        onKeyDown={handleTreeKeyDown}
        style={{ minWidth: 220, width: "100%" }}
        tabIndex={0}
        >
        {rows.map((row, index) => renderStaticFileTreeRow(row, index, options))}
        </div>
        </div>,
    )}
    </FileTreeShell>
  );
}

export { StaticFileTreeView };
export type { StaticFileTreeViewProps };
