import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { Icon } from "#lbkpzw8nphru";
import { fileTreeDropAttrs, parentTreePath } from "./drag.js";

import {
  normalizePath,
  readFileTreeIconSpec,
  selectableEntryPath,
  text,
} from "#m6ckog6p21a3";
import {
  FileTreeCount,
  FileTreeIcon,
  FileTreeName,
  FileTreeToggle,
  fileTreeLeftBorderColor,
  type FileTreeRowModel,
} from "./parts.js";
import {
  primitiveInlineRowClassName,
  primitiveTextClassName,
} from "#hzrmwbvgt2ax";
import { frontendClassNames, frontendCssVar, frontendDataAttrs } from "#5vbaqj4pirp3";

type FileTreeRowDrag = {
  consumeClick: () => boolean;
  enabled: boolean;
  handleLabel?: string;
  source: string;
  startDrag: (event: ReactPointerEvent, path: string) => void;
  target: string | null;
};

type FileTreeRowProps = {
  drag?: FileTreeRowDrag;
  highlightedPaths?: Set<string>;
  interactive?: boolean;
  isOpen?: boolean;
  level?: number;
  mode?: "browse" | "select";
  node?: Record<string, unknown>;
  onFileOpen?: (path: string) => void;
  onFileSelect?: (path: string) => void;
  onPathOpen?: (path: string, meta: { kind: string; name: string }) => void;
  onSelectedPathChange?: (path: string) => void;
  onToggle?: (path: string) => void;
  selectedPath?: string;
};

function readRowModel(props: FileTreeRowProps): FileTreeRowModel & {
  canActivateFile: boolean;
  canOpen: boolean;
  canSelect: boolean;
  href: string;
  isInteractive: boolean;
  relPath: string;
  rowLevel: number;
  selected: boolean;
} {
  const data = props.node && typeof props.node === "object" ? props.node : {};
  const kind = text(data.kind);
  const relPath = normalizePath(data.rel_path || data.path);
  const highlighted = props.highlightedPaths instanceof Set && props.highlightedPaths.has(relPath);
  const canSelect = kind === "file" && props.mode === "select" && selectableEntryPath(relPath);
  const canOpen = kind === "file" && props.mode === "browse" && typeof props.onFileOpen === "function";
  const href = kind === "file" ? text(data.href) : "";
  return {
    canActivateFile: canSelect || canOpen || Boolean(href),
    canOpen,
    canSelect,
    fileCount: Math.max(0, Number(data.file_count) || 0),
    highlighted,
    href,
    iconSpec: readFileTreeIconSpec(data),
    isInteractive: props.interactive !== false,
    isOpen: Boolean(props.isOpen),
    kind,
    name: text(data.name) || relPath || "Entry",
    relPath,
    rowLevel: Math.max(1, Number(props.level) || 1),
    selected: text(props.selectedPath) === relPath,
  };
}

function rowBackground(model: ReturnType<typeof readRowModel>, dropTarget = false) {
  if (dropTarget) return `color-mix(in srgb, var(${frontendCssVar("focus")}, currentColor) 18%, transparent)`;
  if (model.isInteractive && model.selected) return "var(--background-surface-2, transparent)";
  return model.highlighted
  ? "color-mix(in srgb, var(--background-surface-2, currentColor) 60%, transparent)"
  : "transparent";
}

function activateFile(props: FileTreeRowProps, model: ReturnType<typeof readRowModel>) {
  if (!model.isInteractive || !model.canActivateFile) return;
  if (model.canSelect) props.onFileSelect?.(model.relPath);
  else if (model.canOpen) props.onFileOpen?.(model.relPath);
}

function handleRowClick(props: FileTreeRowProps, model: ReturnType<typeof readRowModel>) {
  if (!model.isInteractive || props.drag?.consumeClick()) return;
  props.onPathOpen?.(model.relPath, { kind: model.kind, name: model.name });
  props.onSelectedPathChange?.(model.relPath);
  if (model.kind === "dir") {
    props.onToggle?.(model.relPath);
    return;
  }
  activateFile(props, model);
}

function cursorFor(model: ReturnType<typeof readRowModel>) {
  if (model.href) return "pointer";
  if (!model.isInteractive) return "default";
  return model.canActivateFile || model.kind === "dir" ? "pointer" : "default";
}

