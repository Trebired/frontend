import {
  formatWrappedCount,
  primitiveInlineRowClassName,
  primitiveStatusDotClassName,
  primitiveTextClassName,
} from "#hzrmwbvgt2ax";
import type {
  DynamicSidebarRuntimeCountContext,
  DynamicSidebarRuntimeLoaderContext,
  DynamicSidebarRuntimeStateContext,
} from "./types.js";
import { textValue } from "#yv4ubgils4dc";
import { appendIcon } from "#e55z7pkijewq";
import { frontendClassName, frontendDataAttr } from "#5vbaqj4pirp3";

function defaultCountNode(context: DynamicSidebarRuntimeCountContext) {
  const node = context.document.createElement("span");
  node.className = "time-counter";
  node.textContent = formatWrappedCount(context.count);
  return node;
}

function loaderNode(documentRef: Document, size: string) {
  const node = documentRef.createElement("div");
  node.className = `${frontendClassName("loader-circle")} ${frontendClassName(size)}`;
  node.setAttribute("aria-hidden", "true");
  return node;
}

function defaultLoaderNode(context: DynamicSidebarRuntimeLoaderContext) {
  if (context.running > 0) {
    const host = context.document.createElement("span");
    host.className = primitiveInlineRowClassName({
        className: primitiveTextClassName({ className: frontendClassName("no-select"), muted: true }),
        gap: "xs",
        verticalCenter: true,
    });
    host.appendChild(loaderNode(context.document, context.statusPath ? "xs" : "sm"));
    return host;
  }
  if (context.status) {
    const host = context.document.createElement("span");
    host.className = primitiveInlineRowClassName({ className: frontendClassName("no-select"), verticalCenter: true });
    host.setAttribute("aria-hidden", "true");
    if (context.status.color) host.style.color = context.status.color;
    if (context.status.title) host.title = context.status.title;
    appendIcon(host, context.status.icon);
    return host;
  }
  if (!context.active || context.idleCount == null) return null;
  return defaultCountNode({ ...context, count: context.idleCount, path: context.idleCountPath });
}

function defaultStateNode(context: DynamicSidebarRuntimeStateContext) {
  const state = textValue(context.state).toLowerCase();
  if (!state) return null;
  const node = context.document.createElement("span");
  node.className = primitiveStatusDotClassName({
      size: "sm",
      tone: state === "running" ? "green" : "red",
  });
  node.setAttribute("aria-hidden", "true");
  node.setAttribute(frontendDataAttr("state"), state);
  node.setAttribute(frontendDataAttr("sidebar-state-dot"), "");
  return node;
}

export {
  defaultCountNode,
  defaultLoaderNode,
  defaultStateNode,
  loaderNode,
};
