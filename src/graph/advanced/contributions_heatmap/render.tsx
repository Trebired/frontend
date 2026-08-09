import { createLocalTranslator } from "#4fte8m1x62rd";
import { Card } from "#4fte8m1x62rd";
import {
  Text,
  primitivePaddingClass,
} from "#hzrmwbvgt2ax";
import {
  CELL_SIZE,
  CELL_SPACE,
  LEFT_PAD,
  ROW_COUNT,
  TOP_PAD,
  addUtcDays,
  formatDayLabel,
  heatmap_fill_color,
  toCalendarDate,
  week_label_y,
} from "./model.js";
import type {
  ContributionTranslator,
  contributions_graph_props,
  heatmap_tooltip_state,
} from "./types.js";

function weekLabels(t: ContributionTranslator) {
  return (
    <>
    <text
    className="w-heatmap-week"
    style={{
        fill: "currentColor",
        fontSize: "inherit",
        textAnchor: "middle",
    }}
    x={15}
    y={week_label_y(1)}
    >
    {t("weekdayMondayShort")}
    </text>
    <text
    className="w-heatmap-week"
    style={{
        fill: "currentColor",
        fontSize: "inherit",
        textAnchor: "middle",
    }}
    x={15}
    y={week_label_y(3)}
    >
    {t("weekdayWednesdayShort")}
    </text>
    <text
    className="w-heatmap-week"
    style={{
        fill: "currentColor",
        fontSize: "inherit",
        textAnchor: "middle",
    }}
    x={15}
    y={week_label_y(5)}
    >
    {t("weekdayFridayShort")}
    </text>
    </>
  );
}

function monthLabelNodes(
  labels: Array<{ key: string; label: string; x: number }>,
) {
  return labels.map((label) => (
      <text
      key={label.key}
      className="w-heatmap-month"
      style={{ fill: "currentColor", fontSize: "inherit", textAnchor: "start" }}
      x={label.x}
      y={15}
      >
      {label.label}
      </text>
  ));
}

function heatmapCell(
  model: any,
  column: number,
  row: number,
  handlers: any,
  t: ContributionTranslator,
) {
  const currentDate = addUtcDays(
    model.alignedStartDate,
    column * ROW_COUNT + row,
  );
  if (currentDate.getTime() > model.endDate.getTime()) return null;
  const dateKey = toCalendarDate(currentDate);
  const count = model.countByDate.get(dateKey) ?? 0;
  const label = formatDayLabel(dateKey, count, t);
  return (
    <rect
    key={dateKey}
    aria-label={label}
    data-column={column}
    data-date={dateKey}
    data-row={row}
    fill={heatmap_fill_color(count, model.maxCount)}
    height={CELL_SIZE}
    onBlur={handlers.hideTooltip}
    onFocus={(event) =>
      handlers.showTooltipForRect(
        label,
        event.currentTarget.getBoundingClientRect(),
      )
    }
    onMouseEnter={(event) =>
      handlers.showTooltipAtClientPosition(
        label,
        event.clientX,
        event.clientY,
      )
    }
    onMouseLeave={handlers.hideTooltip}
    onMouseMove={(event) =>
      handlers.showTooltipAtClientPosition(
        label,
        event.clientX,
        event.clientY,
      )
    }
    rx={3}
    tabIndex={0}
    width={CELL_SIZE}
    x={column * (CELL_SIZE + CELL_SPACE)}
    y={row * (CELL_SIZE + CELL_SPACE)}
    />
  );
}

function heatmapGrid(model: any, handlers: any, t: ContributionTranslator) {
  return Array.from({ length: model.columnCount }).map((_, column) => (
      <g key={`column-${column}`} data-column={column}>
      {Array.from({ length: ROW_COUNT }).map((__, row) =>
          heatmapCell(model, column, row, handlers, t),
      )}
      </g>
  ));
}

function tooltipNode(tooltip: heatmap_tooltip_state | null) {
  if (!tooltip) return null;
  return (
    <div
    aria-hidden="true"
    className="tooltip"
    data-tbf-open="true"
    data-tbf-tooltip-placement="top"
    style={{
        left: tooltip.left,
        position: "fixed",
        top: tooltip.top,
        transform: "translate(-50%, -100%)",
        zIndex: 1100,
    }}
    >
    {tooltip.label}
    </div>
  );
}

function heatmapCard(
  model: any,
  tooltip: heatmap_tooltip_state | null,
  handlers: any,
  t: ContributionTranslator = createLocalTranslator(import.meta.url, undefined),
) {
  return (
    <Card
    style={{
        overflowX: "auto",
        overflowY: "hidden",
        ["--scroll-min-horizontal-gap" as string]: "0px",
    }}
    className="scroll-min padding-xs"
    >
    <svg
    className="w-heatmap"
    height={model.heatMapHeight}
    style={{
        color: "var(--text-color-muted)",
        display: "block",
        fontSize: 10,
        userSelect: "none",
    }}
    width={model.heatmapWidth}
    >
    {weekLabels(t)}
    {monthLabelNodes(model.monthLabels)}
    <g transform={`translate(${LEFT_PAD}, ${TOP_PAD})`}>
    {heatmapGrid(model, handlers, t)}
    </g>
    </svg>
    {tooltipNode(tooltip)}
    </Card>
  );
}

function emptyCard(props: contributions_graph_props, model: any) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  return (
    <Card className={primitivePaddingClass("sm")}>
    <Text as="p" muted size="sm">
    {model.hasInvalidContributionPayload
      ? localT("contributionPayloadInvalid")
      : props.emptyDescription || localT("noSyncedContributions")}
    </Text>
    </Card>
  );
}

export { emptyCard, heatmapCard };
