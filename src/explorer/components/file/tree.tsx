import type { CSSProperties } from "react";
import { handleTreeFocus, handleTreeKeyDown } from "./tree/keys.js";
import { createElement, useEffect, useMemo, useRef, useState } from "react";

import {
  buildInitialOpenState,
  findTreeNodeByPath,
  normalizePathList,
  normalizeScrollbarSize,
  normalizeTreeNodes,
  scrollbarWidthBySize,
  text,
} from "#m6ckog6p21a3";
import { StaticFileTreeView } from "#xjjhb3oy2yyh";
import { FileTreeRow } from "./tree/row.js";
import {
  FileTreeDragGhost,
  fileTreeDropAttrs,
  useFileTreeDrag,
  type FileTreeMoveCheck,
  type FileTreeMoveHandler,
} from "./tree/drag.js";
import { Icon } from "#lbkpzw8nphru";
import { FileTreeShell } from "./tree/shell.js";
import { primitiveInlineRowClassName, primitiveTextClassName } from "#hzrmwbvgt2ax";
import { frontendClassName, frontendClassNames, frontendCssVar, frontendDataSelector } from "#5vbaqj4pirp3";

const FILE_TREE_ROW_HEIGHT = 34;

type FileTreeViewProps = {
  autoExpandPaths?: string[];
  canMove?: FileTreeMoveCheck;
  dragHandleLabel?: string;
  onMove?: FileTreeMoveHandler;
  rootLabel?: string;
  emptyMessage?: string;
  height?: number;
  highlightedPaths?: string[];
  interactive?: boolean;
  mode?: "browse" | "select" | string;
  onFileOpen?: (path: string) => void;
  onFileSelect?: (path: string) => void;
  onPathOpen?: (path: string, meta: { kind: string; name: string }) => void;
  scrollbarSize?: string;
  tree?: any[];
};

function parentOpenStateForPath(relPath: string, tree: any[]) {
  const openState: Record<string, boolean> = {};
  const parts = relPath.split("/").filter(Boolean);
  for (let index = 0; index < parts.length - 1; index += 1) {
    const dirPath = parts.slice(0, index + 1).join("/");
    if (dirPath) openState[dirPath] = true;
  }
  const targetNode = findTreeNodeByPath(tree, relPath);
  if (text(targetNode?.kind).toLowerCase() === "dir") openState[relPath] = true;
  return openState;
}

function useTreeScrollFocus(
  scrollRef: any,
  tree: any[],
  prioritizedPaths: string[],
  setOpenState: any,
) {
  useEffect(() => {
      const firstPath = prioritizedPaths[0];
      if (!firstPath) return;
      setOpenState((current: any) => ({
            ...(current && typeof current === "object" ? current : {}),
            ...parentOpenStateForPath(firstPath, tree),
      }));
      requestAnimationFrame(() => {
          const scrollRoot = scrollRef.current;
          const target = scrollRoot instanceof HTMLElement
          ? scrollRoot.querySelector(frontendDataSelector("file-tree-path", firstPath))
          : null;
          if (target instanceof HTMLElement) target.scrollIntoView({ block: "nearest" });
      });
    }, [prioritizedPaths, scrollRef, setOpenState, tree]);
}

function useTreeData(props: FileTreeViewProps) {
  const tree = useMemo(() => normalizeTreeNodes(props.tree), [props.tree]);
  const highlightedPaths = useMemo(
    () => new Set(normalizePathList(props.highlightedPaths)),
    [props.highlightedPaths],
  );
  const prioritizedPaths = useMemo(() => {
      const preferred = normalizePathList(props.autoExpandPaths);
      const highlighted = normalizePathList(props.highlightedPaths);
      return preferred.length ? preferred : highlighted;
    }, [props.autoExpandPaths, props.highlightedPaths]);
  return { highlightedPaths, prioritizedPaths, tree };
}

