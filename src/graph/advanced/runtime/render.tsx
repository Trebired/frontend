import React from "react";
import { createLocalTranslator, icon } from "#4fte8m1x62rd";
import { graphUnitLabel } from "./units.js";
import { resolveCanvasColor } from "./utils.js";
import { resolveFrontendLogger } from "#mhi409n0a05q";
import {
  primitiveGridClassName,
  primitiveInlineRowClassName,
  primitivePaddingClass,
  primitiveStackClassName,
  primitiveTextClassName,
} from "#hzrmwbvgt2ax";

const GRAPH_CARD_ROOT_CLASS = "graph-card-root";
const GRAPH_FRAME_CLASS = "graph-card-frame bg-canvas";
const GRAPH_FRAME_CHROME_CLASS = "radius-md border";

function graphFrameClassName() {
  return [
    GRAPH_FRAME_CLASS,
    primitivePaddingClass("xs"),
    GRAPH_FRAME_CHROME_CLASS,
  ].join(" ");
}

function documentLang() {
  return typeof document === "undefined" ? undefined : document.documentElement.lang || undefined;
}

function GraphTitle(props) {
  if (!props.title) return null;

  return React.createElement(
    "div",
    { className: primitiveInlineRowClassName({ gap: "xs", verticalCenter: true, wrap: true }) },
    React.createElement("h4", null, props.title),
    typeof props.subtitle === "string" && props.subtitle.trim()
    ? React.createElement(
      "span",
      { className: primitiveTextClassName({ muted: true, size: "sm" }) },
      props.subtitle,
    )
    : null,
  );
}

function GraphUnitControls(props) {
  if (props.unitSelectable) {
    return React.createElement("div", {
        ref: props.unitDropdownRef,
        className: "width-xs2",
    });
  }

  if (props.unitMeasurement) {
    return React.createElement(
      "span",
      { className: "pill" },
      graphUnitLabel(props.unitMeasurement, props.selectedScale),
    );
  }

  return null;
}

function GraphHeader(props) {
  if (!props.title) return null;

  return React.createElement(
    "div",
    { className: primitiveInlineRowClassName({ gap: "sm" }) },
    React.createElement(GraphTitle, props),
    React.createElement(
      "div",
      { className: "right" },
      React.createElement(
        "div",
        { className: primitiveInlineRowClassName({ gap: "xs", verticalCenter: true, wrap: true }) },
        React.createElement(GraphUnitControls, props),
      ),
    ),
  );
}

function GraphCanvas(props) {
  return React.createElement("canvas", {
      ref: props.canvasRef,
      style: {
        display: "block",
        height: "100%",
        opacity:
        props.showWarning || props.modalWaiting
        ? 0
        : props.showLoader
        ? 0.35
        : 1,
        pointerEvents: "none",
        touchAction: "pan-y pinch-zoom",
        width: "100%",
      },
  });
}

function GraphWarning(props) {
  if (!props.showWarning) return null;

  return React.createElement(
    "div",
    {
      className: primitiveInlineRowClassName(),
      style: {
        alignItems: "center",
        color: "var(--tbf-status-warning-color, var(--tbf-focus, currentColor))",
        inset: 0,
        justifyContent: "center",
        pointerEvents: "none",
        position: "absolute",
      },
    },
    React.createElement(
      "div",
      { className: "center" },
      icon({
          spec: props.stateIcon,
          style: {
            fontSize: "56px",
            lineHeight: 1,
          },
      }),
    ),
  );
}

function GraphLoader(props) {
  if (!props.showLoader) return null;

  return React.createElement(
    "div",
    {
      className: primitiveInlineRowClassName(),
      style: {
        alignItems: "center",
        inset: 0,
        justifyContent: "center",
        pointerEvents: "none",
        position: "absolute",
      },
    },
    React.createElement("div", {
        className: "center",
        dangerouslySetInnerHTML: { __html: props.loaderHtml },
    }),
  );
}

