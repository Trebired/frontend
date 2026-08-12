import { queryAll, readElementJson, type BindRoot } from "#er0dlx1gtbzh";
import {
  formatDuration,
  formatWrappedCount,
  parseDateMsOrNull,
  parseCountValue,
} from "./components/index.js";

type TimeCounterConfig = {
  count?: number | string | null;
  end?: string;
  live?: boolean;
  mode?: "count" | "remaining";
  reloadOnZero?: boolean;
  start?: string;
};

const TIME_COUNTER_SELECTOR = "[data-tbf-time-counter]";
const TIME_COUNTER_CONFIG_SELECTOR =
'script[type="application/json"][data-tbf-time-counter-config]';
const configs = new WeakMap<HTMLElement, TimeCounterConfig>();
const positiveRemainingCounters = new WeakSet<HTMLElement>();
const activeCounters = new Set<HTMLElement>();
let intervalStarted = false;
let reloadTriggered = false;

function timeCounterTarget(host: HTMLElement) {
  const child = Array.from(host.children).find((entry) => {
      return entry instanceof HTMLElement && entry.tagName.toLowerCase() !== "script";
  });
  return child instanceof HTMLElement ? child : host;
}

function renderCount(el: HTMLElement, config: TimeCounterConfig) {
  el.textContent = formatWrappedCount(parseCountValue(config.count));
}

function renderForward(el: HTMLElement, config: TimeCounterConfig) {
  const from = parseDateMsOrNull(config.start);
  const to = parseDateMsOrNull(config.end);
  el.textContent = from == null || to == null ? "-" : formatDuration(to - from);
}

function renderRemaining(el: HTMLElement, config: TimeCounterConfig) {
  const to = parseDateMsOrNull(config.end);
  if (to == null) {
    el.textContent = "-";
    return;
  }
  const remainingMs = to - Date.now();
  el.textContent = formatDuration(remainingMs);
  if (remainingMs > 0) {
    positiveRemainingCounters.add(el);
    return;
  }
  if (
    positiveRemainingCounters.has(el) &&
      config.reloadOnZero === true &&
      !reloadTriggered
  ) {
    reloadTriggered = true;
    window.location.reload();
  }
}

function tickLive(el: HTMLElement, config: TimeCounterConfig) {
  if (config.mode === "remaining") {
    renderRemaining(el, config);
    return;
  }
  const from = parseDateMsOrNull(config.start);
  el.textContent = from == null ? "-" : formatDuration(Date.now() - from);
}

function refreshTimeCounter(el: HTMLElement | null) {
  if (!(el instanceof HTMLElement)) return false;
  const config = configs.get(el) || {};
  if (config.mode === "count") renderCount(el, config);
  else if (config.mode === "remaining") renderRemaining(el, config);
  else if (config.live === true) tickLive(el, config);
  else renderForward(el, config);
  return true;
}

function tickActiveCounters() {
  activeCounters.forEach((el) => {
      if (!el.isConnected) {
        activeCounters.delete(el);
        return;
      }
      refreshTimeCounter(el);
  });
}

function ensureInterval() {
  if (intervalStarted) return;
  intervalStarted = true;
  window.setInterval(tickActiveCounters, 1000);
}

function setTimeCounterConfig(
  el: HTMLElement | null,
  config: TimeCounterConfig | null,
) {
  if (!(el instanceof HTMLElement)) return false;
  const next = config && typeof config === "object" ? { ...config } : {};
  configs.set(el, next);
  if (next.live === true || next.mode === "remaining") {
    activeCounters.add(el);
    ensureInterval();
  } else {
    activeCounters.delete(el);
  }
  refreshTimeCounter(el);
  return true;
}

function bindTimeCounter(host: HTMLElement | null) {
  if (!(host instanceof HTMLElement)) return false;
  const target = timeCounterTarget(host);
  if (!(target instanceof HTMLElement)) return false;
  return setTimeCounterConfig(
    target,
    readElementJson<TimeCounterConfig>(host, TIME_COUNTER_CONFIG_SELECTOR, {}),
  );
}

function bindTimeCounters(root: BindRoot = document) {
  queryAll<HTMLElement>(root, TIME_COUNTER_SELECTOR).forEach((host) => {
      bindTimeCounter(host);
  });
}

function bindPrimitiveControllers(root: BindRoot = document) {
  bindTimeCounters(root);
}

function refreshTimeCounters(root: BindRoot = document) {
  if (root instanceof HTMLElement && configs.has(root)) {
    refreshTimeCounter(root);
    return;
  }
  bindTimeCounters(root);
}

export {
  TIME_COUNTER_CONFIG_SELECTOR,
  TIME_COUNTER_SELECTOR,
  bindPrimitiveControllers,
  bindTimeCounter,
  bindTimeCounters,
  refreshTimeCounter,
  refreshTimeCounters,
  setTimeCounterConfig,
};
export type { TimeCounterConfig };
export *from "./components/index.js";