function isOpenNode(node: any, openState: any) {
  const state = openState && typeof openState === "object" ? openState : {};
  return Boolean(state[text(node?.rel_path || node?.path || node?.id)]);
}

function flattenTreeRows(nodesInput: any[], openState: any, level = 1): any[] {
  const rows: any[] = [];
  const nodes = Array.isArray(nodesInput) ? nodesInput : [];
  nodes.forEach((node) => {
      const isOpen = isOpenNode(node, openState);
      rows.push({ isOpen, level, node });
      if (isOpen) rows.push(...flattenTreeRows(node?.children, openState, level + 1));
  });
  return rows;
}

function treeScrollStyle(treeHeight: number, rows: any[]) {
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

function fileTreeRowKey(row: any, index: number) {
  return text(row?.node?.rel_path || row?.node?.path || row?.node?.id) || `${row.level}:${index}`;
}

function rowDragProps(options: any) {
  const drag = options.drag;
  if (!drag || !drag.enabled) return undefined;
  return {
    consumeClick: drag.consumeClick,
    enabled: true,
    handleLabel: text(options.props.dragHandleLabel) || undefined,
    source: drag.state.active ? drag.state.source : "",
    startDrag: drag.startDrag,
    target: drag.state.active ? drag.state.target : null,
  };
}

function renderFileTreeRow(row: any, index: number, options: any) {
  return (
    <FileTreeRow
    drag={rowDragProps(options)}
    highlightedPaths={options.highlightedPaths}
    interactive={options.interactive}
    isOpen={row.isOpen}
    key={fileTreeRowKey(row, index)}
    level={row.level}
    mode={options.mode}
    node={row.node}
    onFileOpen={options.props.onFileOpen}
    onFileSelect={options.props.onFileSelect}
    onPathOpen={options.props.onPathOpen}
    onSelectedPathChange={options.setSelectedPath}
    onToggle={options.togglePath}
    selectedPath={options.selectedPath}
    />
  );
}

function FileTreeRootDropRow(props: { label: string; target: boolean }) {
  return (
    <div
    role="none"
    {...fileTreeDropAttrs("")}
    className={primitiveInlineRowClassName({ gap: "xs", verticalCenter: true })}
    style={{
        background: props.target ? `color-mix(in srgb, var(${frontendCssVar("focus")}, currentColor) 18%, transparent)` : "transparent",
        borderBottom: "var(--border-width) solid var(--border-surface-1)",
        fontSize: 13,
        height: 34,
        padding: "5px 10px 5px 24px",
    }}
    >
    <Icon spec="remixicon home-4-line" className={frontendClassName("icon")} />
    <span>{props.label}</span>
    </div>
  );
}

function renderInteractiveFileTree(options: any) {
  const emptyMessage = text(options.props.emptyMessage, "No file tree available.");
  const rows = flattenTreeRows(options.tree, options.openState);
  const rootLabel = options.drag.enabled ? text(options.props.rootLabel) : "";
  const dragState = options.drag.state;
  return (
    <FileTreeShell
    dropRoot={options.drag.enabled}
    dropTarget={options.drag.state.active && options.drag.state.target === ""}
    hostRef={options.hostRef}
    scrollbarSize={options.scrollbarSize}
    scrollbarWidth={options.scrollbarWidth}
    >
    {options.tree.length ? (
        createElement(
          "scroll-overflow",
          { style: { display: "contents" } },
          <div
          ref={options.scrollRef}
          className={frontendClassNames("scroll", "scroll-min", "file-tree-scroll")}
          style={treeScrollStyle(options.treeHeight, rows)}
          >
          <div
          role="tree"
          aria-multiselectable="true"
          onFocus={handleTreeFocus}
          onKeyDown={handleTreeKeyDown}
          style={{ minWidth: 220, width: "100%" }}
          tabIndex={0}
          >
          {rootLabel ? <FileTreeRootDropRow label={rootLabel} target={dragState.active && dragState.target === ""} /> : null}
          {rows.map((row: any, index: number) => renderFileTreeRow(row, index, options))}
          </div>
          </div>,
        )
      ) : (
        <div className={primitiveTextClassName({ className: frontendClassName("padding-sm"), muted: true })}>{emptyMessage}</div>
    )}
    <FileTreeDragGhost state={dragState} />
    </FileTreeShell>
  );
}

function toggleFileTreePath(setOpenState: any, relPath: string) {
  setOpenState((current: any) => ({
        ...(current && typeof current === "object" ? current : {}),
        [relPath]: !Boolean(current?.[relPath]),
  }));
}

function useSyncedInitialOpenState(initialOpenState: any, setOpenState: any) {
  useEffect(() => {
      setOpenState((current: any) => ({
            ...initialOpenState,
            ...(current && typeof current === "object" ? current : {}),
      }));
    }, [initialOpenState, setOpenState]);
}

function initialFileTreeOpenPaths(props: FileTreeViewProps) {
  if (Array.isArray(props.autoExpandPaths) && props.autoExpandPaths.length) return props.autoExpandPaths;
  return props.highlightedPaths;
}

function collectTreeMaps(nodes: any[], kinds = new Map<string, string>(), labels = new Map<string, string>()) {
  for (const node of Array.isArray(nodes) ? nodes : []) {
    const path = text(node?.rel_path);
    if (path) {
      kinds.set(path, text(node?.kind));
      labels.set(path, text(node?.name) || path);
    }
    collectTreeMaps(node?.children, kinds, labels);
  }
  return { kinds, labels };
}

function useTreeMoves(props: FileTreeViewProps, tree: any[], openState: any, setOpenState: any) {
  const maps = useMemo(() => collectTreeMaps(tree), [tree]);
  return useFileTreeDrag({
      canMove: props.canMove,
      isOpen: (path: string) => Boolean(openState && openState[path]),
      kinds: maps.kinds,
      labels: maps.labels,
      onMove: props.onMove,
      openPath: (path: string) => setOpenState((current: any) => ({ ...(current || {}), [path]: true })),
  });
}

function FileTreeView(props: FileTreeViewProps) {
  const mode = text(props.mode) === "select" ? "select" : "browse";
  const interactive = props.interactive !== false;
  const treeHeight = Number(props.height) > 0 ? Number(props.height) : 360;
  const scrollbarSize = normalizeScrollbarSize(props.scrollbarSize);
  const scrollbarWidth = scrollbarWidthBySize(scrollbarSize);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { highlightedPaths, prioritizedPaths, tree } = useTreeData(props);
  const initialOpenState = useMemo(
    () => buildInitialOpenState(tree, initialFileTreeOpenPaths(props)),
    [props.autoExpandPaths, props.highlightedPaths, tree],
  );
  const [openState, setOpenState] = useState(initialOpenState);
  const [selectedPath, setSelectedPath] = useState("");
  const togglePath = (relPath: string) => toggleFileTreePath(setOpenState, relPath);
  const drag = useTreeMoves(props, tree, openState, setOpenState);
  const options = {
    drag,
    highlightedPaths,
    hostRef,
    initialOpenState,
    interactive,
    mode,
    openState,
    props,
    scrollbarSize,
    scrollbarWidth,
    scrollRef,
    selectedPath,
    setSelectedPath,
    togglePath,
    tree,
    treeHeight,
  };
  useSyncedInitialOpenState(initialOpenState, setOpenState);
  useTreeScrollFocus(scrollRef, tree, prioritizedPaths, setOpenState);
  return interactive ? renderInteractiveFileTree(options) : (
    <StaticFileTreeView
    highlightedPaths={highlightedPaths}
    hostRef={hostRef}
    initialOpenState={initialOpenState}
    emptyMessage={props.emptyMessage}
    scrollbarSize={scrollbarSize}
    scrollbarWidth={scrollbarWidth}
    tree={tree}
    treeHeight={treeHeight}
    />
  );
}

export { FileTreeView };
export type { FileTreeViewProps };
