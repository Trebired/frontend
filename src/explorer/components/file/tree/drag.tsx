import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { frontendDataAttr } from "#5vbaqj4pirp3";

type FileTreeMoveHandler = (sourcePath: string, targetPath: string) => void;
type FileTreeMoveCheck = (sourcePath: string, targetPath: string) => boolean;

type FileTreeDragState = {
  active: boolean;
  label: string;
  source: string;
  target: string | null;
  x: number;
  y: number;
};

type FileTreeDragOptions = {
  canMove?: FileTreeMoveCheck;
  isOpen: (path: string) => boolean;
  kinds: Map<string, string>;
  labels: Map<string, string>;
  onMove?: FileTreeMoveHandler;
  openPath: (path: string) => void;
};

const FILE_TREE_DROP_ATTR = frontendDataAttr("file-tree-drop");
const FILE_TREE_ROOT_DROP = ".";
const DRAG_THRESHOLD = 5;
const HOVER_OPEN_MS = 600;
const IDLE_STATE: FileTreeDragState = { active: false, label: "", source: "", target: null, x: 0, y: 0 };

function parentTreePath(path: string) {
  const index = path.lastIndexOf("/");
  return index < 0 ? "" : path.slice(0, index);
}

function canDropOnTarget(options: FileTreeDragOptions, source: string, target: string) {
  if (!source || target === source || target.startsWith(`${source}/`)) return false;
  if (target && options.kinds.get(target) !== "dir") return false;
  if (parentTreePath(source) === target) return false;
  return typeof options.canMove === "function" ? options.canMove(source, target) !== false : true;
}

function dropTargetAt(x: number, y: number): string | null {
  const element = typeof document === "undefined" ? null : document.elementFromPoint(x, y);
  const host = element instanceof Element ? element.closest(`[${FILE_TREE_DROP_ATTR}]`) : null;
  if (!host) return null;
  const value = host.getAttribute(FILE_TREE_DROP_ATTR) || "";
  return value === FILE_TREE_ROOT_DROP ? "" : value;
}

function fileTreeDropAttrs(path: string) {
  return { [FILE_TREE_DROP_ATTR]: path || FILE_TREE_ROOT_DROP };
}

function useHoverOpen(options: FileTreeDragOptions) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hovered = useRef("");
  const clear = useCallback(() => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      hovered.current = "";
    }, []);
  const hover = useCallback((target: string | null) => {
      if (target === hovered.current) return;
      clear();
      if (!target || options.kinds.get(target) !== "dir" || options.isOpen(target)) return;
      hovered.current = target;
      timer.current = setTimeout(() => options.openPath(target), HOVER_OPEN_MS);
    }, [clear, options]);
  return useMemo(() => ({ clear, hover }), [clear, hover]);
}

type FileTreeDragSession = {
  active: boolean;
  pointerId: number;
  source: string;
  target: string | null;
  x0: number;
  y0: number;
};

function attachDragListeners(pointerId: number, track: (event: PointerEvent) => void, finish: (commit: boolean) => void) {
  const onUp = (event: PointerEvent) => {
    if (event.pointerId === pointerId) finish(true);
  };
  const onCancel = () => finish(false);
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") finish(false);
  };
  window.addEventListener("pointermove", track, { passive: false });
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onCancel);
  window.addEventListener("keydown", onKey);
  return () => {
    window.removeEventListener("pointermove", track);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onCancel);
    window.removeEventListener("keydown", onKey);
  };
}

function draggedState(current: FileTreeDragSession, options: FileTreeDragOptions, event: PointerEvent): FileTreeDragState {
  const hit = dropTargetAt(event.clientX, event.clientY);
  current.target = hit !== null && canDropOnTarget(options, current.source, hit) ? hit : null;
  return {
    active: true,
    label: options.labels.get(current.source) || current.source,
    source: current.source,
    target: current.target,
    x: event.clientX,
    y: event.clientY,
  };
}

function releaseClickAfterDrag(suppressClick: { current: boolean }) {
  suppressClick.current = true;
  setTimeout(() => {
      suppressClick.current = false;
    }, 0);
}

function useDragSession(options: FileTreeDragOptions, setState: (state: FileTreeDragState) => void) {
  const session = useRef<FileTreeDragSession | null>(null);
  const suppressClick = useRef(false);
  const detach = useRef<(() => void) | null>(null);
  const hoverOpen = useHoverOpen(options);
  const finish = useCallback((commit: boolean) => {
      const current = session.current;
      session.current = null;
      detach.current?.();
      detach.current = null;
      hoverOpen.clear();
      setState(IDLE_STATE);
      if (!current || !current.active) return;
      releaseClickAfterDrag(suppressClick);
      if (commit && current.target !== null) options.onMove?.(current.source, current.target);
    }, [hoverOpen, options, setState]);
  const track = useCallback((event: PointerEvent) => {
      const current = session.current;
      if (!current || event.pointerId !== current.pointerId) return;
      if (!current.active && Math.hypot(event.clientX - current.x0, event.clientY - current.y0) < DRAG_THRESHOLD) return;
      current.active = true;
      event.preventDefault();
      const next = draggedState(current, options, event);
      hoverOpen.hover(next.target);
      setState(next);
    }, [hoverOpen, options, setState]);
  return { detach, finish, hoverOpen, session, suppressClick, track };
}

function useFileTreeDrag(options: FileTreeDragOptions) {
  const [state, setState] = useState<FileTreeDragState>(IDLE_STATE);
  const drag = useDragSession(options, setState);
  const enabled = typeof options.onMove === "function";
  const startDrag = useCallback((event: ReactPointerEvent, path: string) => {
      if (!enabled || !path || event.button !== 0 || drag.session.current) return;
      drag.session.current = { active: false, pointerId: event.pointerId, source: path, target: null, x0: event.clientX, y0: event.clientY };
      drag.detach.current = attachDragListeners(event.pointerId, drag.track, drag.finish);
    }, [drag, enabled]);
  const clearHover = useRef(drag.hoverOpen.clear);
  clearHover.current = drag.hoverOpen.clear;
  useEffect(() => () => {
      drag.detach.current?.();
      clearHover.current();
    }, []);
  return {
    consumeClick: () => drag.suppressClick.current,
    enabled,
    startDrag,
    state,
  };
}

function FileTreeDragGhost(props: { state: FileTreeDragState }) {
  if (!props.state.active || typeof document === "undefined") return null;
  return createPortal(
    <div
    aria-hidden="true"
    style={{
        background: "var(--background-surface-2, Canvas)",
        border: "var(--border-width, 1px) solid var(--border-surface-1, currentColor)",
        borderRadius: "var(--radius-sm, 6px)",
        fontSize: 13,
        left: props.state.x + 14,
        maxWidth: 260,
        opacity: props.state.target === null ? 0.7 : 1,
        overflow: "hidden",
        padding: "4px 10px",
        pointerEvents: "none",
        position: "fixed",
        textOverflow: "ellipsis",
        top: props.state.y + 14,
        whiteSpace: "nowrap",
        zIndex: 2147483000,
    }}
    >
    {props.state.label}
    </div>,
    document.body,
  );
}

export { FileTreeDragGhost, fileTreeDropAttrs, parentTreePath, useFileTreeDrag };
export type { FileTreeDragState, FileTreeMoveCheck, FileTreeMoveHandler };
