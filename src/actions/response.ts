import { flash as defaultFlash } from "#33o6e7mug9pg";
import type {
  ActionAdapters,
  ActionFlashMeta,
  ActionJson,
  ActionRequestUi,
} from "./types.js";

type ConfiguredSuccessAction = {
  lifecycle?: unknown;
  redirect_delay_ms?: unknown;
  success?: unknown;
  successTab?: unknown;
};

function t(adapters: ActionAdapters | undefined, key: string, fallback: string) {
  return adapters?.i18n ? adapters.i18n(key, fallback) : fallback;
}

function isNoop(json: ActionJson | null | undefined) {
  return Boolean(json && json.noop === true);
}

function actionResponseOk(json: ActionJson | null | undefined) {
  return Boolean(json && (json.ok === true || json.noop === true));
}

function defaultFeedbackMessage(kind: string, adapters?: ActionAdapters) {
  if (kind === "noop") return t(adapters, "feedback.noop", "Nothing changed.");
  if (kind === "success") return t(adapters, "feedback.success", "Saved.");
  return t(adapters, "feedback.requestFailed", "Request failed.");
}

function machineStatus(value: string, json: ActionJson | null | undefined) {
  const statusCode = String(json?.status_code || "").trim();
  if (!value) return false;
  if (statusCode && value === statusCode) return true;
  return /^status-\d+$/iu.test(value);
}

function computeFlashMeta(
  kind: "error" | "noop" | "success",
  json: ActionJson | null | undefined,
  adapters?: ActionAdapters,
): ActionFlashMeta {
  const rawMessage = String(json?.message || "").trim();
  const rawDescription = String(json?.details || "").trim();
  const message =
    rawMessage && !machineStatus(rawMessage, json)
      ? rawMessage
      : defaultFeedbackMessage(kind, adapters);
  const description =
    rawDescription && rawDescription !== message && !machineStatus(rawDescription, json)
      ? rawDescription
      : "";
  return { description, message, type: kind };
}

function shouldShowFlash(
  ui: ActionRequestUi | undefined,
  kind: "error" | "noop" | "success",
) {
  if (ui?.flashErrorOnly === true) return kind === "error";
  return ui?.silent !== true;
}

function showResponseFlash(
  kind: "error" | "noop" | "success",
  json: ActionJson | null | undefined,
  adapters?: ActionAdapters,
) {
  const meta = computeFlashMeta(kind, json, adapters);
  const flashApi = adapters?.flash || defaultFlash;
  if (!shouldShowFlash(undefined, kind)) return meta;
  if (kind === "error") flashApi.error?.(meta.message, meta.description);
  else if (kind === "noop") flashApi.info?.(meta.message, meta.description);
  else flashApi.success?.(meta.message, meta.description);
  return meta;
}

function pickResponseAction(json: ActionJson | null | undefined) {
  if (!json || typeof json !== "object") return null;
  const redirect = typeof json.redirect === "string" ? json.redirect.trim() : "";
  const reload = json.reload === true;
  const redirectDelay = Number((json as any).redirect_delay_ms);
  if (!redirect && !reload && !json.tab) return null;
  return {
    redirect,
    reload,
    tab: json.tab,
    ...(Number.isFinite(redirectDelay) ? { redirect_delay_ms: redirectDelay } : {}),
  };
}

function normalizeTabSwitches(tab: unknown) {
  const out: Array<{ family: string; route: string }> = [];
  function push(family: unknown, route: unknown) {
    const localFamily = typeof family === "string" ? family.trim() : "";
    const localRoute = typeof route === "string" ? route.trim() : "";
    if (localFamily && localRoute) out.push({ family: localFamily, route: localRoute });
  }
  if (typeof tab === "string") {
    tab.split("&").forEach((pair) => {
      const idx = pair.indexOf("=");
      if (idx > 0) push(pair.slice(0, idx), pair.slice(idx + 1));
    });
    return out;
  }
  if (Array.isArray(tab)) {
    tab.forEach((entry) => {
      if (!entry || typeof entry !== "object") return;
      const item = entry as Record<string, unknown>;
      push(item.family || item.key, item.route);
    });
    return out;
  }
  if (tab && typeof tab === "object") {
    const item = tab as Record<string, unknown>;
    if (
      (typeof item.family === "string" || typeof item.key === "string") &&
      typeof item.route === "string"
    ) {
      push(item.family || item.key, item.route);
      return out;
    }
    Object.keys(item).forEach((key) => push(key, item[key]));
  }
  return out;
}

