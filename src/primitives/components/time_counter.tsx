import { jsonScript } from "#ndsvdqv80epr";
import type { TimeCounterProps } from "./types.js";
import { joinClassNames, toText } from "./shared.js";
import { primitiveTextClassName } from "./classes.js";

function normalizeDurationMs(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function formatDuration(ms: number) {
  const safeMs = normalizeDurationMs(ms);
  const totalSec = Math.floor(safeMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (days || hours) parts.push(`${hours}h`);
  if (days || hours || minutes) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
}

function parseCountValue(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, parsed);
}

function formatWrappedCount(value: unknown) {
  const parsed = parseCountValue(value);
  if (parsed == null) return "";
  return `(${parsed.toLocaleString("en-US")})`;
}

function parseDateMsOrNull(value: unknown) {
  const text = toText(value);
  if (!text) return null;
  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function countCounterState(props: TimeCounterProps) {
  const countValue = parseCountValue(props.count);
  return {
    countValue,
    initialText: formatWrappedCount(countValue),
    shouldRenderCounter: countValue != null,
  };
}

function durationCounterState(props: TimeCounterProps, startRaw: string, endRaw: string) {
  const remaining = props.remaining === true;
  const live = typeof props.live === "boolean" ? props.live : !endRaw;
  const startMs = startRaw ? parseDateMsOrNull(startRaw) : null;
  const endMs = endRaw ? parseDateMsOrNull(endRaw) : null;
  return {
    initialText:
      remaining && endMs != null
        ? formatDuration(endMs - Date.now())
        : startMs != null && live
        ? formatDuration(Date.now() - startMs)
        : startMs != null && endMs != null
        ? formatDuration(endMs - startMs)
        : "-",
    live,
    remaining,
    shouldRenderCounter: Boolean((remaining && endRaw) || startRaw),
  };
}

function counterClassName(props: TimeCounterProps, countMode: boolean) {
  const unstyled = props.unstyled === true || props.bare === true;
  return joinClassNames(
    "time-counter",
    unstyled || countMode ? "" : "font-mono",
    unstyled || countMode ? "" : primitiveTextClassName({ size: "sm" }),
    props.className,
  );
}

function counterConfig(
  props: TimeCounterProps,
  config: {
    countMode: boolean;
    countValue: number | null;
    endRaw: string;
    live: boolean;
    remaining: boolean;
    startRaw: string;
  },
) {
  return {
    count: config.countMode ? config.countValue : undefined,
    end:
      !config.countMode &&
      ((!config.live && config.endRaw) || (config.remaining && config.endRaw))
        ? config.endRaw
        : "",
    live: !config.countMode && config.live,
    mode: config.countMode ? "count" : config.remaining ? "remaining" : undefined,
    reloadOnZero: !config.countMode && props.reloadOnZero === true,
    start: !config.countMode ? config.startRaw : "",
  };
}

function time_counter(props: TimeCounterProps) {
  const countMode = props.mode === "count";
  const startRaw = toText(props.start);
  const endRaw = toText(props.end);
  const state = countMode
    ? countCounterState(props)
    : durationCounterState(props, startRaw, endRaw);
  if (!state.shouldRenderCounter && props.alwaysRender !== true) return null;
  const countValue = "countValue" in state ? state.countValue : null;
  const live = "live" in state ? state.live : false;
  const remaining = "remaining" in state ? state.remaining : false;
  return (
    <span data-tbf-time-counter="" style={{ display: "contents" }}>
      <script
        data-tbf-time-counter-config=""
        hidden
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: jsonScript(counterConfig(props, { countMode, countValue, endRaw, live, remaining, startRaw })),
        }}
      />
      <span
        {...(props.id ? { id: props.id } : {})}
        className={counterClassName(props, countMode)}
      >
        {state.initialText}
      </span>
    </span>
  );
}

export { formatDuration, formatWrappedCount, parseCountValue, time_counter };
