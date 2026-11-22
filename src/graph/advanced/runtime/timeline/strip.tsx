import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { createLocalTranslator } from "#4fte8m1x62rd";
import { primitiveButtonClassName } from "#hzrmwbvgt2ax";
import { tooltipAttrs } from "#8sfk4kby98q6";
import { frontendElementClass } from "#5vbaqj4pirp3";
import { formatGraphUnitValue } from "#jrf3w40thmym";
import { DatePicker } from "#35l6ph5odh0z";
import {
  clockLabel,
  crossesDays,
  localDayKey,
  rangeLabel,
  spanFraction,
  stripAreaPath,
  type TimelinePeak,
  type TimelineSeries,
  type TimelineSpan,
  type WindowStat,
} from "./model.js";

type StripProps = {
  bounds: { high: number; low: number };
  days: Set<string>;
  lang?: string;
  live: boolean;
  onDay: (day: string) => void;
  onLatest: () => void;
  onMove: (end: number) => void;
  onRange: (ms: number) => void;
  peaks: TimelinePeak[];
  precision?: number | null;
  ranges: number[];
  series: TimelineSeries[];
  span: TimelineSpan;
  unitMeasurement?: string;
  unitScale?: string;
  windowEnd: number;
  windowMs: number;
  windowStats: WindowStat[];
};

function fractionFromPointer(event: PointerEvent<HTMLDivElement>, element: HTMLDivElement) {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 ? Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)) : 0;
}

function peakText(peak: TimelinePeak, props: StripProps) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  const value = formatGraphUnitValue(peak.value, props.unitMeasurement || "", props.unitScale || "", props.precision ?? 1);
  const time = clockLabel(peak.time, props.lang, props.span.end - props.span.start, crossesDays(props.span.start, props.span.end));
  return peak.label
  ? localT("timeline.namedPeak", { name: peak.label, time, value })
  : localT("timeline.peak", { time, value });
}

function usePointerPan(props: StripProps, trackRef: { current: HTMLDivElement | null }) {
  const dragOffset = useRef<number | null>(null);
  const spanMs = props.span.end - props.span.start;
  const windowFraction = props.windowMs / spanMs;
  const startFraction = spanFraction(props.windowEnd - props.windowMs, props.span);

  function moveTo(fraction: number) {
    const offset = dragOffset.current ?? windowFraction / 2;
    props.onMove(props.span.start + (fraction - offset) * spanMs + props.windowMs);
  }

  return {
    onPointerDown(event: PointerEvent<HTMLDivElement>) {
      const track = trackRef.current;
      if (!track || event.button !== 0) return;
      const fraction = fractionFromPointer(event, track);
      const inside = fraction >= startFraction && fraction <= startFraction + windowFraction;
      dragOffset.current = inside ? fraction - startFraction : windowFraction / 2;
      track.setPointerCapture?.(event.pointerId);
      moveTo(fraction);
    },
    onPointerMove(event: PointerEvent<HTMLDivElement>) {
      const track = trackRef.current;
      if (!track || dragOffset.current == null) return;
      moveTo(fractionFromPointer(event, track));
    },
    onPointerUp(event: PointerEvent<HTMLDivElement>) {
      dragOffset.current = null;
      trackRef.current?.releasePointerCapture?.(event.pointerId);
    },
  };
}

function keyboardStep(event: KeyboardEvent<HTMLDivElement>, props: StripProps) {
  const quarter = props.windowMs / 4;
  const steps: Record<string, number> = {
    ArrowLeft: -quarter,
    ArrowRight: quarter,
    PageDown: props.windowMs,
    PageUp: -props.windowMs,
  };
  if (event.key === "Home") return props.span.start;
  if (event.key === "End") return props.span.end;
  return event.key in steps ? props.windowEnd + steps[event.key] : null;
}

function StripPaths(props: StripProps) {
  return (
    <svg
    aria-hidden="true"
    className={frontendElementClass("graph", "timeline-art")}
    preserveAspectRatio="none"
    viewBox="0 0 1000 100"
    >
    {props.series.map((entry, index) => (
          <path
          d={stripAreaPath(entry, props.span, props.bounds)}
          key={`${entry.label}_${index}`}
          style={{ fill: entry.fill || "currentColor", stroke: entry.stroke || "currentColor" }}
          vectorEffect="non-scaling-stroke"
          />
    ))}
    </svg>
  );
}

function StripPeaks(props: StripProps & { onPeak: (time: number) => void }) {
  return (
    <>
    {props.peaks.map((peak, index) => {
          const text = peakText(peak, props);
          return (
            <button
            aria-label={text}
            className={frontendElementClass("graph", "timeline-peak")}
            key={`${peak.time}_${index}`}
            onClick={() => props.onPeak(peak.time)}
            onPointerDown={(event) => event.stopPropagation()}
            style={{ color: peak.stroke || undefined, left: `${spanFraction(peak.time, props.span) * 100}%` }}
            type="button"
            {...tooltipAttrs(text)}
            />
          );
    })}
    </>
  );
}

