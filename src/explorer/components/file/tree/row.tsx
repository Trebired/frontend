import type { CSSProperties } from "react";

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

type FileTreeRowProps = {
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
  return {
    canActivateFile: canSelect || canOpen,
    canOpen,
    canSelect,
    fileCount: Math.max(0, Number(data.file_count) || 0),
    highlighted,
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

function rowBackground(model: ReturnType<typeof readRowModel>) {
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
  if (!model.isInteractive) return;
  props.onSelectedPathChange?.(model.relPath);
  props.onPathOpen?.(model.relPath, { kind: model.kind, name: model.name });
  if (model.kind === "dir") {
    props.onToggle?.(model.relPath);
    return;
  }
  activateFile(props, model);
}

function cursorFor(model: ReturnType<typeof readRowModel>) {
  if (!model.isInteractive) return "default";
  return model.canActivateFile || model.kind === "dir" ? "pointer" : "default";
}

function FileTreeRow(props: FileTreeRowProps) {
  const model = readRowModel(props);
  const rowStyle: CSSProperties = {
    borderBottom: "var(--border-width) solid var(--border-surface-1)",
    height: 34,
    minHeight: 34,
  };
  return (
    <div
    role="treeitem"
    aria-level={model.rowLevel}
    aria-expanded={model.kind === "dir" ? model.isOpen : undefined}
    data-tbf-file-tree-path={model.relPath || undefined}
    style={rowStyle}
    className={primitiveInlineRowClassName({ verticalCenter: true })}
    >
    <button
    type="button"
    className={primitiveInlineRowClassName({
          className: primitiveTextClassName({
              className: "width-max text-left",
              muted: !(model.canActivateFile || model.kind === "dir"),
          }),
          gap: "xs",
          verticalCenter: true,
    })}
    style={{
        background: rowBackground(model),
        border: "var(--border-width) solid transparent",
        borderLeft: `calc(var(--border-width) * 2) solid ${fileTreeLeftBorderColor(model)}`,
        borderRadius: 0,
        cursor: cursorFor(model),
        minHeight: 0,
        padding: "5px 10px",
        paddingLeft: 10 + (model.rowLevel - 1) * 18,
        width: "100%",
    }}
    aria-disabled={model.isInteractive ? undefined : true}
    tabIndex={model.isInteractive ? undefined : -1}
    onClick={() => handleRowClick(props, model)}
    >
    <FileTreeToggle isDir={model.kind === "dir"} isOpen={model.isOpen} />
    <FileTreeIcon highlighted={model.highlighted} iconSpec={model.iconSpec} />
    <FileTreeName name={model.name} />
    <FileTreeCount fileCount={model.fileCount} kind={model.kind} />
    </button>
    </div>
  );
}

export { FileTreeRow };
export type { FileTreeRowProps };
