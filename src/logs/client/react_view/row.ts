import React from "react";
import { logsT } from "#gu61mitj537f";

function styleObj(input) {
  const out = {};
  const source = input && typeof input === "object" ? input : {};

  for (const [key, value] of Object.entries(source)) {
    if (value == null || value === "") continue;
    out[key] = value;
  }

  return out;
}

function markerButton(view, onToggleMarker) {
  function toggleMarker(event) {
    event.preventDefault();
    event.stopPropagation();
    if (typeof onToggleMarker === "function") onToggleMarker(view.logKey);
  }

  return React.createElement(
    "button",
    {
      type: "button",
      className: "log-cell log-marker",
      "data-role": "marker",
      title: logsT("marker"),
      "aria-label": view.marked ? logsT("removeMarker") : logsT("addMarker"),
      onClick: toggleMarker,
      style: {
        color: view.marked ? "var(--canvas-ansi-1)" : "var(--text-color-muted)",
        background: "transparent",
        border: "0",
        padding: "0",
        margin: "0",
        cursor: "pointer",
        alignSelf: "stretch",
        minWidth: "12px",
        fontSize: "14px",
        lineHeight: "1",
      },
    },
    "\u2022",
  );
}

function timestampCell(view) {
  return React.createElement(
    "span",
    {
      className: "log-cell log-time",
      "data-role": "timestamp",
      style: { color: "var(--text-color-muted)" },
    },
    view.timestamp,
  );
}

function levelCell(view) {
  return React.createElement(
    "span",
    {
      className: "log-cell log-level",
      "data-role": "level",
      style: styleObj({
          color: view.levelColor,
          fontWeight: view.levelBold ? "700" : "",
      }),
    },
    view.levelLabel,
  );
}

function groupCell(view) {
  return React.createElement(
    "span",
    {
      className: "log-cell log-group",
      "data-role": "group",
      style: { color: "var(--text-color-muted)" },
    },
    view.groupLabel,
  );
}

function requestSpan(view) {
  if (!view.reqId) return null;
  return React.createElement(
    "span",
    {
      className: "log-req",
      "data-role": "request",
      style: styleObj({ color: view.reqColor }),
    },
    " req_id=" + view.reqId,
  );
}

function metadataSpan(view) {
  if (!view.metadata) return null;
  return React.createElement(
    "span",
    {
      className: "log-meta",
      "data-role": "metadata",
    },
    " " + view.metadata,
  );
}

function messageCell(view) {
  return React.createElement(
    "span",
    {
      className: "log-cell log-message",
      "data-role": "message",
    },
    view.message,
    requestSpan(view),
    metadataSpan(view),
  );
}

function stackBlock(view) {
  if (!view.stack) return null;
  return React.createElement(
    "div",
    {
      className: "log-line-stack",
      "data-role": "stack",
    },
    view.stack,
  );
}

function highlightedStyle(view) {
  if (!view.highlighted) return undefined;
  return {
    background: "rgba(255, 199, 0, 0.15)",
    outline: "var(--border-width) solid rgba(255, 199, 0, 0.45)",
    borderRadius: "4px",
  };
}

function LogRow({ view, onOpen, onToggleMarker }) {
  function open(event) {
    if (typeof onOpen === "function") onOpen(view.logKey, event.currentTarget);
  }

  function onKeyDown(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    open(event);
  }

  return React.createElement(
    "div",
    {
      className: "log-line gap-xs",
      "data-log-key": view.logKey,
      role: "button",
      tabIndex: 0,
      title: logsT("clickOpenDetails"),
      "aria-label": logsT("clickOpenDetails"),
      onClick: open,
      onKeyDown,
      style: highlightedStyle(view),
    },
    markerButton(view, onToggleMarker),
    timestampCell(view),
    levelCell(view),
    groupCell(view),
    messageCell(view),
    stackBlock(view),
  );
}

export { LogRow };