function StripLabels(props: StripProps) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  const spanMs = props.span.end - props.span.start;
  const days = crossesDays(props.span.start, props.span.end);
  const following = props.windowEnd >= props.span.end;
  return (
    <div className={frontendElementClass("graph", "timeline-labels")}>
    <span>{clockLabel(props.span.start, props.lang, spanMs, days)}</span>
    {following ? (
        <span>{props.live ? localT("timeline.now") : clockLabel(props.span.end, props.lang, spanMs, days)}</span>
      ) : (
        <button className={primitiveButtonClassName({ size: "sm", variant: "primary" })} onClick={props.onLatest} type="button">
        {localT(props.live ? "timeline.latest" : "timeline.end")}
        </button>
    )}
    </div>
  );
}

function StripToolbar(props: StripProps) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  if (props.ranges.length < 2 && props.days.size < 2) return null;
  return (
    <div className={frontendElementClass("graph", "timeline-toolbar")}>
    <div aria-label={localT("timeline.windowLength")} className={frontendElementClass("graph", "timeline-ranges")} role="group">
    {props.ranges.length > 1
      ? props.ranges.map((ms) => (
          <button
          aria-pressed={ms === props.windowMs}
          className={primitiveButtonClassName({ active: ms === props.windowMs, size: "sm", variant: "secondary" })}
          key={ms}
          onClick={() => props.onRange(ms)}
          type="button"
          >
          {rangeLabel(ms, props.lang)}
          </button>
      ))
      : null}
    </div>
    {props.days.size > 1 ? (
        <DatePicker
        isDateDisabled={(day) => !props.days.has(day)}
        label={localT("timeline.day")}
        lang={props.lang}
        max={localDayKey(props.span.end)}
        min={localDayKey(props.span.start)}
        onChange={props.onDay}
        size="sm"
        value={localDayKey(props.windowEnd - 1)}
        />
      ) : null}
    </div>
  );
}

function StripStats(props: StripProps) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  const format = (value: number) => formatGraphUnitValue(value, props.unitMeasurement || "", props.unitScale || "", props.precision ?? 1);
  const named = props.series.length > 1;
  return (
    <>
    {props.series.map((entry, index) => {
          const stat = props.windowStats.find((item) => item.label === entry.label && item.stroke === entry.stroke);
          return (
            <div className={frontendElementClass("graph", "timeline-stat")} key={`${entry.label}_${index}`}>
            {named ? <span style={{ color: entry.stroke || undefined }}>{entry.label}</span> : null}
            {stat ? (
                <>
                <span>{localT("timeline.average", { value: format(stat.average) })}</span>
                <span>{localT("timeline.windowPeak", { value: format(stat.peak) })}</span>
                </>
              ) : (
                <span>{localT("timeline.noSamples")}</span>
            )}
            </div>
          );
    })}
    </>
  );
}

function TimelineStrip(props: StripProps) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pan = usePointerPan(props, trackRef);
  const spanMs = props.span.end - props.span.start;
  const days = crossesDays(props.span.start, props.span.end);
  const startFraction = spanFraction(props.windowEnd - props.windowMs, props.span);
  const range = localT("timeline.range", {
      end: clockLabel(props.windowEnd, props.lang, spanMs, days),
      start: clockLabel(props.windowEnd - props.windowMs, props.lang, spanMs, days),
  });
  return (
    <div className={frontendElementClass("graph", "timeline")}>
    <StripToolbar {...props} />
    <div
    aria-label={localT("timeline.label")}
    aria-valuemax={props.span.end}
    aria-valuemin={props.span.start + props.windowMs}
    aria-valuenow={props.windowEnd}
    aria-valuetext={range}
    className={frontendElementClass("graph", "timeline-track")}
    onKeyDown={(event) => {
        const next = keyboardStep(event, props);
        if (next == null) return;
        event.preventDefault();
        props.onMove(next);
    }}
    ref={trackRef}
    role="slider"
    tabIndex={0}
    {...pan}
    >
    <StripPaths {...props} />
    <div
    aria-hidden="true"
    className={frontendElementClass("graph", "timeline-window")}
    style={{ left: `${startFraction * 100}%`, width: `${(props.windowMs / spanMs) * 100}%` }}
    />
    <StripPeaks {...props} onPeak={(time) => props.onMove(time + props.windowMs / 2)} />
    </div>
    <StripLabels {...props} />
    <StripStats {...props} />
    </div>
  );
}

export { TimelineStrip };
export type { StripProps };
