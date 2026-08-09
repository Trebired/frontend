import React, { useEffect, useLayoutEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { buildLogLineViews } from "./line.js";
import { LogRow } from "./react_view/row.js";
import type { FilteredLogItem, LogsPage } from "./types.js";

const roots = new WeakMap();

function useLatestViewportCallbacks(options) {
  const canForceBottomRef = useRef(null);
  const onViewportScrollRef = useRef(null);
  const onViewportEscapeBottomRef = useRef(null);

  canForceBottomRef.current = options.canForceBottom;
  onViewportScrollRef.current = options.onViewportScroll;
  onViewportEscapeBottomRef.current = options.onViewportEscapeBottom;

  return {
    canForceBottomRef,
    onViewportEscapeBottomRef,
    onViewportScrollRef,
  };
}

function useForceBottom(
  scrollBox,
  views,
  emptyText,
  forceBottomVersion,
  canForceBottomRef,
) {
  useLayoutEffect(() => {
      if (!scrollBox) return undefined;

      const frame = window.requestAnimationFrame(function () {
          const canForce = canForceBottomRef.current;
          if (typeof canForce === "function" && !canForce()) return;
          scrollBox.scrollTop = Math.max(
            0,
            scrollBox.scrollHeight - scrollBox.clientHeight,
          );
      });

      return function cleanup() {
        window.cancelAnimationFrame(frame);
      };
    }, [emptyText, forceBottomVersion, scrollBox, views.length]);
}

function useScrollCallback(scrollBox, onViewportScrollRef) {
  useEffect(() => {
      if (!scrollBox) return undefined;

      let frame = 0;
      function handleScroll() {
        if (frame) return;
        frame = window.requestAnimationFrame(function () {
            frame = 0;
            const onScroll = onViewportScrollRef.current;
            if (typeof onScroll === "function") onScroll();
        });
      }

      scrollBox.addEventListener("scroll", handleScroll, { passive: true });
      return function cleanup() {
        if (frame) window.cancelAnimationFrame(frame);
        scrollBox.removeEventListener("scroll", handleScroll);
      };
    }, [scrollBox]);
}

function useEscapeBottom(scrollBox, onViewportEscapeBottomRef) {
  useEffect(() => {
      if (!scrollBox) return undefined;

      let touchStartY = 0;
      const escapeBottom = () => {
        const onEscape = onViewportEscapeBottomRef.current;
        if (typeof onEscape === "function") onEscape();
      };
      const handleWheel = (event) => {
        if (event.deltaY < 0) escapeBottom();
      };
      const handleKeyDown = (event) => {
        if (
          event.key === "ArrowUp" ||
            event.key === "PageUp" ||
            event.key === "Home"
        )
        escapeBottom();
      };
      const handleTouchStart = (event) => {
        const touch =
        event.touches && event.touches.length ? event.touches[0] : null;
        touchStartY = touch ? touch.clientY : 0;
      };
      const handleTouchMove = (event) => {
        const touch =
        event.touches && event.touches.length ? event.touches[0] : null;
        if (touch && touch.clientY > touchStartY) escapeBottom();
      };

      scrollBox.addEventListener("wheel", handleWheel, { passive: true });
      scrollBox.addEventListener("keydown", handleKeyDown);
      scrollBox.addEventListener("touchstart", handleTouchStart, {
          passive: true,
      });
      scrollBox.addEventListener("touchmove", handleTouchMove, { passive: true });

      return function cleanup() {
        scrollBox.removeEventListener("wheel", handleWheel);
        scrollBox.removeEventListener("keydown", handleKeyDown);
        scrollBox.removeEventListener("touchstart", handleTouchStart);
        scrollBox.removeEventListener("touchmove", handleTouchMove);
      };
    }, [scrollBox]);
}

function emptyChildren(emptyText) {
  if (!emptyText) return null;
  return [
    React.createElement(
      "div",
      {
        key: "empty",
        className: "log-line",
        "data-role": "text",
      },
      emptyText,
    ),
  ];
}

function rawChildren(rawMode, rawLines) {
  if (!rawMode) return null;
  return [
    React.createElement(
      "pre",
      {
        key: "raw",
        className: "log-raw-text",
      },
      rawLines || "",
    ),
  ];
}

function rowChildren(views, onOpen, onToggleMarker) {
  return views.map((view) =>
    React.createElement(LogRow, {
        key: view.logKey,
        view,
        onOpen,
        onToggleMarker,
    }),
  );
}

function viewportChildren(props) {
  return (
    emptyChildren(props.emptyText) ||
      rawChildren(props.rawMode, props.rawLines) ||
      rowChildren(props.views, props.onOpen, props.onToggleMarker)
  );
}

function LogViewport(props) {
  const refs = useLatestViewportCallbacks(props);
  useForceBottom(
    props.scrollBox,
    props.views,
    props.emptyText,
    props.forceBottomVersion,
    refs.canForceBottomRef,
  );
  useScrollCallback(props.scrollBox, refs.onViewportScrollRef);
  useEscapeBottom(props.scrollBox, refs.onViewportEscapeBottomRef);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      "div",
      {
        className: "log-box-content",
      },
      viewportChildren(props),
    ),
  );
}

function renderOptions(options) {
  return {
    canForceBottom:
    typeof options.canForceBottom === "function"
    ? options.canForceBottom
    : null,
    emptyText: options.emptyText || "",
    onOpen: typeof options.onOpen === "function" ? options.onOpen : null,
    onToggleMarker:
    typeof options.onToggleMarker === "function"
    ? options.onToggleMarker
    : null,
    onViewportEscapeBottom:
    typeof options.onViewportEscapeBottom === "function"
    ? options.onViewportEscapeBottom
    : null,
    onViewportScroll:
    typeof options.onViewportScroll === "function"
    ? options.onViewportScroll
    : null,
    rawLines: options.rawLines || "",
    rawMode: options.rawMode === true,
  };
}

export function renderLogViewport(
  page: LogsPage,
  options: {
    items?: FilteredLogItem[];
    emptyText?: string;
    rawLines?: string;
    rawMode?: boolean;
    onOpen?: (logKey: string, trigger: Element | null) => void;
    onToggleMarker?: (logKey: string) => void;
    onViewportScroll?: () => void;
    onViewportEscapeBottom?: () => void;
    canForceBottom?: () => boolean;
  } = {},
) {
  const scrollBox = page && page.ui ? page.ui.box : null;
  const mount = page && page.ui ? page.ui.reactRoot : null;
  if (!scrollBox || !mount) return;

  let root = roots.get(mount);
  if (!root) {
    root = createRoot(mount);
    roots.set(mount, root);
  }

  const views = buildLogLineViews(
    page,
    Array.isArray(options.items) ? options.items : [],
  );
  root.render(
    React.createElement(LogViewport, {
        scrollBox,
        views,
        forceBottomVersion: Number(page.state.forceBottomVersion || 0),
        ...renderOptions(options),
    }),
  );
}
