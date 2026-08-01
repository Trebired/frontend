import {
  dispatchInputChange,
  queryAll,
  resolveDocumentTarget,
  type BindRoot,
} from "#er0dlx1gtbzh";

const AUTOSIZE_SELECTOR = "textarea[data-tbf-autosize]";
const CLEAR_SELECTOR = "[data-tbf-clear]";
const PASSWORD_TOGGLE_SELECTOR = "[data-tbf-password-toggle][aria-controls]";
const UPLOAD_SELECTOR = "[data-tbf-upload]";
const uploadStates = new WeakMap<HTMLElement, File[]>();

type UploadFieldOptions = {
  accept?: string;
  id?: string;
  label?: string;
  multiple?: boolean;
  name: string;
};

function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function bindAutosizeTextarea(textarea: HTMLTextAreaElement) {
  if (textarea.hasAttribute("data-tbf-autosize-bound")) return false;
  textarea.setAttribute("data-tbf-autosize-bound", "true");
  textarea.addEventListener("input", () => resizeTextarea(textarea));
  resizeTextarea(textarea);
  return true;
}

function bindClearButton(button: HTMLElement) {
  if (button.hasAttribute("data-tbf-clear-bound")) return false;
  button.setAttribute("data-tbf-clear-bound", "true");
  button.addEventListener("click", () => {
    const target = resolveDocumentTarget(button.getAttribute("data-tbf-clear"));
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      target.value = "";
      dispatchInputChange(target);
    }
  });
  return true;
}

function bindPasswordToggle(button: HTMLElement) {
  if (button.hasAttribute("data-tbf-password-bound")) return false;
  button.setAttribute("data-tbf-password-bound", "true");
  button.addEventListener("click", () => {
    const input = resolveDocumentTarget(button.getAttribute("aria-controls"));
    if (!(input instanceof HTMLInputElement)) return;
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    button.setAttribute("aria-pressed", show ? "true" : "false");
  });
  return true;
}

function uploadSlot(root: HTMLElement, slot: string) {
  return root.querySelector<HTMLElement>(`[data-tbf-upload-slot="${slot}"]`);
}

function fileList(input: HTMLInputElement) {
  return input.files ? Array.from(input.files) : [];
}

function setUploadFiles(root: HTMLElement, files: File[]) {
  uploadStates.set(root, files);
  root.setAttribute("data-tbf-upload-has-files", files.length ? "true" : "false");
  const label = uploadSlot(root, "label");
  if (label) {
    label.textContent = files.length === 0
      ? root.getAttribute("data-tbf-upload-empty") || "No file selected"
      : files.length === 1
        ? files[0].name
        : `${files.length} files selected`;
  }
  const list = uploadSlot(root, "list");
  if (list) {
    list.replaceChildren(...files.map((file) => {
      const item = document.createElement("li");
      item.textContent = file.name;
      return item;
    }));
  }
  root.dispatchEvent(
    new CustomEvent("tbf:upload-change", {
      bubbles: true,
      detail: { files },
    }),
  );
}

function bindUpload(root: HTMLElement) {
  if (root.hasAttribute("data-tbf-upload-bound")) return false;
  root.setAttribute("data-tbf-upload-bound", "true");
  const input = uploadSlot(root, "input") as HTMLInputElement | null;
  const trigger = uploadSlot(root, "trigger");
  const clear = uploadSlot(root, "clear");
  if (input) {
    input.addEventListener("change", () => setUploadFiles(root, fileList(input)));
  }
  trigger?.addEventListener("click", () => input?.click());
  clear?.addEventListener("click", () => {
    if (input) input.value = "";
    setUploadFiles(root, []);
  });
  root.addEventListener("dragover", (event) => {
    event.preventDefault();
    root.setAttribute("data-tbf-upload-drag", "true");
  });
  root.addEventListener("dragleave", () => root.removeAttribute("data-tbf-upload-drag"));
  root.addEventListener("drop", (event) => {
    event.preventDefault();
    root.removeAttribute("data-tbf-upload-drag");
    const files = event.dataTransfer ? Array.from(event.dataTransfer.files) : [];
    setUploadFiles(root, files);
  });
  setUploadFiles(root, []);
  return true;
}

function bindUploads(root: BindRoot = document) {
  queryAll<HTMLElement>(root, UPLOAD_SELECTOR).forEach(bindUpload);
}

function bindInputControllers(root: BindRoot = document) {
  queryAll<HTMLTextAreaElement>(root, AUTOSIZE_SELECTOR).forEach(bindAutosizeTextarea);
  queryAll<HTMLElement>(root, CLEAR_SELECTOR).forEach(bindClearButton);
  queryAll<HTMLElement>(root, PASSWORD_TOGGLE_SELECTOR).forEach(bindPasswordToggle);
  bindUploads(root);
}

function getUploadFiles(root: HTMLElement | null) {
  return root instanceof HTMLElement ? uploadStates.get(root) || [] : [];
}

function createUploadField(options: UploadFieldOptions) {
  const id = options.id || `upload_${Math.random().toString(36).slice(2)}`;
  const root = document.createElement("div");
  root.id = id;
  root.className = "tbf-upload";
  root.setAttribute("data-tbf-upload", "");
  root.setAttribute("data-tbf-upload-empty", options.label || "No file selected");
  root.innerHTML = uploadFieldHtml({ ...options, id });
  return root;
}

function uploadFieldHtml(options: UploadFieldOptions) {
  const id = options.id || "upload_field";
  const multiple = options.multiple ? " multiple" : "";
  const accept = options.accept ? ` accept="${options.accept.replace(/"/g, "&quot;")}"` : "";
  const label = options.label || "No file selected";
  return [
    `<input class="tbf-upload__input" data-tbf-upload-slot="input" id="${id}_input" type="file" name="${options.name}"${multiple}${accept}>`,
    '<div class="tbf-upload__surface" data-tbf-upload-slot="surface">',
    `<span class="tbf-upload__label" data-tbf-upload-slot="label">${label}</span>`,
    '<button class="tbf-button" type="button" data-tbf-upload-slot="trigger">Choose</button>',
    '<button class="tbf-button" type="button" data-tbf-upload-slot="clear">Clear</button>',
    '<ul class="tbf-upload__list" data-tbf-upload-slot="list"></ul>',
    "</div>",
  ].join("");
}

export {
  AUTOSIZE_SELECTOR,
  CLEAR_SELECTOR,
  PASSWORD_TOGGLE_SELECTOR,
  UPLOAD_SELECTOR,
  bindAutosizeTextarea,
  bindClearButton,
  bindInputControllers,
  bindPasswordToggle,
  bindUpload,
  bindUploads,
  createUploadField,
  getUploadFiles,
  setUploadFiles,
  uploadFieldHtml,
};
export type { UploadFieldOptions };
