import { createLocalTranslator } from "#4fte8m1x62rd";
import { time } from "#4fte8m1x62rd";
import type {
  ContributionTranslator,
  contribution_day,
  contribution_summary,
} from "./types.js";

const CELL_SIZE = 11;
const CELL_SPACE = 3;
const LEFT_PAD = 28;
const TOP_PAD = 20;
const ROW_COUNT = 7;
const MONTH_LABEL_KEYS = [
  "monthJanuaryShort",
  "monthFebruaryShort",
  "monthMarchShort",
  "monthAprilShort",
  "monthMayShort",
  "monthJuneShort",
  "monthJulyShort",
  "monthAugustShort",
  "monthSeptemberShort",
  "monthOctoberShort",
  "monthNovemberShort",
  "monthDecemberShort",
];

function parseCalendarDate(date: string) {
  const normalized = String(date || "")
  .trim()
  .split("/")
  .join("-");
  const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return new Date(Number.NaN);
  const [, year, month, day] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

function fallbackContributionWindowEnd() {
  return new Date();
}

function fallbackContributionWindowStart(endDate: Date) {
  const next = new Date(endDate);
  next.setUTCDate(next.getUTCDate() - 364);
  return next;
}

function alignContributionStartDate(date: Date) {
  return date.getUTCDay()
  ? new Date(date.getTime() - date.getUTCDay() * 86400000)
  : date;
}

function toCalendarDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

function addUtcDays(date: Date, dayCount: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + dayCount);
  return next;
}

function contributionCountText(
  t: ContributionTranslator,
  count: number,
  singularKey: string,
  pluralKey: string,
  vars: Record<string, unknown> = {},
) {
  return t(count === 1 ? singularKey : pluralKey, {
      count: String(count),
      ...vars,
  });
}

function formatDayLabel(
  date: string,
  count: number,
  t: ContributionTranslator,
) {
  const normalized = String(date || "")
  .split("/")
  .join("-");
  const absoluteDate = String(
    time(normalized, "abs_date", { fallback: normalized }) || normalized,
  );
  return contributionCountText(
    t,
    count,
    "contributionCommitOnDate",
    "contributionCommitsOnDate",
    { date: absoluteDate },
  );
}

function normalizeHeatMapValues(days: contribution_day[]) {
  return (Array.isArray(days) ? days : [])
  .map((day) => ({
        count: Number(day && day.count) || 0,
        date: String((day && day.date) || "").replace(/-/g, "/"),
  }))
  .filter((day) => {
      if (!day.date || day.count <= 0) return false;
      return !Number.isNaN(parseCalendarDate(day.date).getTime());
  });
}

function heatmap_height() {
  return TOP_PAD + CELL_SIZE * ROW_COUNT + CELL_SPACE * (ROW_COUNT - 1);
}

function heatmap_width(columnCount: number) {
  return (
    LEFT_PAD +
      columnCount * CELL_SIZE +
      Math.max(0, columnCount - 1) * CELL_SPACE
  );
}

function heatmap_fill_color(count: number, maxCount: number) {
  if (count <= 0 || maxCount <= 0) return "var(--tbf-graph-heatmap-empty, var(--background-surface-2, transparent))";
  const ratio = count / maxCount;
  if (ratio >= 0.85) return "var(--tbf-graph-heatmap-level-4, var(--tbf-focus, currentColor))";
  if (ratio >= 0.55) return "var(--tbf-graph-heatmap-level-3, var(--tbf-focus, currentColor))";
  if (ratio >= 0.25) return "var(--tbf-graph-heatmap-level-2, var(--tbf-focus, currentColor))";
  return "var(--tbf-graph-heatmap-level-1, var(--tbf-focus, currentColor))";
}

function buildMonthLabels(
  alignedStartDate: Date,
  startDate: Date,
  endDate: Date,
  columnCount: number,
  t: ContributionTranslator,
) {
  const labels: Array<{ key: string; label: string; x: number }> = [];
  let previousMonth = -1;
  for (let column = 0; column < columnCount; column += 1) {
    let firstVisibleDate: Date | null = null;
    for (let row = 0; row < ROW_COUNT; row += 1) {
      const currentDate = addUtcDays(
        alignedStartDate,
        column * ROW_COUNT + row,
      );
      if (
        currentDate.getTime() < startDate.getTime() ||
          currentDate.getTime() > endDate.getTime()
      )
      continue;
      firstVisibleDate = currentDate;
      break;
    }
    if (!firstVisibleDate) continue;
    const month = firstVisibleDate.getUTCMonth();
    if (month === previousMonth && firstVisibleDate.getUTCDate() > 7) continue;
    previousMonth = month;
    labels.push({
        key: `${firstVisibleDate.getUTCFullYear()}-${month}-${column}`,
        label: MONTH_LABEL_KEYS[month] ? t(MONTH_LABEL_KEYS[month]) : "",
        x: LEFT_PAD + column * (CELL_SIZE + CELL_SPACE),
    });
  }
  return labels;
}

function week_label_y(rowIndex: number) {
  return TOP_PAD + rowIndex * (CELL_SIZE + CELL_SPACE) + CELL_SIZE - 2;
}

function buildContributionGraphModel(
  data: contribution_summary,
  t: ContributionTranslator = createLocalTranslator(import.meta.url, undefined),
) {
  const parsedEndDate = parseCalendarDate(data.end_date);
  const endDate = Number.isNaN(parsedEndDate.getTime())
  ? fallbackContributionWindowEnd()
  : parsedEndDate;
  const parsedStartDate = parseCalendarDate(data.start_date);
  const startDate = Number.isNaN(parsedStartDate.getTime())
  ? fallbackContributionWindowStart(endDate)
  : parsedStartDate;
  const normalizedDays = normalizeHeatMapValues(data.days);
  const hasContributionTotals = Number(data.total_commits) > 0;
  const hasContributionData =
  normalizedDays.length > 0 && hasContributionTotals;
  const hasInvalidContributionPayload =
  hasContributionTotals && normalizedDays.length === 0;
  const alignedStartDate = alignContributionStartDate(startDate);
  const dayCount = Math.max(
    1,
    Math.floor((endDate.getTime() - alignedStartDate.getTime()) / 86400000) + 1,
  );
  const columnCount = Math.max(1, Math.ceil(dayCount / ROW_COUNT));
  const countByDate = new Map<string, number>();
  normalizedDays.forEach((day) => countByDate.set(day.date, day.count));
  const maxCount = normalizedDays.reduce(
    (highest, day) => Math.max(highest, day.count),
    0,
  );
  const monthLabels = buildMonthLabels(
    alignedStartDate,
    startDate,
    endDate,
    columnCount,
    t,
  );
  return {
    alignedStartDate,
    columnCount,
    countByDate,
    endDate,
    hasContributionData,
    hasInvalidContributionPayload,
    heatMapHeight: heatmap_height(),
    heatmapWidth: heatmap_width(columnCount),
    maxCount,
    monthLabels,
    normalizedDays,
    parsedEndDate,
    parsedStartDate,
  };
}

export {
  CELL_SIZE,
  CELL_SPACE,
  LEFT_PAD,
  ROW_COUNT,
  TOP_PAD,
  addUtcDays,
  buildContributionGraphModel,
  contributionCountText,
  formatDayLabel,
  heatmap_fill_color,
  toCalendarDate,
  week_label_y,
};
