import {
  dispatchInputChange,
  queryAll,
  resolveDocumentTarget,
  type BindRoot,
} from "#er0dlx1gtbzh";
import {
  UPLOAD_SELECTOR,
  bindUploadRoot,
  bindUploads,
  bootUploadManager,
  clearUpload,
  getUploadEntries,
  getUploadFiles,
  openUploadCropSession,
  setSelectedEntries,
  setUploadFiles,
  uploadManager,
} from "./upload/manager.js";
import {
  createUploadField,
  uploadConfigPayload,
  uploadFieldHtml,
} from "./upload/markup.js";
import { matchesAccept, parseAcceptList } from "./upload/files.js";
import type { UploadRuntimeOptions } from "./upload/types.js";

const AUTOSIZE_SELECTOR = "textarea[data-tbf-autosize]";
const CLEAR_SELECTOR = "[data-tbf-clear]";
const PASSWORD_TOGGLE_SELECTOR = "[data-tbf-password-toggle][aria-controls]";

type InputControllerOptions = UploadRuntimeOptions;

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

function bindInputControllers(
  root: BindRoot = document,
  options: InputControllerOptions = {},
) {
  queryAll<HTMLTextAreaElement>(root, AUTOSIZE_SELECTOR).forEach(bindAutosizeTextarea);
  queryAll<HTMLElement>(root, CLEAR_SELECTOR).forEach(bindClearButton);
  queryAll<HTMLElement>(root, PASSWORD_TOGGLE_SELECTOR).forEach(bindPasswordToggle);
  bindUploads(root, options);
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
  bindUploadRoot,
  bindUploads,
  bootUploadManager,
  clearUpload,
  createUploadField,
  getUploadEntries,
  getUploadFiles,
  matchesAccept,
  openUploadCropSession,
  parseAcceptList,
  setSelectedEntries,
  setUploadFiles,
  uploadConfigPayload,
  uploadFieldHtml,
  uploadManager,
};
export type {
  UploadEmptyToggle,
  UploadEntry,
  UploadFieldOptions,
  UploadFlashApi,
  UploadRootConfig,
  UploadRuntimeOptions,
  UploadState,
} from "./upload/types.js";
export type { InputControllerOptions };
