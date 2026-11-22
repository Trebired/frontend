import { frontendClassName } from "#5vbaqj4pirp3";

function logLineElementId(entryId: unknown) {
  const id = String(entryId ?? "").trim().replace(/[^A-Za-z0-9_-]/gu, "");
  return id ? `${frontendClassName("log")}-${id}` : "";
}

export { logLineElementId };
