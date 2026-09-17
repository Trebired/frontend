import React, { useEffect, useRef, useState } from "react";
import { createLocalTranslator } from "#4fte8m1x62rd";
import { documentLanguageTag as documentLang } from "#er0dlx1gtbzh";
import { resolveGraphUnitMeasurement } from "./chart.js";
import { useGraphChart } from "./card/chart.js";
import {
  useUnitDropdownMount,
  useUnitInputSync,
  useUnitRows,
  useUnitSelection,
} from "./card/units.js";
import { GraphCardFrame } from "./render.js";
import {
  getDefaultEmptyIcon,
  getDefaultWarningIcon,
  graphUnitFamily,
  normalizeGraphState,
  normalizeGraphUnitScale,
  registerGraphRoot,
} from "./utils.js";

function stateMessageText(props, graphState) {
  const message =
  typeof props.stateMessage === "string" ? props.stateMessage.trim() : "";
  if (message) return message;
  const description =
  typeof props.description === "string" ? props.description.trim() : "";
  if (description) return description;
  if (graphState !== "empty") return "";
  return createLocalTranslator(import.meta.url, documentLang())("empty.noData");
}

function frameState(props, modalWaiting) {
  const graphState = normalizeGraphState(props);
  const showWarning = graphState === "warning";
  const showEmpty = graphState === "empty";
  return {
    loaderHtml:
    typeof props.loaderHtml === "string" && props.loaderHtml.trim()
    ? props.loaderHtml
    : '<div class="loader md" aria-hidden="true"></div>',
    showEmpty,
    showLoader:
    !showWarning && !showEmpty && (graphState === "loading" || modalWaiting),
    showWarning,
    stateIcon:
    typeof props.stateIcon === "string" && props.stateIcon.trim()
    ? props.stateIcon.trim()
    : showEmpty
    ? getDefaultEmptyIcon()
    : getDefaultWarningIcon(),
    stateMessage: stateMessageText(props, graphState),
  };
}

function useGraphCardState(props) {
  const unitDropdownRef = useRef(null);
  const unitMeasurement = resolveGraphUnitMeasurement(props);
  const unitFamily = graphUnitFamily(unitMeasurement);
  const unitDefaultScale = normalizeGraphUnitScale(
    props.unit_default_scale,
    unitFamily.defaultScale,
  );
  const [selectedScale, setSelectedScale] = useState(unitDefaultScale);
  const [modalWaiting, setModalWaiting] = useState(props.modalWaiting === true);
  const unitSelectable =
  props.unit_selectable === true && unitFamily.selectable;
  const chart = useGraphChart({
      modalWaiting,
      props,
      selectedScale,
      setModalWaiting,
      unitDefaultScale,
      unitMeasurement,
  });
  useUnitDropdownMount(props, unitSelectable, unitDropdownRef);
  useUnitRows(props, selectedScale, unitMeasurement);
  useUnitSelection({
      props,
      selectedScale,
      setSelectedScale,
      unitDefaultScale,
      unitDropdownRef,
      unitMeasurement,
      unitSelectable,
  });
  useUnitInputSync({
      props,
      selectedScale,
      unitDefaultScale,
      unitDropdownRef,
      unitSelectable,
  });
  return {
    chart,
    modalWaiting,
    selectedScale,
    unitDropdownRef,
    unitMeasurement,
    unitSelectable,
  };
}

function GraphCard(props) {
  const rootRef = useRef(null);
  const state = useGraphCardState(props);
  useEffect(() => {
      registerGraphRoot(rootRef.current, props.id);
      return undefined;
    }, [props.id]);
  return React.createElement(GraphCardFrame, {
      ...frameState(props, state.modalWaiting),
      canvasRef: state.chart.canvasRef,
      frameRef: state.chart.frameRef,
      fullscreen_group: props.fullscreen_group,
      fullscreen_id: props.fullscreen_id,
      graphId: props.id || "",
      graphType: props.type || "",
      legendItems: Array.isArray(props.legend) ? props.legend : [],
      modalWaiting: state.modalWaiting,
      selectedScale: state.selectedScale,
      subtitle: props.subtitle,
      title: props.title,
      rootRef,
      unitDropdownRef: state.unitDropdownRef,
      unitMeasurement: state.unitMeasurement,
      unitSelectable: state.unitSelectable,
  });
}

export { GraphCard };
