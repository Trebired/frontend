import { createLocalTranslator } from "#4fte8m1x62rd";
import { toString } from "#4fte8m1x62rd";
import { stringifyJsonForHtml } from "#4fte8m1x62rd";
import { truthyArray } from "#4fte8m1x62rd";
import dropdown from "#79y0zfcyhzga";
import type { graph_props, dataset, legend_item, point } from "./types.js";

function toGraphId(value: unknown) {
  const raw = toString(value);
  return raw || `graph_${Math.random().toString(36).slice(2, 10)}`;
}

function derivedUnitMeasurement(graphType: string) {
  if (graphType === "network-download" || graphType === "network-upload")
  return "network";
  if (graphType === "storage-read" || graphType === "storage-write")
  return "storage";
  if (
    graphType === "cpu-usage" ||
      graphType === "memory-usage" ||
      graphType === "gpu-usage"
  )
  return "%";
  return "";
}

function unitOptionsFor(unitMeasurement: string) {
  if (unitMeasurement === "network") {
    return [
      { value: "k", label: "Kb/s" },
      { value: "m", label: "Mb/s" },
      { value: "g", label: "Gb/s" },
    ];
  }

  if (unitMeasurement === "storage") {
    return [
      { value: "k", label: "KB/s" },
      { value: "m", label: "MB/s" },
      { value: "g", label: "GB/s" },
    ];
  }

  return [];
}

function renderUnitDropdown(model: any) {
  const localT = createLocalTranslator(import.meta.url, model.lang);
  if (!model.unitOptions.length) return null;

  return dropdown({
      id: model.unitDropdownId,
      inputId: model.unitDropdownInputId,
      name: "graph_unit_scale",
      value: model.defaultUnitScale,
      options: model.unitOptions,
      placeholder: localT("fields.unit"),
      className: "",
      wrapperClassName: "",
      hideChecks: true,
      rootProps: { "data-graph-unit-dropdown": model.graphId },
      inputProps: { "data-graph-unit-input": model.graphId },
  });
}

function graphBootJson(props: graph_props, model: any) {
  return stringifyJsonForHtml({
      id: model.graphId,
      type: model.graphType,
      title: props.title,
      subtitle: props.subtitle,
      unit_of_measurement: model.unitMeasurement,
      unit_selectable: model.isUnitSelectable,
      unit_default_scale: model.defaultUnitScale,
      unit_dropdown_template_id: model.unitDropdownNode
      ? model.unitDropdownTemplateId
      : "",
      points: model.pointItems,
      datasets: model.datasetItems,
      legend: model.legendItems,
      loaderHtml: '<div class="loader md" aria-hidden="true"></div>',
      loading: model.isLoading,
      state: model.resolvedState,
      stateIcon: model.resolvedStateIcon,
      stateTone: model.resolvedStateTone,
      min: model.minValue,
      max: model.maxValue,
      stroke: props.stroke || "",
      fill: props.fill || "",
      rightDetails: model.rightDetails,
      bottomDetails: model.bottomDetails,
      precision: typeof props.precision === "number" ? props.precision : null,
  });
}

function graphNumericRange(props: graph_props) {
  const numericMin = Number(props.min);
  const numericMax = Number(props.max);
  return {
    maxValue: Number.isFinite(numericMax) ? numericMax : null,
    minValue: Number.isFinite(numericMin) ? numericMin : 0,
  };
}

function graphUnitState(props: graph_props, graphType: string) {
  const unitMeasurement = toString(
    props.unit_of_measurement,
    derivedUnitMeasurement(graphType),
  );
  const isUnitSelectable = props.unit_selectable === true;
  return {
    defaultUnitScale: toString(props.unit_default_scale, "m"),
    isUnitSelectable,
    unitMeasurement,
    unitOptions: isUnitSelectable ? unitOptionsFor(unitMeasurement) : [],
  };
}

function readGraphModel(props: graph_props) {
  const graphType = toString(props.type, "linear");
  const graphId = toGraphId(props.id);
  const isLoading = props.loading === true;
  const unitState = graphUnitState(props, graphType);
  const model = {
    bottomDetails: Array.isArray(props.bottomDetails)
    ? props.bottomDetails
    : [],
    datasetItems: truthyArray<dataset>(props.datasets),
    ...graphNumericRange(props),
    ...unitState,
    descriptionValue: toString(props.description),
    graphId,
    graphType,
    groups: truthyArray(props.groups),
    isLoading,
    lang: props.lang,
    legendItems: truthyArray<legend_item>(props.legend),
    pointItems: truthyArray<point>(props.points),
    resolvedState: toString(props.state, isLoading ? "loading" : "ok"),
    resolvedStateIcon: toString(
      props.stateIcon,
      "remixicon error-warning-line",
    ),
    resolvedStateTone: toString(props.stateTone),
    rightDetails: Array.isArray(props.rightDetails) ? props.rightDetails : [],
    rootAttrs:
    props.rootAttrs && typeof props.rootAttrs === "object"
    ? props.rootAttrs
    : {},
    rows: truthyArray(props.rows),
    unitDropdownId: `${graphId}_unit_dropdown`,
    unitDropdownInputId: `${graphId}_unit_scale`,
    unitDropdownTemplateId: `${graphId}_unit_dropdown_template`,
  };
  const unitDropdownNode = renderUnitDropdown(model);
  return {
    ...model,
    graphBoot: graphBootJson(props, { ...model, unitDropdownNode }),
    unitDropdownNode,
  };
}

export { readGraphModel };
