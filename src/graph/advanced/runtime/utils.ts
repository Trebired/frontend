import { dropdownOptionValue } from "#z2c0jqmjqds4";
import { resolveFrontendLogger } from "#mhi409n0a05q";
import type { GraphUnitScale } from "./units.js";
import {
  formatGraphUnitValue,
  graphUnitEventName,
  graphUnitFamily,
  graphUnitLabel,
  normalizeGraphUnitScale,
} from "./units.js";

function graphLoggingEnabled() {
  if (typeof document === "undefined") return false;
  const value = String(document.documentElement.getAttribute("data-dev-mode") || "")
  .trim()
  .toLowerCase();
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

function connectedElementsFromSet(nodes: Set<HTMLElement> | undefined) {
  if (!nodes) return [];
  return Array.from(nodes).filter((node) => {
      if (node && node.isConnected) return true;
      nodes.delete(node);
      return false;
  });
}

function logGraphSwitch(stage, details = null) {
  if (!graphLoggingEnabled()) return;

  const payload = details && typeof details === "object" ? details : {};

  try {
    resolveFrontendLogger().info(
      "graph.unit",
      `graph unit ${String(stage || "unknown")}`,
      payload,
    );
  } catch {}
}

function logGraphLifecycle(stage, details = null, level = "info") {
  if (!graphLoggingEnabled()) return;

  const payload = details && typeof details === "object" ? details : {};

  try {
    const logger = resolveFrontendLogger();
    const writer =
    level === "error"
    ? logger.error
    : level === "warn"
    ? logger.warn
    : logger.info;
    writer("graph", `graph ${String(stage || "unknown")}`, payload);
  } catch {}
}

const graphRootsById = new Map<string, HTMLElement>();
const graphUnitRowsByGraphId = new Map<string, Set<HTMLElement>>();

function describeGraphNode(node) {
  if (!node || !node.tagName) return "";
  const tag = String(node.tagName || "").toLowerCase();
  const id = node.id ? `#${node.id}` : "";
  return `${tag}${id}`;
}

function graphNodeAttr(node, name) {
  if (!node || typeof node.getAttribute !== "function") return "";
  return String(node.getAttribute(name) || "");
}

function graphOptionValues(options) {
  if (!options || typeof options.querySelectorAll !== "function") return [];
  return Array.from(options.querySelectorAll("[data-dropdown-option]"))
  .map((item) =>
    item instanceof HTMLElement ? dropdownOptionValue(item) : "",
  )
  .filter(Boolean);
}

function cssEscapeIdent(value) {
  const text = String(value || "");
  if (typeof CSS !== "undefined" && CSS && typeof CSS.escape === "function") {
    return CSS.escape(text);
  }
  return text.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function graphTargetElements(target) {
  if (target instanceof HTMLElement) return [target];
  const selector = String(target || "").trim();
  if (!selector || typeof document === "undefined") return [];

  if (selector.startsWith("#")) {
    const element = document.getElementById(selector.slice(1));
    return element instanceof HTMLElement ? [element] : [];
  }

  if (selector.startsWith("[data-") && !/[\s,>+~]/.test(selector)) {
    return Array.from(document.querySelectorAll(selector)).filter(
      (element): element is HTMLElement => element instanceof HTMLElement,
    );
  }

  return [];
}

function registerGraphRoot(root, graphId) {
  const id = String(graphId || "").trim();
  if (!(root instanceof HTMLElement) || !id) return false;
  graphRootsById.set(id, root);
  return true;
}

function registeredGraphRoot(graphId) {
  const id = String(graphId || "").trim();
  const root = id ? graphRootsById.get(id) : null;
  if (root instanceof HTMLElement && root.isConnected) return root;
  if (id) graphRootsById.delete(id);
  return null;
}

function registerGraphUnitRow(element, graphId) {
  const id = String(graphId || "").trim();
  if (!(element instanceof HTMLElement) || !id) return false;
  let rows = graphUnitRowsByGraphId.get(id);
  if (!rows) {
    rows = new Set();
    graphUnitRowsByGraphId.set(id, rows);
  }
  rows.add(element);
  return true;
}

let graphColorProbe = null;

function getGraphColorProbe() {
  if (typeof document === "undefined") return null;
  if (graphColorProbe && graphColorProbe.isConnected) return graphColorProbe;

  const probe = document.createElement("span");
  probe.setAttribute("aria-hidden", "true");
  probe.style.position = "fixed";
  probe.style.left = "-9999px";
  probe.style.top = "-9999px";
  probe.style.width = "0";
  probe.style.height = "0";
  probe.style.pointerEvents = "none";
  probe.style.opacity = "0";
  probe.style.color = "rgb(0, 0, 0)";

  (document.body || document.documentElement || document).appendChild(probe);
  graphColorProbe = probe;
  return probe;
}

function resolveCanvasColor(value, fallback) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return fallback;

  try {
    const probe = getGraphColorProbe();
    if (probe) {
      probe.style.color = "";
      probe.style.color = text;

      if (
        probe.style.color ||
          text.startsWith("var(") ||
          text.startsWith("color-mix(")
      ) {
        const resolved = getComputedStyle(probe).color.trim();
        if (resolved) return resolved;
      }
    }
  } catch {}

  if (!text.startsWith("var(")) return text;

  const match = /^var\((--[^)]+)\)$/i.exec(text);
if (!match || !match[1]) return fallback;

try {
  const resolved = getComputedStyle(document.documentElement)
  .getPropertyValue(match[1])
  .trim();
  return resolved || fallback;
} catch {
  return fallback;
}
}

