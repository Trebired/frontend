import { requestJson } from "#v1p6uw62hhsf";
import { queryAll, type BindRoot } from "#er0dlx1gtbzh";

const STATUS_FIELD_SELECTOR = "[data-tbf-status-field]";
const STATUS_MESSAGE_SELECTOR = "[data-tbf-status-message]";
const STATUS_EVENT = "tbf:status";

type StatusState = {
  field: HTMLInputElement | HTMLTextAreaElement;
  ok: boolean;
  root: HTMLElement;
};

function statusField(root: HTMLElement) {
  const field = root.querySelector("input,textarea");
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) return field;
  return null;
}

function setStatus(root: HTMLElement, state: "idle" | "checking" | "error" | "success", message = "") {
  root.setAttribute("data-tbf-status-state", state);
  root.querySelectorAll<HTMLElement>(STATUS_MESSAGE_SELECTOR).forEach((slot) => {
    slot.textContent = message;
    slot.hidden = !message;
  });
}

async function validateStatusField(root: HTMLElement) {
  const field = statusField(root);
  const url = root.getAttribute("data-tbf-status-url");
  if (!field || !url) return null;
  setStatus(root, "checking");
  const { json } = await requestJson(url, {
    body: { name: field.name, value: field.value },
    method: root.getAttribute("data-tbf-status-method") || "POST",
  });
  const ok = Boolean((json as { ok?: boolean }).ok);
  const message = String((json as { message?: string }).message || "");
  setStatus(root, ok ? "success" : "error", message);
  const state = { field, ok, root };
  root.dispatchEvent(new CustomEvent(STATUS_EVENT, { bubbles: true, detail: state }));
  return state;
}

function bindStatusField(root: HTMLElement | null) {
  if (!(root instanceof HTMLElement) || root.hasAttribute("data-tbf-status-bound")) return null;
  root.setAttribute("data-tbf-status-bound", "true");
  const field = statusField(root);
  field?.addEventListener("change", () => {
    void validateStatusField(root);
  });
  field?.addEventListener("blur", () => {
    void validateStatusField(root);
  });
  setStatus(root, "idle");
  return root;
}

function bindStatusFields(root: BindRoot = document) {
  queryAll<HTMLElement>(root, STATUS_FIELD_SELECTOR).forEach(bindStatusField);
}

export {
  STATUS_EVENT,
  STATUS_FIELD_SELECTOR,
  STATUS_MESSAGE_SELECTOR,
  bindStatusField,
  bindStatusFields,
  setStatus,
  validateStatusField,
};
export type { StatusState };
