import { cssEscape } from "#er0dlx1gtbzh";

type TrackedField =
HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function normalizedPrimaryFormIds(values: unknown) {
  return Array.isArray(values)
  ? values.map((value) => String(value || "").trim()).filter(Boolean)
  : [];
}

function normalizeActionPath(action: unknown) {
  const raw = typeof action === "string" ? action.trim() : "";
  if (!raw) return "";
  try {
    return new URL(raw, window.location.href).pathname;
  } catch {
    return raw;
  }
}

function formHasSubmitButton(form: HTMLFormElement) {
  if (form.querySelector("button[type='submit'], input[type='submit']")) {
    return true;
  }
  const formId = String(form.id || "").trim();
  if (!formId) return false;
  return Boolean(
    document.querySelector(
      `button[form="${cssEscape(formId)}"], input[type='submit'][form="${cssEscape(formId)}"]`,
    ),
  );
}

function isSpecialSettingsForm(
  form: HTMLFormElement,
  specialActionPatterns: RegExp[] = [],
) {
  if (form.getAttribute("data-tbf-save-policy-special") === "true") {
    return true;
  }
  const actionPath = normalizeActionPath(
    form.getAttribute("action") || form.action || "",
  );
  return specialActionPatterns.some((pattern) => pattern.test(actionPath));
}

function ownerFormIdOf(node: Element | null) {
  const field =
  node instanceof HTMLInputElement ||
    node instanceof HTMLSelectElement ||
    node instanceof HTMLTextAreaElement
  ? node
  : null;
  if (field) {
    return String(
      field.form?.id ||
        field.getAttribute("form") ||
        field.closest("form")?.id ||
        "",
    ).trim();
  }
  const form =
  node instanceof HTMLFormElement
  ? node
  : node?.closest("form") || null;
  return String(form?.id || "").trim();
}

function isInsidePrimaryForm(node: Element | null, primaryFormIds: string[]) {
  const ownerFormId = ownerFormIdOf(node);
  return Boolean(ownerFormId && primaryFormIds.includes(ownerFormId));
}

function isTrackedField(node: Element | null, primaryFormIds: string[]) {
  const field =
  node instanceof HTMLInputElement ||
    node instanceof HTMLSelectElement ||
    node instanceof HTMLTextAreaElement
  ? node
  : null;
  return Boolean(
    field && !field.disabled && isInsidePrimaryForm(field, primaryFormIds),
  );
}

function serializeFieldValue(field: TrackedField) {
  if (field instanceof HTMLInputElement) {
    const type = String(field.type ||"").trim().toLowerCase();
    if (type === "checkbox" || type === "radio") {
      return field.checked ? "1" : "0";
    }
    if (type === "file") {
      return Array.from(field.files || [])
      .map((file) => String(file.name || ""))
      .join("\u0001");
    }
    return String(field.value || "");
  }
  if (field instanceof HTMLSelectElement && field.multiple) {
    return Array.from(field.selectedOptions)
    .map((option) => String(option.value || ""))
    .join("\u0001");
  }
  return String(field.value || "");
}

function collectTrackedFields(root: HTMLElement, primaryFormIds: string[]) {
  const fields: TrackedField[] = [];
  root.querySelectorAll("input,select,textarea").forEach((node) => {
      if (
        node instanceof HTMLInputElement ||
          node instanceof HTMLSelectElement ||
          node instanceof HTMLTextAreaElement
      ) {
        if (isTrackedField(node, primaryFormIds)) fields.push(node);
      }
  });
  return fields;
}

export {
  collectTrackedFields,
  formHasSubmitButton,
  isInsidePrimaryForm,
  isSpecialSettingsForm,
  isTrackedField,
  normalizeActionPath,
  normalizedPrimaryFormIds,
  ownerFormIdOf,
  serializeFieldValue,
};
export type { TrackedField };
