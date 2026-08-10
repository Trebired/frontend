import {
  fallbackJsonFromStatus,
  normalizeJsonRequestOptions,
  requestJson,
} from "#v1p6uw62hhsf";
import { progress as defaultProgress } from "#hmj29rrpgtsh";
import { handleResponseAction } from "./response.js";
import type { ActionAdapters, ActionJson, ActionRequestUi } from "./types.js";

type ActionRequestOptions = Omit<RequestInit, "body"> & {
  adapters?: ActionAdapters;
  body?: BodyInit | Record<string, unknown> | null;
  ui?: ActionRequestUi;
};

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

async function handleJson(
  url: string,
  options: ActionRequestOptions = {},
  ui: ActionRequestUi = {},
) {
  const adapters = options.adapters || {};
  const progressApi = adapters.progress || defaultProgress;
  progressApi.begin();
  try {
    const { json } = await requestJson(url, normalizeJsonRequestOptions(options));
    handleResponseAction(json, { ...ui, ...options.ui }, adapters);
    return json;
  } catch {
    const fail = networkFailure();
    handleResponseAction(fail, { ...ui, ...options.ui }, adapters);
    return fail;
  } finally {
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
  progressApi.begin();
  return new Promise<ActionJson>((resolve) => {
      const xhr = new XMLHttpRequest();
      configureXhr(xhr, url);
      if (xhr.upload && typeof onProgress === "function") {
        xhr.upload.onprogress = (event) => {
          onProgress(event);
          progressApi.setFromProgressEvent(event);
        };
      }
      xhr.onerror = () => {
        const fail = networkFailure();
        handleResponseAction(fail, options.ui, adapters);
        progressApi.end(true);
        resolve(fail);
      };
      xhr.onabort = xhr.onerror;
      xhr.onload = () => {
        const json = readXhrJson(xhr);
        handleResponseAction(json, options.ui, adapters);
        progressApi.end();
        resolve(json);
      };
      xhr.send(body);
  });
}

async function requestJsonPayload(url: string, options: ActionRequestOptions = {}) {
  const { json } = await requestJson(url, normalizeJsonRequestOptions(options));
  return json;
}

export {
  handleJson,
  handleXhrJson,
  networkFailure,
  requestJsonPayload,
};
export type { ActionRequestOptions };
