import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { buildChartConfig, hasRenderableData } from "#7gwlr4f85sic";
import { logGraphLifecycle, waitForStableGraphModal } from "#ka1hsnuztod9";

function resizeChart(chart) {
  if (!chart || typeof chart.resize !== "function") return;
  chart.resize();
  if (typeof chart.update === "function") chart.update("none");
}

function updateChart(chartRef, canvas, graphProps, props, selectedScale) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    logGraphLifecycle(
      "canvas-context-missing",
      {
        graph_id: props.id || "",
      },
      "warn",
    );
    return;
  }
  const config = buildChartConfig(graphProps);
  const hasData = hasRenderableData(graphProps);
  if (!chartRef.current) {
    chartRef.current = new Chart(ctx, config as any);
  } else {
    chartRef.current.data = config.data;
    chartRef.current.options = config.options;
    resizeChart(chartRef.current);
    chartRef.current.update("none");
  }
  if (!hasData) chartRef.current.clear();
  resizeChart(chartRef.current);
  logGraphLifecycle("chart-update", {
      dataset_count: Array.isArray(props.datasets) ? props.datasets.length : 0,
      graph_id: props.id || "",
      has_data: hasData,
      point_count: Array.isArray(props.points) ? props.points.length : 0,
      selected_scale: selectedScale,
  });
}

function useChartContent(options, canvasRef, chartRef) {
  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return undefined;
      let cancelled = false;
      const graphProps = {
        ...options.props,
        unit_of_measurement: options.unitMeasurement,
        unit_scale: options.selectedScale,
      };
      const cleanup = waitForStableGraphModal(
        canvas,
        () => {
          if (!cancelled) {
            updateChart(
              chartRef,
              canvas,
              graphProps,
              options.props,
              options.selectedScale,
            );
          }
        },
        (waiting) => {
          if (!cancelled) options.setModalWaiting(waiting === true);
        },
      );
      return () => {
        cancelled = true;
        cleanup();
      };
    }, [options.props, options.selectedScale, options.modalWaiting]);
}

function useChartResize(frameRef, chartRef) {
  useEffect(() => {
      const frame = frameRef.current;
      if (!frame || typeof ResizeObserver !== "function") return undefined;
      const observer = new ResizeObserver(() => resizeChart(chartRef.current));
      observer.observe(frame);
      return () => observer.disconnect();
    }, []);
}

function useChartDestroy(chartRef, graphId) {
  useEffect(
    () => () => {
      if (!chartRef.current) return;
      logGraphLifecycle("chart-destroy", { graph_id: graphId || "" });
      chartRef.current.destroy();
      chartRef.current = null;
    },
    [],
  );
}

export function useGraphChart(options) {
  const frameRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
      options.setSelectedScale?.(options.unitDefaultScale);
    }, [
      options.props.type,
      options.props.unit_of_measurement,
      options.props.unit_default_scale,
  ]);
  useChartContent(options, canvasRef, chartRef);
  useChartResize(frameRef, chartRef);
  useChartDestroy(chartRef, options.props.id);
  return { canvasRef, frameRef };
}
