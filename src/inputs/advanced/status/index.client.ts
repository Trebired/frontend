import { createLocalTranslator } from "#dqy2d22qyujv";
import { requestJson } from "#dqy2d22qyujv";
import { setTooltipText } from "#yf1o70q7eshd";
import { documentLang } from "#dqy2d22qyujv";
import { readHostJsonConfig } from "#dqy2d22qyujv";

type MatchStatusConfig = {
  mismatchReason?: string;
  requiredReason?: string;
  targetId?: string;
};

type StatusFieldConfig = {
  debounceMs?: number;
  endpoint?: string;
  errorReasons?: Record<string, string>;
  field?: string;
  match?: MatchStatusConfig | null;
  missingReason?: string;
  reasonSource?: "status_code" | "summary";
  requestFailedReason?: string;
  trim?: boolean;
};

type StatusIcons = {
  bad: HTMLElement | null;
  ok: HTMLElement | null;
};

const DEFAULT_DEBOUNCE_MS = 400;
const STATUS_FIELD_SELECTOR = "[data-status-field]";
const STATUS_FIELD_CONFIG_SELECTOR =
'script[type="application/json"][data-status-field-config]';
const boundStatusFields = new WeakSet<HTMLElement>();
const boundBackendStatusInputs = new WeakSet<HTMLInputElement>();
const boundMatchStatusInputs = new WeakSet<HTMLInputElement>();
const backendStatusRequestIds = new WeakMap<HTMLInputElement, number>();
const inputConfigs = new WeakMap<HTMLInputElement, StatusFieldConfig>();
const inputWraps = new WeakMap<HTMLInputElement, HTMLElement>();
const wrapIcons = new WeakMap<HTMLElement, StatusIcons>();

function configString(
  config: StatusFieldConfig | undefined,
  key: keyof StatusFieldConfig,
  fallback = "",
) {
  const value = String((config && config[key]) || "").trim();
  return value || fallback;
}

function getInputStatusWrap(input: HTMLInputElement | null) {
  return input instanceof HTMLInputElement
  ? inputWraps.get(input) || null
  : null;
}

function setBadReason(bad: HTMLElement | null, reason: unknown) {
  if (!bad) return;
  const text = String(reason || "").trim();
  if (text) {
    bad.setAttribute("aria-label", text);
    bad.classList.add("has-tooltip");
    setTooltipText(bad, text);
    return;
  }

  bad.removeAttribute("aria-label");
  bad.classList.remove("has-tooltip");
  setTooltipText(bad, "");
}

function setInputStatusIcon(
  wrap: HTMLElement | null,
  status: string,
  reason = "",
) {
  if (!wrap) return;
  const icons = wrapIcons.get(wrap) || { bad: null, ok: null };
  if (status === "ok" || status === "bad") {
    wrap.setAttribute("data-input-status", status);
  } else {
    wrap.removeAttribute("data-input-status");
  }
  if (icons.ok) icons.ok.hidden = status !== "ok";
  if (icons.bad) icons.bad.hidden = status !== "bad";
  setBadReason(icons.bad, status === "bad" ? reason : "");
}

function readErrorReasons(config: StatusFieldConfig) {
  const reasons = config.errorReasons;
  return reasons && typeof reasons === "object" ? reasons : {};
}

function backendStatusValue(
  input: HTMLInputElement,
  config: StatusFieldConfig,
) {
  const value = String(input.value || "");
  return config.trim === false ? value : value.trim();
}

function backendStatusReason(
  input: HTMLInputElement,
  result: any,
  fallbackCode = "",
  config: StatusFieldConfig = inputConfigs.get(input) || {},
) {
  const localT = createLocalTranslator(import.meta.url, documentLang());
  if (result && result.message) return String(result.message);
  if (result && config.reasonSource === "summary" && result.summary) {
    return String(result.summary);
  }

  const code = String(
    (result && result.status_code) || fallbackCode || "",
  ).trim();
  const reasonMessages = readErrorReasons(config);
  const message =
  reasonMessages[code] ||
    (fallbackCode === "missing" ? configString(config, "missingReason") : "") ||
    configString(config, "requestFailedReason");
  return message || localT("feedback.requestFailed");
}

function dispatchBackendStatusChecked(input: HTMLInputElement, detail: any) {
  if (typeof CustomEvent === "undefined") return;
  input.dispatchEvent(
    new CustomEvent("backend-status:checked", {
        bubbles: true,
        detail,
    }),
  );
}

async function checkBackendStatusInput(
  input: HTMLInputElement,
  config: StatusFieldConfig = inputConfigs.get(input) || {},
) {
  const wrap = getInputStatusWrap(input);
  const endpoint = configString(config, "endpoint");
  const field = configString(config, "field", input.name || "value");
  const value = backendStatusValue(input, config);

  if (!value) {
    const status = input.required ? "bad" : "none";
    const reason = input.required
    ? backendStatusReason(input, null, "missing", config)
    : "";
    setInputStatusIcon(wrap, status, reason);
    dispatchBackendStatusChecked(input, {
        empty: true,
        ok: status !== "bad",
        result: null,
    });
    return;
  }

  if (!endpoint) {
    setInputStatusIcon(
      wrap,
      "bad",
      backendStatusReason(input, null, "", config),
    );
    dispatchBackendStatusChecked(input, { ok: false, result: null });
    return;
  }

  const requestId = (backendStatusRequestIds.get(input) || 0) + 1;
  backendStatusRequestIds.set(input, requestId);
  const response = await requestJson(endpoint, {
      body: { [field]: value },
      method: "POST",
  }).catch(() => null);

  if (backendStatusRequestIds.get(input) !== requestId) return;

  const result = response && response.json && response.json.result;
  const ok = Boolean(result && result.ok === true);
  setInputStatusIcon(
    wrap,
    ok ? "ok" : "bad",
    ok ? "" : backendStatusReason(input, result, "", config),
  );
  dispatchBackendStatusChecked(input, { ok, result });
}

