import graph from "./graph.js";
import { createLocalTranslator } from "./_shared.js";
import type { graph_props } from "./graph/types.js";
import { frontendCssVar } from "#5vbaqj4pirp3";

function cpu_graph(props: graph_props) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  return graph({
      title: props.title || localT("metrics.cpuUsage"),
      type: props.type || "cpu-usage",
      precision: props.precision ?? 1,
      max: props.max ?? 100,
      stroke: props.stroke || "var(--canvas-ansi-4)",
      fill:
      props.fill || "color-mix(in srgb, var(--canvas-ansi-4) 16%, transparent)",
      ...props,
  });
}

function memory_graph(props: graph_props) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  return graph({
      title: props.title || localT("metrics.memoryUsage"),
      type: props.type || "memory-usage",
      precision: props.precision ?? 1,
      max: props.max ?? 100,
      stroke: props.stroke || "var(--canvas-ansi-11)",
      fill:
      props.fill ||
        "color-mix(in srgb, var(--canvas-ansi-11) 16%, transparent)",
      ...props,
  });
}

function gpu_graph(props: graph_props) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  return graph({
      title: props.title || localT("metrics.gpuUsage"),
      type: props.type || "gpu-usage",
      precision: props.precision ?? 1,
      max: props.max ?? 100,
      stroke: props.stroke || "var(--canvas-ansi-3)",
      fill:
      props.fill || "color-mix(in srgb, var(--canvas-ansi-3) 16%, transparent)",
      ...props,
  });
}

function download_graph(props: graph_props) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  return graph({
      title: props.title || localT("metrics.downloadSpeed"),
      type: props.type || "network-download",
      unit_selectable: props.unit_selectable !== false,
      unit_default_scale: props.unit_default_scale || "m",
      precision: props.precision ?? 2,
      stroke: props.stroke || `var(${frontendCssVar("data-graph-download-stroke")}, var(${frontendCssVar("focus")}, currentColor))`,
      fill: props.fill || `var(${frontendCssVar("data-graph-download-fill")}, transparent)`,
      ...props,
  });
}

function upload_graph(props: graph_props) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  return graph({
      title: props.title || localT("metrics.uploadSpeed"),
      type: props.type || "network-upload",
      unit_selectable: props.unit_selectable !== false,
      unit_default_scale: props.unit_default_scale || "m",
      precision: props.precision ?? 2,
      stroke: props.stroke || `var(${frontendCssVar("data-graph-upload-stroke")}, var(${frontendCssVar("focus")}, currentColor))`,
      fill: props.fill || `var(${frontendCssVar("data-graph-upload-fill")}, transparent)`,
      ...props,
  });
}

export {
  cpu_graph,
  download_graph,
  gpu_graph,
  memory_graph,
  upload_graph,
};