function rowDragState(props: FileTreeRowProps, model: ReturnType<typeof readRowModel>) {
  const drag = props.drag;
  const node = props.node && typeof props.node === "object" ? props.node : {};
  const draggable = Boolean(drag && drag.enabled && model.relPath && node.draggable !== false);
  return {
    draggable,
    dropTarget: Boolean(drag && drag.target !== null && drag.target === model.relPath),
    dragging: Boolean(drag && drag.source && drag.source === model.relPath),
    dropPath: drag && drag.enabled && model.relPath ? (model.kind === "dir" ? model.relPath : parentTreePath(model.relPath)) : null,
  };
}

function FileTreeDragHandle(props: { label?: string; onPointerDown: (event: ReactPointerEvent) => void }) {
  return (
    <span
    aria-hidden="true"
    title={props.label}
    className={primitiveInlineRowClassName({ noShrink: true, verticalCenter: true })}
    style={{ cursor: "grab", flex: "0 0 auto", opacity: 0.6, padding: "0 10px", touchAction: "none", width: "auto" }}
    onPointerDown={(event) => {
        event.stopPropagation();
        props.onPointerDown(event);
    }}
    >
    <Icon spec="remixicon draggable" />
    </span>
  );
}

function rowStyleFor(drag: ReturnType<typeof rowDragState>): CSSProperties {
  return {
    borderBottom: "var(--border-width) solid var(--border-surface-1)",
    height: 34,
    minHeight: 34,
    opacity: drag.dragging ? 0.45 : undefined,
    userSelect: drag.draggable ? "none" : undefined,
  };
}

function rowButtonStyle(model: ReturnType<typeof readRowModel>, dropTarget: boolean): CSSProperties {
  return {
    background: rowBackground(model, dropTarget),
    border: "var(--border-width) solid transparent",
    borderLeft: `calc(var(--border-width) * 2) solid ${fileTreeLeftBorderColor(model)}`,
    borderRadius: 0,
    cursor: cursorFor(model),
    flex: "1 1 auto",
    minHeight: 0,
    minWidth: 0,
    padding: "5px 10px",
    paddingLeft: 10 + (model.rowLevel - 1) * 18,
    width: "100%",
  };
}

function rowContent(model: ReturnType<typeof readRowModel>) {
  return (
    <>
    <FileTreeToggle isDir={model.kind === "dir"} isOpen={model.isOpen} />
    <FileTreeIcon highlighted={model.highlighted} iconSpec={model.iconSpec} />
    <FileTreeName name={model.name} />
    <FileTreeCount fileCount={model.fileCount} kind={model.kind} />
    </>
  );
}

function rowItemProps(model: ReturnType<typeof readRowModel>, dropTarget: boolean) {
  return {
    "aria-current": model.href && model.highlighted ? "page" as const : undefined,
    "aria-expanded": model.kind === "dir" ? model.isOpen : undefined,
    "aria-level": model.rowLevel,
    "aria-selected": model.isInteractive ? model.selected : undefined,
    className: primitiveInlineRowClassName({
        className: primitiveTextClassName({
            className: frontendClassNames("width-max", "text-left"),
            muted: !(model.canActivateFile || model.kind === "dir"),
        }),
        gap: "xs",
        verticalCenter: true,
    }),
    role: "treeitem",
    style: rowButtonStyle(model, dropTarget),
    tabIndex: -1,
  };
}

function FileTreeRow(props: FileTreeRowProps) {
  const model = readRowModel(props);
  const drag = rowDragState(props, model);
  const startDrag = (event: ReactPointerEvent) => props.drag?.startDrag(event, model.relPath);
  const item = rowItemProps(model, drag.dropTarget);
  return (
    <div
    role="none"
    {...frontendDataAttrs({ "file-tree-path": model.relPath || undefined })}
    {...(drag.dropPath !== null ? fileTreeDropAttrs(drag.dropPath) : {})}
    style={rowStyleFor(drag)}
    className={primitiveInlineRowClassName({ verticalCenter: true })}
    >
    {model.href ? (
        <a {...item} href={model.href} {...frontendDataAttrs({ "soft-redirect": "" })}>{rowContent(model)}</a>
      ) : (
        <button
        {...item}
        type="button"
        aria-disabled={model.isInteractive ? undefined : true}
        onClick={() => handleRowClick(props, model)}
        onPointerDown={drag.draggable ? (event) => {
            if (event.pointerType !== "touch") startDrag(event);
          } : undefined}
        >
        {rowContent(model)}
        </button>
    )}
    {drag.draggable ? <FileTreeDragHandle label={props.drag?.handleLabel} onPointerDown={startDrag} /> : null}
    </div>
  );
}

export { FileTreeRow };
export type { FileTreeRowDrag, FileTreeRowProps };