function updateGraphUnitRows(graphId, unit, scale, precision) {
  const id = String(graphId || "").trim();
  if (!id) return 0;

  let updatedCount = 0;

  connectedElementsFromSet(graphUnitRowsByGraphId.get(id)).forEach(
    (element) => {
      const rowUnit = element.getAttribute("data-graph-unit-kind") || unit;
      const rawValue = element.getAttribute("data-graph-unit-value");
      const rowPrecision = Number(
        element.getAttribute("data-graph-unit-precision"),
      );
      const nextPrecision = Number.isInteger(rowPrecision)
      ? rowPrecision
      : precision;
      element.textContent = formatGraphUnitValue(
        rawValue,
        rowUnit,
        scale,
        nextPrecision,
      );
      element.setAttribute("data-graph-unit-scale", scale);
      updatedCount += 1;
    },
  );

  return updatedCount;
}

function graphUnitScaleForSource(graphId, fallback: GraphUnitScale = "m") {
  const target = registeredGraphRoot(graphId);
  return normalizeGraphUnitScale(
    target ? target.getAttribute("data-graph-unit-scale") : fallback,
    fallback,
  );
}

function setGraphUnitText(targets, value, options: any = {}) {
  const selectors = Array.isArray(targets) ? targets : [targets];
  const rawValue = Number(value);
  const nextValue = Number.isFinite(rawValue) ? rawValue : 0;
  const config = options && typeof options === "object" ? options : {};
  const explicitGraphId = String(config.graphId || "");
  const fallbackUnit = String(config.unit || "");
  const precision = Number.isInteger(Number(config.precision))
  ? Number(config.precision)
  : 2;

  selectors.forEach((selector) => {
      graphTargetElements(selector).forEach((element) => {
          const graphId =
          explicitGraphId ||
            String(element.getAttribute("data-graph-unit-source") || "");
          if (!graphId) return;
          const rowUnit =
          element.getAttribute("data-graph-unit-kind") || fallbackUnit;
          element.setAttribute("data-graph-unit-source", graphId);
          element.setAttribute("data-graph-unit-kind", rowUnit);
          element.setAttribute("data-graph-unit-value", String(nextValue));
          element.setAttribute("data-graph-unit-precision", String(precision));
          registerGraphUnitRow(element, graphId);
          element.textContent = formatGraphUnitValue(
            nextValue,
            rowUnit,
            graphUnitScaleForSource(graphId),
            precision,
          );
      });
  });
}

function normalizeGraphState(props) {
  const state =
  typeof props.state === "string" ? props.state.trim().toLowerCase() : "";
  if (state === "warning") return "warning";
  if (props.loading === true) return "loading";
  if (state === "loading" || state === "ok") return state;
  return props.loading === true ? "loading" : "ok";
}

function graphPropsHaveData(props) {
  const next = props && typeof props === "object" ? props : {};
  if (Array.isArray(next.points) && next.points.length) return true;
  return (
    Array.isArray(next.datasets) &&
      next.datasets.some((dataset) => {
        return Array.isArray(dataset && dataset.points) && dataset.points.length;
    })
  );
}

function renderGraphRenderState(graph, props, loading = false) {
  if (!graph || typeof graph.render !== "function") return;
  const next = props && typeof props === "object" ? props : {};
  graph.render({
      ...next,
      loading: loading === true || !graphPropsHaveData(next),
  });
}

function getDefaultWarningIcon() {
  return "remixicon error-warning-line";
}

function graphModalForNode(node) {
  if (!(node instanceof Element)) return null;
  const modal = node.closest("[data-tbf-modal]");
  return modal instanceof HTMLElement ? modal : null;
}

function graphModalReady(modal) {
  if (!modal) return true;
  return (
    modal.hasAttribute("data-tbf-open") &&
      !modal.hasAttribute("data-tbf-opening") &&
      modal.getAttribute("aria-hidden") !== "true"
  );
}

function graphIsWaitingForModal(node) {
  const modal = graphModalForNode(node);
  return Boolean(modal && !graphModalReady(modal));
}

function waitForStableGraphModal(node, callback, waitingCallback) {
  const modal = graphModalForNode(node);

  if (!modal) {
    if (typeof waitingCallback === "function") waitingCallback(false);
    callback();
    return () => {};
  }

  if (graphModalReady(modal)) {
    if (typeof waitingCallback === "function") waitingCallback(false);
    callback();
    return () => {};
  }

  if (typeof waitingCallback === "function") waitingCallback(true);
  const onReady = () => {
    if (typeof waitingCallback === "function") waitingCallback(false);
    callback();
  };
  modal.addEventListener("tbf:modal-ready", onReady, { once: true });
  return () => modal.removeEventListener("tbf:modal-ready", onReady);
}

export {
  cssEscapeIdent,
  describeGraphNode,
  getDefaultWarningIcon,
  getGraphColorProbe,
  graphIsWaitingForModal,
  logGraphLifecycle,
  graphNodeAttr,
  graphOptionValues,
  graphUnitEventName,
  graphUnitFamily,
  graphUnitLabel,
  logGraphSwitch,
  normalizeGraphState,
  normalizeGraphUnitScale,
  registerGraphRoot,
  renderGraphRenderState,
  resolveCanvasColor,
  setGraphUnitText,
  updateGraphUnitRows,
  waitForStableGraphModal,
};
