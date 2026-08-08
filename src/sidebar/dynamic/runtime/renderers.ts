import { formatWrappedCount } from "#hzrmwbvgt2ax";
import type {
  DynamicSidebarRuntimeCountContext,
  DynamicSidebarRuntimeLoaderContext,
  DynamicSidebarRuntimeStateContext,
} from "./types.js";
import { textValue } from "#yv4ubgils4dc";

function defaultCountNode(context: DynamicSidebarRuntimeCountContext) {
  const node = context.document.createElement("span");
  node.className = "time-counter";
  node.textContent = formatWrappedCount(context.count);
  return node;
}

function loaderNode(documentRef: Document, size: string) {
  const node = documentRef.createElement("div");
  node.className = `loader-circle ${size}`;
  node.setAttribute("aria-hidden", "true");
  return node;
}

function defaultLoaderNode(context: DynamicSidebarRuntimeLoaderContext) {
  if (context.repositoryId) {
    if (context.running <= 0) return null;
    const host = context.document.createElement("span");
    host.className = "text-muted no-select inline-row gap-xs ver-center";
    host.appendChild(loaderNode(context.document, "xs"));
    return host;
  }
  if (context.running <= 0) return null;
  const host = context.document.createElement("span");
  host.className = "text-muted no-select inline-row gap-xs ver-center";
  host.appendChild(loaderNode(context.document, "sm"));
  return host;
}

function defaultStateNode(context: DynamicSidebarRuntimeStateContext) {
  const state = textValue(context.state).toLowerCase();
  if (!state) return null;
  const node = context.document.createElement("span");
  node.className = `dot dot-sm ${state === "running" ? "green" : "red"}`;
  node.setAttribute("aria-hidden", "true");
  node.setAttribute("data-state", state);
  node.setAttribute("data-tbf-sidebar-state-dot", "");
  return node;
}

export {
  defaultCountNode,
  defaultLoaderNode,
  defaultStateNode,
  loaderNode,
};
