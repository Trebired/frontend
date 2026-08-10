import { parseJsonText, queryAll, type BindRoot } from "#er0dlx1gtbzh";

const GRAPH_SELECTOR = "[data-tbf-graph]";
const GRAPH_CANVAS_SELECTOR = "canvas[data-tbf-graph-canvas]";
const GRAPH_CONFIG_SELECTOR = "script[data-tbf-graph-config]";

type GraphPoint = {
  label?: string;
  x: number | string;
  y: number;
};

type GraphSeries = {
  color?: string;
  key: string;
  label?: string;
  points: GraphPoint[];
};

type GraphConfig = {
  max?: number;
  min?: number;
  series: GraphSeries[];
};

function graphConfig(root: HTMLElement): GraphConfig {
  const script = root.querySelector<HTMLScriptElement>(GRAPH_CONFIG_SELECTOR);
  const raw = script?.textContent || root.getAttribute("data-tbf-graph-config") || "";
  return normalizeGraphConfig(parseJsonText<GraphConfig>(raw, { series: [] }));
}

function normalizeGraphConfig(config: GraphConfig): GraphConfig {
  return {
    max: Number.isFinite(config.max) ? config.max : undefined,
    min: Number.isFinite(config.min) ? config.min : undefined,
    series: Array.isArray(config.series) ? config.series.map(normalizeSeries) : [],
  };
}

function normalizeSeries(series: GraphSeries): GraphSeries {
  return {
    color: series.color,
    key: String(series.key || ""),
    label: series.label,
    points: Array.isArray(series.points) ? series.points.map((point) => ({
          label: point.label,
          x: point.x,
          y: Number(point.y) || 0,
    })) : [],
  };
}

function graphBounds(config: GraphConfig) {
  const values = config.series.flatMap((series) => series.points.map((point) => point.y));
  const min = config.min ?? Math.min(0, ...values);
  const max = config.max ?? Math.max(1, ...values);
  return max === min ? { max: max + 1, min } : { max, min };
}

function drawGraphCanvas(canvas: HTMLCanvasElement, config: GraphConfig) {
  const context = canvas.getContext?.("2d");
  if (!context) return false;
  const width = canvas.width || canvas.clientWidth || 640;
  const height = canvas.height || canvas.clientHeight || 260;
  const bounds = graphBounds(config);
  context.clearRect(0, 0, width, height);
  config.series.forEach((series, index) => drawSeries(context, series, bounds, width, height, index));
  return true;
}

function drawSeries(
  context: CanvasRenderingContext2D,
  series: GraphSeries,
  bounds: { max: number; min: number },
  width: number,
  height: number,
  index: number,
) {
  const points = series.points;
  if (!points.length) return;
  context.beginPath();
  context.strokeStyle = series.color || `hsl(${(index * 67) % 360} 70% 45%)`;
  context.lineWidth = 2;
  points.forEach((point, pointIndex) => {
      const pointX = points.length === 1 ? width / 2 : (pointIndex / (points.length - 1)) * width;
      const pointY = height - ((point.y - bounds.min) / (bounds.max - bounds.min)) * height;
      if (pointIndex === 0) context.moveTo(pointX, pointY);
      else context.lineTo(pointX, pointY);
  });
  context.stroke();
}

function bindGraph(root: HTMLElement | null) {
  if (!(root instanceof HTMLElement) || root.hasAttribute("data-tbf-graph-bound")) return null;
  root.setAttribute("data-tbf-graph-bound", "true");
  const config = graphConfig(root);
  queryAll<HTMLCanvasElement>(root, GRAPH_CANVAS_SELECTOR).forEach((canvas) => {
      drawGraphCanvas(canvas, config);
  });
  return config;
}

function bindGraphs(root: BindRoot = document) {
  queryAll<HTMLElement>(root, GRAPH_SELECTOR).forEach(bindGraph);
}

export {
  GRAPH_CANVAS_SELECTOR,
  GRAPH_CONFIG_SELECTOR,
  GRAPH_SELECTOR,
  bindGraph,
  bindGraphs,
  drawGraphCanvas,
  graphBounds,
  graphConfig,
  normalizeGraphConfig,
};
export type { GraphConfig, GraphPoint, GraphSeries };
export * from "./advanced/runtime/index.js";
