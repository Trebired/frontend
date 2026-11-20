import { jsonScript } from "#ndsvdqv80epr";
import type { TimeCounterProps } from "./types.js";
import { joinClassNames, toText } from "./shared.js";
import { primitiveTextClassName } from "./classes.js";
import { number } from "./number.js";
import { frontendClassName, frontendDataAttrs } from "#5vbaqj4pirp3";

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

function parseDateMsOrNull(value: unknown) {
  const text = toText(value);
  if (!text) return null;
  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? parsed : null;
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

function counterClassName(props: TimeCounterProps) {
  const unstyled = props.unstyled === true || props.bare === true;
  return joinClassNames(
    "time-counter",
    unstyled ? "" : frontendClassName("font-mono"),
    unstyled ? "" : primitiveTextClassName({ size: "sm" }),
    props.className,
  );
}

function counterConfig(
  props: TimeCounterProps,
  config: { endRaw: string; live: boolean; remaining: boolean; startRaw: string },
) {
  return {
    end: (!config.live && config.endRaw) || (config.remaining && config.endRaw) ? config.endRaw : "",
    live: config.live,
    mode: config.remaining ? "remaining" : undefined,
    reloadOnZero: props.reloadOnZero === true,
    start: config.startRaw,
  };
}

function time_counter(props: TimeCounterProps) {
  if (props.mode === "count") return number({ className: props.className, id: props.id, value: props.count });
  const startRaw = toText(props.start);
  const endRaw = toText(props.end);
  const state = durationCounterState(props, startRaw, endRaw);
  if (!state.shouldRenderCounter && props.alwaysRender !== true) return null;
  return (
    <span {...frontendDataAttrs({ "time-counter": "" })} style={{ display: "contents" }}>
    <script
    {...frontendDataAttrs({ "time-counter-config": "" })}
    hidden
    type="application/json"
    dangerouslySetInnerHTML={{
        __html: jsonScript(counterConfig(props, { endRaw, live: state.live, remaining: state.remaining, startRaw })),
    }}
    />
    <span
    {...(props.id ? { id: props.id } : {})}
    className={counterClassName(props)}
    >
    {state.initialText}
    </span>
    </span>
  );
}

export { formatDuration, parseDateMsOrNull, time_counter };
