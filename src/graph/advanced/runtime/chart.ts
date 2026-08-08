import { convertGraphUnitValue } from "./units.js";
import { resolveCanvasColor } from "./utils.js";

function pointTime(label) {
  const parsed = Date.parse(String(label || ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function pointKey(point, index) {
  const label = point && point.label ? String(point.label) : "";
  const time = pointTime(label);
  if (time != null) return `t:${time}`;
  if (label) return `l:${label}`;
  return `i:${index}`;
}

function normalizePoints(points, options) {
  const normalized = (Array.isArray(points) ? points : []).map(
    (point, index) => {
      const label = point && point.label ? String(point.label) : "";
      const time = pointTime(label);
      return {
        key: pointKey({ label }, index),
        label,
        sortValue: time != null ? time : index,
        sourceIndex: index,
        value: convertGraphUnitValue(
          point && point.value,
          options.unit_of_measurement,
          options.unit_scale,
        ),
      };
    },
  );

  const byKey = new Map();
  normalized.forEach((point) => {
      byKey.set(point.key, point);
  });
  return Array.from(byKey.values()).sort((a, b) =>
    a.sortValue !== b.sortValue
    ? a.sortValue - b.sortValue
    : a.sourceIndex - b.sourceIndex,
  );
}

function defaultBorderWidth() {
  const source =
  typeof document === "object" && document && document.documentElement
  ? getComputedStyle(document.documentElement).getPropertyValue(
    "--border-width",
  )
  : "";
  const parsed = Number.parseFloat(String(source || "").trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function normalizeDatasets(options) {
  const incoming = Array.isArray(options.datasets) ? options.datasets : [];
  const normalized = incoming
  .map((dataset) => {
      const points = normalizePoints(dataset && dataset.points, options);
      if (!points.length) return null;
      return {
        points,
        stroke: dataset && dataset.stroke,
        fill: dataset && dataset.fill,
        fillArea: dataset && dataset.fillArea === true,
        borderDash: Array.isArray(dataset && dataset.borderDash)
        ? dataset.borderDash
        .map((value) => Number(value))
        .filter(Number.isFinite)
        : [],
        borderWidth: Number.isFinite(Number(dataset && dataset.borderWidth))
        ? Number(dataset.borderWidth)
        : defaultBorderWidth(),
      };
  })
  .filter(Boolean);

  if (normalized.length) return normalized;
  return [
    {
      points: normalizePoints(options.points, options),
      stroke: options.stroke,
      fill: options.fill,
      fillArea: true,
      borderDash: [],
      borderWidth: defaultBorderWidth(),
    },
  ];
}

function alignDatasets(datasets) {
  const labelsByKey = new Map();
  datasets.forEach((dataset) => {
      dataset.points.forEach((point) => {
          if (!labelsByKey.has(point.key))
          labelsByKey.set(point.key, {
              key: point.key,
              label: point.label,
              sortValue: point.sortValue,
              sourceIndex: point.sourceIndex,
          });
      });
  });

  const labels = Array.from(labelsByKey.values()).sort((a, b) =>
    a.sortValue !== b.sortValue
    ? a.sortValue - b.sortValue
    : a.sourceIndex - b.sourceIndex,
  );
  const keys = labels.map((entry) => entry.key);

  return {
    labels: keys,
    datasets: datasets.map((dataset) => {
        const valuesByKey = new Map();
        dataset.points.forEach((point) => {
            valuesByKey.set(point.key, point.value);
        });
        return {
          ...dataset,
          alignedData: keys.map((key) =>
            valuesByKey.has(key) ? valuesByKey.get(key) : null,
          ),
        };
    }),
  };
}

function getBottomTickMap(pointCount, bottomDetails) {
  const labels = Array.isArray(bottomDetails)
  ? bottomDetails.map((detail) => String(detail))
  : [];
  const count = Number(pointCount) || 0;
  const map = new Map();
  if (!count || !labels.length) return map;

  const lastIndex = count - 1;
  labels.forEach((label, index) => {
      const position =
      labels.length === 1
      ? lastIndex
      : Math.round((index / (labels.length - 1)) * lastIndex);
      map.set(position, label);
  });
  return map;
}

function resolveGraphUnitMeasurement(props) {
  const explicit =
  typeof props.unit_of_measurement === "string"
  ? props.unit_of_measurement.trim()
  : "";
  if (explicit) return explicit;
  return typeof props.type === "string" ? props.type.trim() : "";
}

function graphUnitValue(options, value) {
  return convertGraphUnitValue(
    value,
    options.unit_of_measurement,
    options.unit_scale,
  );
}

function yAxisDetails(options) {
  return Array.isArray(options.rightDetails)
  ? options.rightDetails.map((detail) => graphUnitValue(options, detail))
  : [];
}

function yAxisValues(datasets) {
  return (Array.isArray(datasets) ? datasets : [])
  .flatMap((dataset) => (Array.isArray(dataset.points) ? dataset.points : []))
  .map((point) => point.value)
  .filter(Number.isFinite);
}

function yAxisLabel(value, precision) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "";
  if (Number.isInteger(num)) return `${num}`;
  return num.toFixed(precision).replace(/\.?0+$/, "");
}

function getYAxisConfig(options, datasets) {
  const details = yAxisDetails(options).filter(Number.isFinite);
  const values = yAxisValues(datasets);
  const detailMax = details.length ? Math.max.apply(null, details) : 0;
  const valueMax = values.length ? Math.max.apply(null, values) : 0;
  const configuredMax =
  options.max == null
  ? null
  : convertGraphUnitValue(
    options.max,
    options.unit_of_measurement,
    options.unit_scale,
  );
  const min =
  options.min == null
  ? 0
  : convertGraphUnitValue(
    options.min,
    options.unit_of_measurement,
    options.unit_scale,
  );
  const max =
  Number.isFinite(configuredMax) && configuredMax > min
  ? configuredMax
  : Math.max(detailMax, valueMax, min + 1);
  const steps = Math.max(details.length - 1, 1);
  const stepSize = (max - min) / steps;
  const precision = Number.isInteger(options.precision) ? options.precision : 2;
  return {
    min,
    max,
    stepSize,
    callback(value) {
      return yAxisLabel(value, precision);
    },
  };
}

function chartDatasets(aligned) {
  return aligned.datasets.map((dataset, index) => ({
        data: dataset.alignedData,
        borderColor: resolveCanvasColor(
          dataset.stroke,
          index === 0 ? "#60a5fa" : "#22d3ee",
        ),
        backgroundColor: resolveCanvasColor(
          dataset.fill,
          index === 0 ? "rgba(96, 165, 250, 0.16)" : "rgba(34, 211, 238, 0.12)",
        ),
        fill: dataset.fillArea,
        spanGaps: true,
        tension: 0.25,
        pointRadius: 0,
        borderWidth: dataset.borderWidth,
        borderDash: dataset.borderDash,
  }));
}

function chartScales(yAxis, bottomTickMap) {
  return {
    x: {
      grid: { display: false },
      ticks: {
        color: "#8b8b8b",
        maxRotation: 0,
        minRotation: 0,
        callback(value, index) {
          return bottomTickMap.get(index) || "";
        },
      },
      border: { color: "rgba(255,255,255,0.08)" },
    },
    y: {
      position: "right",
      min: yAxis.min,
      max: yAxis.max,
      grace: 0,
      ticks: {
        color: "#8b8b8b",
        stepSize: yAxis.stepSize,
        callback: yAxis.callback,
      },
      grid: { color: "rgba(255,255,255,0.08)" },
      border: { color: "rgba(255,255,255,0.08)" },
    },
  };
}

function buildChartConfig(options) {
  const datasets = normalizeDatasets(options);
  const aligned = alignDatasets(datasets);
  const pointCount = aligned.labels.length;
  const yAxis = getYAxisConfig(options, datasets);
  const bottomTickMap = getBottomTickMap(pointCount, options.bottomDetails);

  return {
    type: "line",
    data: {
      labels: aligned.labels,
      datasets: chartDatasets(aligned),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      events: [],
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: chartScales(yAxis, bottomTickMap),
    },
  };
}

function hasRenderableData(options) {
  return normalizeDatasets(options).some((dataset) =>
    dataset.points.some((point) =>
      Number.isFinite(Number(point && point.value)),
    ),
  );
}

export {
  alignDatasets,
  buildChartConfig,
  getBottomTickMap,
  getYAxisConfig,
  hasRenderableData,
  normalizeDatasets,
  normalizePoints,
  pointKey,
  pointTime,
  resolveGraphUnitMeasurement,
};
