type CsrfFetchOptions = RequestInit & {
  csrfHeaderName?: string;
  csrfMetaName?: string;
};

type JsonRequestOptions = Omit<CsrfFetchOptions, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
};

function readCsrfToken(metaName = "csrf-token") {
  if (typeof document === "undefined") return "";
  const meta = document.querySelector(`meta[name="${metaName}"]`);
  const value = meta ? meta.getAttribute("content") : "";
  return String(value || "").trim();
}

function ensureFormCsrfToken(
  form: HTMLFormElement | null,
  options: { fieldName?: string; metaName?: string } = {},
) {
  if (!(form instanceof HTMLFormElement)) return false;
  const token = readCsrfToken(options.metaName);
  if (!token) return false;
  const fieldName = options.fieldName || "_csrf";
  const existing = form.querySelector<HTMLInputElement>(
    `input[name="${fieldName}"]`,
  );
  if (existing) {
    existing.value = token;
    return true;
  }
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = fieldName;
  input.value = token;
  form.appendChild(input);
  return true;
}

function csrfFetch(input: RequestInfo | URL, init: CsrfFetchOptions = {}) {
  const headers = new Headers(init.headers || {});
  const token = readCsrfToken(init.csrfMetaName);
  const headerName = init.csrfHeaderName || "X-CSRF-Token";
  if (token) headers.set(headerName, token);
  return fetch(input, {
      ...init,
      credentials: init.credentials || "same-origin",
      headers,
  });
}

function isFormDataBody(value: unknown): value is FormData {
  return Boolean(
    value &&
      typeof FormData !== "undefined" &&
      typeof (value as FormData).append === "function" &&
      typeof (value as FormData).get === "function",
  );
}

function isJsonBody(value: unknown) {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !isFormDataBody(value) &&
      !(value instanceof URLSearchParams) &&
      !(value instanceof Blob),
  );
}

function normalizeJsonRequestOptions(options: JsonRequestOptions = {}) {
  const { body, csrfHeaderName: _csrfHeaderName, csrfMetaName: _csrfMetaName, ...init } = options;
  const out: RequestInit = { ...init };
  const headers = new Headers(options.headers || {});
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (isFormDataBody(body)) {
    headers.delete("Content-Type");
    out.body = body;
  } else if (isJsonBody(body)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    out.body = JSON.stringify(body);
  } else {
    out.body = body as BodyInit | null | undefined;
  }
  out.headers = headers;
  return out;
}

async function readJsonSafe(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function fallbackJsonFromStatus(status: number, ok: boolean) {
  return {
    data: null,
    message: "",
    noop: false,
    ok: Boolean(ok),
    status: Number(status) || 0,
    status_code: "",
  };
}

async function requestJson(input: RequestInfo | URL, options: JsonRequestOptions = {}) {
  const response = await csrfFetch(input, normalizeJsonRequestOptions(options));
  const json = await readJsonSafe(response);
  if (json && typeof json.ok === "boolean") return { json, response };
  return {
    json: fallbackJsonFromStatus(response.status, response.ok),
    response,
  };
}

export {
  csrfFetch,
  ensureFormCsrfToken,
  fallbackJsonFromStatus,
  normalizeJsonRequestOptions,
  readCsrfToken,
  readJsonSafe,
  requestJson,
};
export type { CsrfFetchOptions, JsonRequestOptions };
export * from "./paged.js";
