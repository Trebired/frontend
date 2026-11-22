import { useMemo, useState } from "react";
import { documentLanguageTag } from "#er0dlx1gtbzh";
import {
  clampWindowEnd,
  DAY_MS,
  readSeries,
  readTimelineOptions,
  seriesDays,
  seriesSpan,
  timelineNeeded,
  timelineDatasets,
  timelinePeaks,
  timelineRanges,
  timelineWindowMs,
  valueBounds,
  windowedDatasets,
  windowedPoints,
  windowStats,
} from "./model.js";
import { windowBottomDetails } from "#p7zqua4ddkcp";

function useTimelineSource(props: any) {
  const options = useMemo(() => readTimelineOptions(props.timeline), [props.timeline]);
  const series = useMemo(() => (options ? readSeries(timelineDatasets(props)) : []), [options, props.datasets, props.points]);
  const span = useMemo(() => seriesSpan(series), [series]);
  const windowMs = timelineWindowMs(options);
  const active = Boolean(options) && timelineNeeded(span, windowMs);
  const peaks = useMemo(() => (active && span ? timelinePeaks(series, span, options) : []), [active, series, span, options]);
  return { active, options, peaks, series, span, windowMs };
}

function useTimelineView(source: ReturnType<typeof useTimelineSource>) {
  const [pinnedEnd, setPinnedEnd] = useState<number|null>(null);
  const [rangeMs, setRangeMs] = useState<number|null>(null);
  const span = source.span;
  const windowMs = rangeMs || source.windowMs;
  const end = source.active && span
  ? clampWindowEnd(pinnedEnd == null ? span.end : pinnedEnd, span, windowMs)
  : 0;
  const moveTo = (next: number) => setPinnedEnd(span && next >= span.end ? null : next);
  return {
    end,
    following: Boolean(span) && end >= (span ? span.end : 0),
    onDay(day: string) {
      const start = new Date(`${day}T00:00:00`).getTime();
      if (!Number.isFinite(start)) return;
      setRangeMs(DAY_MS === source.windowMs ? null : DAY_MS);
      moveTo(start + DAY_MS);
    },
    onLatest: () => setPinnedEnd(null),
    onMove: moveTo,
    onRange(ms: number) {
      const middle = end - windowMs / 2;
      setRangeMs(ms === source.windowMs ? null : ms);
      if (pinnedEnd != null) moveTo(middle + ms / 2);
    },
    windowMs,
  };
}

function useGraphTimeline(props: any) {
  const source = useTimelineSource(props);
  const view = useTimelineView(source);
  const live = props.live !== false;
  const span = source.span;
  const days = useMemo(() => (source.active ? seriesDays(source.series) : new Set<string>()), [source.active, source.series]);
  const chartProps = useMemo(() => {
      if (!source.active) return props;
      return {
        ...props,
        bottomDetails: windowBottomDetails(view.end - view.windowMs, view.end, props.lang, live && view.following),
        datasets: windowedDatasets(props.datasets, view.end - view.windowMs, view.end),
        live: live && view.following,
        points: windowedPoints(props.points, view.end - view.windowMs, view.end),
      };
    }, [props, source.active, view.end, view.windowMs, live, view.following]);

  if (!source.active || !span) return { chartProps, strip: null };
  return {
    chartProps,
    strip: {
      bounds: valueBounds(source.series, props.min, props.max),
      days,
      lang: props.lang || documentLanguageTag(),
      live,
      onDay: view.onDay,
      onLatest: view.onLatest,
      onMove: view.onMove,
      onRange: view.onRange,
      peaks: source.peaks,
      precision: props.precision,
      ranges: timelineRanges(source.windowMs, span),
      series: source.series,
      span,
      windowEnd: view.end,
      windowMs: view.windowMs,
      windowStats: windowStats(source.series, view.end - view.windowMs, view.end),
    },
  };
}

export { useGraphTimeline };