function GraphFrame(props) {
  return React.createElement(
    "div",
    {
      ref: props.frameRef,
      "data-graph-frame": props.graphId || "",
      className: graphFrameClassName(),
      style: {
        height: "220px",
        position: "relative",
        touchAction: "pan-y pinch-zoom",
      },
    },
    React.createElement(GraphCanvas, props),
    React.createElement(GraphWarning, props),
    React.createElement(GraphLoader, props),
  );
}

function GraphLegendView(props) {
  const legendItems = Array.isArray(props.legendItems) ? props.legendItems : [];
  if (!legendItems.length) return null;

  return React.createElement(
    "div",
    { className: primitiveGridClassName({ gap: "sm" }) },
    legendItems.map((item, index) =>
      React.createElement(
        "span",
        {
          key: `${String((item && item.label) || "legend")}_${index}`,
          className: primitiveInlineRowClassName({
            className: primitiveTextClassName({ muted: true, size: "sm" }),
            fit: true,
            gap: "xs",
          }),
        },
        React.createElement("span", {
            "aria-hidden": "true",
            style: {
              backgroundColor: resolveCanvasColor(item && item.color, "#60a5fa"),
              borderRadius: "999px",
              display: "inline-block",
              height: "10px",
              width: "10px",
            },
        }),
        React.createElement(
          "span",
          null,
          item && item.label ? String(item.label) : "",
        ),
      ),
    ),
  );
}

function GraphCardFrame(props) {
  return React.createElement(
    "div",
    {
      className: primitiveStackClassName({
        className: GRAPH_CARD_ROOT_CLASS,
        gap: "xs",
      }),
      ref: props.rootRef,
      "data-graph-root": props.graphId || "",
      "data-graph-type": props.graphType || "",
      "data-graph-unit-kind": props.unitMeasurement || "",
      "data-graph-unit-scale": props.selectedScale,
    },
    React.createElement(GraphHeader, props),
    React.createElement(GraphFrame, props),
    React.createElement(GraphLegendView, props),
  );
}

function GraphFallbackBody(props) {
  const localT = createLocalTranslator(import.meta.url, documentLang());
  return React.createElement(
    "div",
    {
      className: graphFrameClassName(),
      style: {
        height: "220px",
        position: "relative",
      },
    },
    React.createElement(
      "div",
      {
        className: primitiveInlineRowClassName(),
        style: {
          alignItems: "center",
          inset: 0,
          justifyContent: "center",
          position: "absolute",
        },
      },
      React.createElement(
        "div",
        { className: "center" },
        React.createElement(
          "span",
          { className: primitiveTextClassName({ muted: true, size: "sm" }) },
          props.message || localT("feedback.graphUnavailable"),
        ),
      ),
    ),
  );
}

function GraphFrameFallback(props) {
  return React.createElement(
    "div",
    {
      className: primitiveStackClassName({
        className: GRAPH_CARD_ROOT_CLASS,
        gap: "xs",
      }),
    },
    React.createElement(GraphHeader, props),
    React.createElement(GraphFallbackBody, props),
  );
}

class GraphErrorBoundary extends React.Component<any, { hasError: boolean }> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    try {
      resolveFrontendLogger().error("graph", "graph render failed", {
          error: error && error.message ? error.message : String(error),
          graph_id:
          this.props && this.props.graphProps ? this.props.graphProps.id : "",
      });
    } catch {}
  }

  render() {
    if (this.state && this.state.hasError) {
      const localT = createLocalTranslator(import.meta.url, documentLang());
      return React.createElement(GraphFrameFallback, {
          title:
          this.props && this.props.graphProps
          ? this.props.graphProps.title
          : "",
          subtitle:
          this.props && this.props.graphProps
          ? this.props.graphProps.subtitle
          : "",
          message: localT("feedback.graphUnavailable"),
      });
    }

    return this.props.children;
  }
}

export { GraphCardFrame, GraphErrorBoundary, GraphFrameFallback };
