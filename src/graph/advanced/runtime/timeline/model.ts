const DEFAULT_WINDOW_MS = 5 * 60 * 1000;
const DEFAULT_PEAK_COUNT = 3;
const STRIP_BUCKETS = 240;
const PEAK_SEPARATION = 0.08;
const STRIP_GAP_BUCKETS = 12;
const WINDOW_SLOTS = 120;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const RANGE_STEPS_MS = [HOUR_MS, 6 * HOUR_MS, DAY_MS, 7 * DAY_MS, 30 * DAY_MS];

type TimelinePoint = { count?: number; label?: string; peak?: number; value?: number | null };
type TimelineDataset = { fill?: string; label?: string; points?: TimelinePoint[]; stroke?: string };

type TimelineOptions = {
  peaks?: number;
  windowMs?: number;
};

type TimelineSeries = {
  fill: string;
  label: string;
  stroke: string;
  points: SeriesPoint[];
};

type TimelinePeak = {
  label: string;
  stroke: string;
  time: number;
  value: number;
};

type TimelineSpan = { end: number; start: number };
type SeriesPoint = { count: number; peak: number; time: number; value: number };
type WindowStat = { average: number; label: string; peak: number; stroke: string };

function pointTime(point: TimelinePoint) {
  const parsed = Date.parse(String((point && point.label) || ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function pointPeak(point: TimelinePoint) {
  const peak = Number(point && point.peak);
  const value = Number(point && point.value);
  return point && point.peak != null && Number.isFinite(peak) ? Math.max(peak, value) : value;
}

function readTimelineOptions(value: unknown): TimelineOptions | null {
  if (value === true) return {};
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  return {
    peaks: Number.isInteger(source.peaks) ? Number(source.peaks) : undefined,
    windowMs: Number(source.windowMs) > 0 ? Number(source.windowMs) : undefined,
  };
}

function timelineWindowMs(options: TimelineOptions | null) {
  return (options && options.windowMs) || DEFAULT_WINDOW_MS;
}

function readSeries(datasets: unknown): TimelineSeries[] {
  return (Array.isArray(datasets) ? datasets : []).map((dataset: TimelineDataset) => ({
        fill: String((dataset && dataset.fill) || ""),
        label: String((dataset && dataset.label) || ""),
        stroke: String((dataset && dataset.stroke) || ""),
        points: (Array.isArray(dataset && dataset.points) ? dataset.points : [])
        .map((point) => ({
              count: Number(point && point.count) > 0 ? Number(point.count) : 1,
              peak: pointPeak(point),
              time: pointTime(point),
              value: point && point.value != null ? Number(point.value) : NaN,
        }))
        .filter((point) => point.time != null && Number.isFinite(point.value))
        .sort((left, right) => (left.time as number) - (right.time as number)) as SeriesPoint[],
  })).filter((series) => series.points.length > 0);
}

function seriesSpan(series: TimelineSeries[]): TimelineSpan | null {
  let start = Infinity;
  let end = -Infinity;
  series.forEach((entry) => {
      start = Math.min(start, entry.points[0].time);
      end = Math.max(end, entry.points[entry.points.length - 1].time);
  });
  return Number.isFinite(start) && Number.isFinite(end) && end > start ? { end, start } : null;
}

function timelineNeeded(span: TimelineSpan | null, windowMs: number) {
  return Boolean(span && span.end - span.start > windowMs * 1.05);
}

function clampWindowEnd(end: number, span: TimelineSpan, windowMs: number) {
  const earliest = Math.min(span.end, span.start + windowMs);
  return Math.min(span.end, Math.max(earliest, end));
}

function pointsInWindow(points: unknown, start: number, end: number) {
  return (Array.isArray(points) ? points : []).filter((point: TimelinePoint) => {
      const time = pointTime(point);
      return time != null && time >= start && time <= end;
  });
}

function resampled(points: TimelinePoint[], start: number, end: number) {
  const width = (end - start) / WINDOW_SLOTS;
  const buckets = Array.from({ length: WINDOW_SLOTS }, () => ({ peak: -Infinity, total: 0, weight: 0 }));
  points.forEach((point) => {
      const value = Number(point.value);
      if (point.value == null || !Number.isFinite(value)) return;
      const index = Math.min(WINDOW_SLOTS - 1, Math.max(0, Math.floor(((pointTime(point) as number) - start) / width)));
      const weight = Number(point.count) > 0 ? Number(point.count) : 1;
      buckets[index].total += value * weight;
      buckets[index].weight += weight;
      buckets[index].peak = Math.max(buckets[index].peak, pointPeak(point));
  });
  return buckets.map((bucket, index) => ({
        label: new Date(start + (index + 0.5) * width).toISOString(),
        peak: bucket.weight ? bucket.peak : undefined,
        value: bucket.weight ? bucket.total / bucket.weight : null,
  }));
}

function windowedPoints(points: unknown, start: number, end: number) {
  if (!Array.isArray(points) || !points.length) return [];
  return resampled(pointsInWindow(points, start, end), start, end);
}

function windowStats(series: TimelineSeries[], start: number, end: number): WindowStat[] {
  return series.flatMap((entry) => {
      let total = 0;
      let weight = 0;
      let peak = -Infinity;
      entry.points.forEach((point) => {
          if (point.time < start || point.time > end) return;
          total += point.value * point.count;
          weight += point.count;
          peak = Math.max(peak, point.peak);
      });
      return weight ? [{ average: total / weight, label: entry.label, peak, stroke: entry.stroke }] : [];
  });
}

function timelineRanges(baseMs: number, span: TimelineSpan) {
  const spanMs = span.end - span.start;
  return [baseMs, ...RANGE_STEPS_MS.filter((ms) => ms > baseMs * 1.5 && ms < spanMs)];
}

function rangeParts(ms: number) {
  if (ms >= DAY_MS) return { unit: "day", value: ms / DAY_MS };
  if (ms >= HOUR_MS) return { unit: "hour", value: ms / HOUR_MS };
  return { unit: "minute", value: ms / 60000 };
}

function rangeLabel(ms: number, lang?: string) {
  const parts = rangeParts(ms);
  try {
    const options: Intl.NumberFormatOptions = { maximumFractionDigits: 1, style: "unit", unit: parts.unit, unitDisplay: "narrow" };
    return new Intl.NumberFormat(lang || undefined, options).format(parts.value);
  } catch {
    return `${parts.value} ${parts.unit}`;
  }
}

function localDayKey(time: number) {
  const date = new Date(time);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function seriesDays(series: TimelineSeries[]) {
  const days = new Set<string>();
  series.forEach((entry) => entry.points.forEach((point) => days.add(localDayKey(point.time))));
  return days;
}

function windowedDatasets(datasets: unknown, start: number, end: number) {
  return (Array.isArray(datasets) ? datasets : []).map((dataset: TimelineDataset) => ({
        ...dataset,
        points: windowedPoints(dataset && dataset.points, start, end),
  }));
}

function hasDatasetPoints(datasets: unknown) {
  return (Array.isArray(datasets) ? datasets : []).some((dataset: TimelineDataset) => {
      return Array.isArray(dataset && dataset.points) && dataset.points.length > 0;
  });
}

function timelineDatasets(props: any) {
  if (hasDatasetPoints(props && props.datasets)) return props.datasets;
  if (!Array.isArray(props && props.points) || !props.points.length) return [];
  return [{ fill: props.fill, label: props.title, points: props.points, stroke: props.stroke }];
}

function valueBounds(series: TimelineSeries[], min: unknown, max: unknown) {
  const values = series.flatMap((entry) => entry.points.map((point) => point.peak));
  const low = Number.isFinite(Number(min)) && min != null ? Number(min) : Math.min(0, ...values);
  const configured = Number(max);
  const high = Number.isFinite(configured) && max != null && configured > low ? configured : Math.max(low + 1, ...values);
  return { high, low };
}

function bucketPeaks(entry: TimelineSeries, span: TimelineSpan) {
  const width = (span.end - span.start) / STRIP_BUCKETS;
  const buckets: Array<number|null> = new Array(STRIP_BUCKETS).fill(null);
  entry.points.forEach((point) => {
      const index = Math.min(STRIP_BUCKETS - 1, Math.max(0, Math.floor((point.time - span.start) / width)));
      const current = buckets[index];
      buckets[index] = current == null ? point.peak : Math.max(current, point.peak);
  });
  return buckets;
}

function stripAreaPath(entry: TimelineSeries, span: TimelineSpan, bounds: { high: number; low: number }) {
  const buckets = bucketPeaks(entry, span);
  const range = bounds.high - bounds.low || 1;
  const segments: string[] = [];
  let open: Array<[number, number]> = [];
  const close = () => {
    if (!open.length) return;
    const first = open[0][0];
    const last = open[open.length - 1][0];
    segments.push(`M${first},100 ${open.map(([left, top]) => `L${left},${top}`).join(" ")} L${last},100 Z`);
    open = [];
  };
  let gap = 0;
  buckets.forEach((value, index) => {
      if (value == null) {
        gap += 1;
        if (gap > STRIP_GAP_BUCKETS) close();
        return;
      }
      gap = 0;
      const left = Number((((index + 0.5) / STRIP_BUCKETS) * 1000).toFixed(1));
      const top = Number((100 - ((value - bounds.low) / range) * 92).toFixed(1));
      open.push([left, Math.max(0, Math.min(100, top))]);
  });
  close();
  return segments.join(" ");
}

function median(values: number[]) {
  const sorted = values.slice().sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function seriesPeaks(entry: TimelineSeries, span: TimelineSpan, count: number) {
  const points = entry.points.map((point) => ({ time: point.time, value: point.peak }));
  const floor = median(points.map((point) => point.value));
  const range = Math.max(...points.map((point) => point.value)) - Math.min(...points.map((point) => point.value));
  if (!(range > 0)) return [];
  const candidates = points.filter((point, index) => {
      const previous = points[index - 1];
      const next = points[index + 1];
      return (!previous || point.value >= previous.value) && (!next || point.value >= next.value) && point.value > floor + range * 0.15;
  }).sort((left, right) => right.value - left.value);
  const separation = (span.end - span.start) * PEAK_SEPARATION;
  const picked: Array<{time:number;value:number}> = [];
  for (const candidate of candidates) {
    if (picked.length >= count) break;
    if (picked.some((peak) => Math.abs(peak.time - candidate.time) < separation)) continue;
    picked.push(candidate);
  }
  return picked.map((peak) => ({ ...peak, label: entry.label, stroke: entry.stroke }));
}

function timelinePeaks(series: TimelineSeries[], span: TimelineSpan, options: TimelineOptions | null) {
  const count = options && options.peaks != null ? Math.max(0, options.peaks) : DEFAULT_PEAK_COUNT;
  if (!count) return [];
  return series.flatMap((entry) => seriesPeaks(entry, span, count)) as TimelinePeak[];
}

function spanFraction(time: number, span: TimelineSpan) {
  return Math.min(1, Math.max(0, (time - span.start) / (span.end - span.start)));
}

const DATE_ONLY_SPAN_MS = 3 * 24 * 60 * 60 * 1000;

function clockFormatter(lang: string | undefined, spanMs: number, crossesDays: boolean) {
  const options: Intl.DateTimeFormatOptions = spanMs >= DATE_ONLY_SPAN_MS
  ? {}
  : { hour: "2-digit", hourCycle: "h23", minute: "2-digit" };
  if (spanMs < 10 * 60 * 1000) options.second = "2-digit";
  if (crossesDays || spanMs >= DATE_ONLY_SPAN_MS) {
    options.day = "numeric";
    options.month = "numeric";
  }
  try {
    return new Intl.DateTimeFormat(lang || undefined, options);
  } catch {
    return new Intl.DateTimeFormat(undefined, options);
  }
}

function clockLabel(time: number, lang: string | undefined, spanMs: number, crossesDays = false) {
  return clockFormatter(lang, spanMs, crossesDays).format(new Date(time));
}

function crossesDays(start: number, end: number) {
  return new Date(start).toDateString() !== new Date(end).toDateString();
}

function clockBottomDetails(start: number, end: number, lang?: string) {
  const days = crossesDays(start, end);
  const span = end - start;
  return [start, start + span / 2, end].map((time) => clockLabel(time, lang, span, days));
}

export {
  clampWindowEnd,
  clockBottomDetails,
  clockLabel,
  crossesDays,
  DAY_MS,
  localDayKey,
  rangeLabel,
  readSeries,
  readTimelineOptions,
  seriesDays,
  seriesSpan,
  spanFraction,
  stripAreaPath,
  timelineNeeded,
  timelineDatasets,
  timelinePeaks,
  timelineRanges,
  timelineWindowMs,
  valueBounds,
  windowedDatasets,
  windowedPoints,
  windowStats,
};
export type { TimelineOptions, TimelinePeak, TimelineSeries, TimelineSpan, WindowStat };