function bindBackendStatusInput(
  input: HTMLInputElement | null,
  options: StatusFieldConfig = {},
) {
  if (!(input instanceof HTMLInputElement)) return false;
  inputConfigs.set(input, options);
  if (boundBackendStatusInputs.has(input)) return true;
  boundBackendStatusInputs.add(input);

  const debounceMs = Number.isFinite(options.debounceMs)
  ? Number(options.debounceMs)
  : DEFAULT_DEBOUNCE_MS;
  let timer: ReturnType<typeof setTimeout> | null = null;
  input.addEventListener("input", function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
          void checkBackendStatusInput(input);
        }, debounceMs);
  });

  void checkBackendStatusInput(input, options);
  return true;
}

function matchTarget(config: MatchStatusConfig | null | undefined) {
  const targetId = String((config && config.targetId) || "").trim();
  if (!targetId) return null;
  const target = document.getElementById(targetId);
  return target instanceof HTMLInputElement ? target : null;
}

function checkMatchStatusInput(
  input: HTMLInputElement,
  config: MatchStatusConfig | null | undefined,
) {
  const wrap = getInputStatusWrap(input);
  const target = matchTarget(config);
  const value = String(input.value || "");
  const localT = createLocalTranslator(import.meta.url, documentLang());

  if (!value) {
    setInputStatusIcon(
      wrap,
      input.required ? "bad" : "none",
      String(config?.requiredReason || localT("feedback.required")),
    );
    return;
  }

  const matches = Boolean(target) && target.value === value;
  setInputStatusIcon(
    wrap,
    matches ? "ok" : "bad",
    matches ? "" : String(config?.mismatchReason || localT("feedback.invalid")),
  );
}

function bindMatchStatusInput(
  input: HTMLInputElement | null,
  config: MatchStatusConfig | null | undefined,
) {
  if (!(input instanceof HTMLInputElement) || boundMatchStatusInputs.has(input))
  return false;
  boundMatchStatusInputs.add(input);
  input.addEventListener("input", function () {
      checkMatchStatusInput(input, config);
  });
  matchTarget(config)?.addEventListener("input", function () {
      checkMatchStatusInput(input, config);
  });
  checkMatchStatusInput(input, config);
  return true;
}

function statusFieldParts(host: HTMLElement) {
  const wrap = host;
  const children = Array.from(wrap.children).filter(
    (child) => child.tagName.toLowerCase() !== "script",
  );
  const input =
  children.find(
    (child): child is HTMLInputElement => child instanceof HTMLInputElement,
  ) || null;
  const iconNodes = children.filter(
    (child): child is HTMLElement =>
    child instanceof HTMLElement && child !== input,
  );
  return {
    icons: {
      bad: iconNodes[1] || null,
      ok: iconNodes[0] || null,
    },
    input,
    wrap,
  };
}

function bindStatusFieldHost(host: HTMLElement) {
  if (boundStatusFields.has(host)) return;
  boundStatusFields.add(host);
  const { icons, input, wrap } = statusFieldParts(host);
  if (!input || !wrap) return;
  const config = readHostJsonConfig<StatusFieldConfig>(
    host,
    STATUS_FIELD_CONFIG_SELECTOR,
    {},
  );
  inputWraps.set(input, wrap);
  wrapIcons.set(wrap, icons);
  inputConfigs.set(input, config);
  if (configString(config, "endpoint")) bindBackendStatusInput(input, config);
  if (config.match) bindMatchStatusInput(input, config.match);
  if (!configString(config, "endpoint") && !config.match) {
    setInputStatusIcon(wrap, "none");
  }
}

function bindAdvancedStatusFields(
  root: ParentNode | HTMLElement | Document = document,
) {
  const scope = root && "querySelectorAll" in root ? root : document;
  const fields =
  scope instanceof HTMLElement && scope.matches(STATUS_FIELD_SELECTOR)
  ? [scope]
  : Array.from(scope.querySelectorAll(STATUS_FIELD_SELECTOR));
  fields.forEach((field) => {
      if (field instanceof HTMLElement) bindStatusFieldHost(field);
  });
}

function bootStatusFields() {
  if (typeof document === "undefined") return;
  bindAdvancedStatusFields(document);
}

if (typeof document !== "undefined" && document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootStatusFields, {
      once: true,
  });
} else {
  bootStatusFields();
}

export {
  bindBackendStatusInput,
  bindAdvancedStatusFields as bindStatusFields,
  bindStatusFieldHost,
  bootStatusFields,
  checkBackendStatusInput,
  getInputStatusWrap,
  setInputStatusIcon,
};
export type { MatchStatusConfig, StatusFieldConfig };