function dispatchTabSwitches(tab: unknown) {
  if (!tab || typeof document === "undefined") return false;
  document.dispatchEvent(new CustomEvent("tbf:tabs", { detail: { tab } }));
  const switches = normalizeTabSwitches(tab);
  if (switches.length) {
    document.dispatchEvent(new CustomEvent("tabs:switch", { detail: { switches } }));
  }
  return true;
}

function scheduleRedirectOrReload(
  action: ReturnType<typeof pickResponseAction>,
  meta: ActionFlashMeta,
  adapters?: ActionAdapters,
) {
  if (!action) return false;
  dispatchTabSwitches(action.tab);
  if (!action.redirect && !action.reload) return true;
  const flashApi = adapters?.flash || defaultFlash;
  const configuredDelay = Number((action as any).redirect_delay_ms);
  const delay = Number.isFinite(configuredDelay)
    ? Math.max(0, Math.floor(configuredDelay))
    : flashApi.computeFlashDurationMs?.(meta.message, meta.description) || 1000;
  window.setTimeout(() => {
    if (action.redirect) {
      if (adapters?.navigation?.navigate) void adapters.navigation.navigate(action.redirect);
      else window.location.assign(action.redirect);
      return;
    }
    if (adapters?.reload?.reload) void adapters.reload.reload();
    else window.location.reload();
  }, delay);
  return true;
}

function pickConfiguredSuccessAction(config: ConfiguredSuccessAction | null | undefined) {
  if (!config || typeof config !== "object") return null;
  const tab = typeof config.successTab === "string" ? config.successTab.trim() : config.successTab;
  const reload = config.success === "soft-reload" || config.lifecycle === true;
  const delay = Number(config.redirect_delay_ms);
  if (!tab && !reload) return null;
  return {
    redirect: "",
    reload,
    tab,
    ...(Number.isFinite(delay) ? { redirect_delay_ms: delay } : {}),
  };
}

function handleConfiguredSuccessAction(
  config: ConfiguredSuccessAction | null | undefined,
  json: ActionJson | null | undefined,
  ui: ActionRequestUi | undefined,
  adapters?: ActionAdapters,
) {
  if (ui?.ignoreResponseAction === true) return false;
  const action = pickConfiguredSuccessAction(config);
  if (!action) return false;
  const kind = isNoop(json) ? "noop" : "success";
  return scheduleRedirectOrReload(action, computeFlashMeta(kind, json, adapters), adapters);
}

function handleResponseAction(
  json: ActionJson,
  ui: ActionRequestUi | undefined,
  adapters?: ActionAdapters,
) {
  const kind = isNoop(json) ? "noop" : json.ok === true ? "success" : "error";
  const meta = computeFlashMeta(kind, json, adapters);
  if (shouldShowFlash(ui, kind)) showResponseFlash(kind, json, adapters);
  if (kind !== "error" && ui?.ignoreResponseAction !== true) {
    scheduleRedirectOrReload(pickResponseAction(json), meta, adapters);
  }
  return { kind, meta };
}

export {
  actionResponseOk,
  computeFlashMeta,
  dispatchTabSwitches,
  handleConfiguredSuccessAction,
  handleResponseAction,
  isNoop,
  normalizeTabSwitches,
  pickResponseAction,
  scheduleRedirectOrReload,
  shouldShowFlash,
  showResponseFlash,
};
