type FetchPagedJsonQuery = Record<string, unknown>|URLSearchParams | null;

function appendPagedQuery(target: URL, query: FetchPagedJsonQuery) {
  if (!query) return;
  if (query instanceof URLSearchParams) {
    query.forEach((value, key) => {
        if (value) target.searchParams.set(key, value);
    });
    return;
  }
  Object.entries(query).forEach(([key, value]) => {
      if (value == null || value === "") return;
      target.searchParams.set(key, String(value));
  });
}

function pagedJsonMessage(json: unknown, fallback: string) {
  const message =
  json && typeof json === "object" ? (json as { message?: unknown }).message : "";
  return typeof message === "string" && message.trim() ? message.trim() : fallback;
}

async function fetchPagedJson(
  url: string | URL,
  query: FetchPagedJsonQuery = null,
  init: RequestInit | null = null,
) {
  const target = new URL(String(url || ""), window.location.origin);
  appendPagedQuery(target, query);
  const options = init && typeof init === "object" ? init : {};
  const response = await fetch(target.toString(), {
      credentials: "same-origin",
      ...options,
      headers: { Accept: "application/json", ...(options.headers || {}) },
  });
  const json = await response.json().catch (() => null);
  if (!response.ok) throw new Error(pagedJsonMessage(json, "Request failed"));
  return json && typeof json === "object" && "data"in json
  ? (json as { data: unknown }).data
  : json;
}

const fetchJson = fetchPagedJson;

export { fetchJson, fetchPagedJson };
export type { FetchPagedJsonQuery };
