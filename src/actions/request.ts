import {
  fallbackJsonFromStatus,
  normalizeJsonRequestOptions,
  requestJson,
} from "#v1p6uw62hhsf";
import { progress as defaultProgress } from "#hmj29rrpgtsh";
import { handleResponseAction } from "./response.js";
import stepsController from "#jdm7qktkge73";
import type { ActionAdapters, ActionJson, ActionRequestUi } from "./types.js";

type ActionRequestOptions = Omit<RequestInit, "body">& {
  adapters?: ActionAdapters;
  body?: BodyInit | Record<string, unknown>|null;
  ui?: ActionRequestUi;
} &ActionRequestUi;

function networkFailure(): ActionJson {
  return {
    data: null,
    message: "Network request failed.",
    noop: false,
    ok: false,
    status: 0,
    status_code: "network-error",
  };
}

function abortFailure(adapters?: ActionAdapters): ActionJson {
  return {
    data: null,
    message:
    adapters?.i18n?.("feedback.uploadCanceled", "Request canceled.") ||
      "Request canceled.",
    noop: true,
    ok: false,
    status: 0,
    status_code: "request-aborted",
  };
}

function mergedUi(options: ActionRequestOptions, ui: ActionRequestUi = {}) {
  return { ...options, ...ui, ...(options.ui || {}) };
}

function setActionBusy(ui: ActionRequestUi | undefined, busy: boolean) {
  if (ui?.busyScope) stepsController.setActionsBusy(ui.busyScope, busy);
}

function beginSteps(ui: ActionRequestUi | undefined) {
  if (ui?.steps) stepsController.begin(ui.steps);
}

function reflectSteps(ui: ActionRequestUi | undefined, message: unknown) {
  if (!ui?.steps) return;
  stepsController.open(ui.steps);
  stepsController.setCopyMessage(ui.steps, message);
}

function handleActionJsonResponse(
  json: ActionJson,
  ui: ActionRequestUi,
  adapters?: ActionAdapters,
) {
  const result = handleResponseAction(json, ui, adapters);
  reflectSteps(ui, result.meta.message);
  return result;
}

async function handleJson(
  url: string,
  options: ActionRequestOptions = {},
  ui: ActionRequestUi = {},
) {
  const adapters = options.adapters || {};
  const progressApi = adapters.progress || defaultProgress;
  const localUi = mergedUi(options, ui);
  setActionBusy(localUi, true);
  beginSteps(localUi);
  progressApi.begin();
  try {
    const { json } = await requestJson(url, normalizeJsonRequestOptions(options));
    handleActionJsonResponse(json, localUi, adapters);
    return json;
  } catch {
    const fail = networkFailure();
    handleActionJsonResponse(fail, localUi, adapters);
    return fail;
  } finally {
    setActionBusy(localUi, false);
    progressApi.end();
  }
}

function configureXhr(xhr: XMLHttpRequest, url: string) {
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
  if (token) xhr.setRequestHeader("X-CSRF-Token", token);
}

function readXhrJson(xhr: XMLHttpRequest): ActionJson {
  try {
    const parsed = xhr.responseText ? JSON.parse(xhr.responseText) : null;
    if (parsed && typeof parsed.ok === "boolean") return parsed;
  } catch {}
  return fallbackJsonFromStatus(xhr.status || 0, xhr.status >= 200 && xhr.status < 300);
}

function handleXhrJson(
  url: string,
  body: FormData,
  options: ActionRequestOptions = {},
  onProgress?: (event: ProgressEvent) => void,
) {
  const adapters = options.adapters || {};
  const progressApi = adapters.progress || defaultProgress;
  const ui = mergedUi(options);
  setActionBusy(ui, true);
  beginSteps(ui);
  progressApi.begin();
  return new Promise<ActionJson>((resolve) => {
      try {
        const xhr = new XMLHttpRequest();
        configureXhr(xhr, url);
        try {
          (ui.onXhr || ui.on_xhr)?.(xhr);
        } catch {}
        if (xhr.upload && typeof onProgress === "function") {
          xhr.upload.onprogress = (event) => {
            onProgress(event);
            progressApi.setFromProgressEvent(event);
          };
        }
        xhr.onerror = () => {
          const fail = networkFailure();
          handleActionJsonResponse(fail, ui, adapters);
          setActionBusy(ui, false);
          progressApi.end(true);
          resolve(fail);
        };
        xhr.onabort = () => {
          const fail = abortFailure(adapters);
          const callback = ui.onAbort || ui.on_abort;
          if (typeof callback === "function") {
            try {
              callback(fail);
            } catch {}
          }
          handleActionJsonResponse(fail, { ...ui, silent: true }, adapters);
          setActionBusy(ui, false);
          progressApi.end(true);
          resolve(fail);
        };
        xhr.onload = () => {
          const json = readXhrJson(xhr);
          handleActionJsonResponse(json, ui, adapters);
          setActionBusy(ui, false);
          progressApi.end();
          resolve(json);
        };
        xhr.send(body);
      } catch {
        const fail = networkFailure();
        handleActionJsonResponse(fail, ui, adapters);
        setActionBusy(ui, false);
        progressApi.end(true);
        resolve(fail);
      }
  });
}

async function requestJsonPayload(
  url: string,
  options: ActionRequestOptions = {},
  fallback: unknown = null,
) {
  try {
    const { json } = await requestJson(url, normalizeJsonRequestOptions(options));
    return json == null ? fallback : json;
  } catch {
    return fallback;
  }
}

const actionRequest = Object.freeze({
    handleJson,
    handleXhrJson,
    requestJson,
    requestJsonPayload,
});

export {
  actionRequest,
  handleJson,
  handleXhrJson,
  networkFailure,
  requestJsonPayload,
};
export type { ActionRequestOptions };
