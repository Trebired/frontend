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
  setUploadRemoteSelection,
  uploadManager,
} from "./upload/manager.js";
import {
  createUploadField,
  uploadConfigPayload,
  uploadFieldHtml,
} from "./upload/markup.js";
import { matchesAccept, parseAcceptList } from "./upload/files.js";
import type { UploadRuntimeOptions } from "./upload/types.js";
import { bindChoiceControls } from "./choice.js";
import { bindDisclosures } from "./disclosure.js";
import { bindDropdowns } from "./dropdown.js";
import { bindSearchControls } from "./search.js";
import { bindStatusFields } from "./status.js";
import { bindTabs } from "./tabs.js";
import { frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";

const AUTOSIZE_SELECTOR = `textarea${frontendDataSelector("autosize")}`;
const CLEAR_SELECTOR = frontendDataSelector("clear");
const PASSWORD_TOGGLE_SELECTOR = `${frontendDataSelector("password-toggle")}[aria-controls]`;

type InputControllerOptions = UploadRuntimeOptions;

function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function bindAutosizeTextarea(textarea: HTMLTextAreaElement) {
  if (textarea.hasAttribute(frontendDataAttr("autosize-bound"))) return false;
  textarea.setAttribute(frontendDataAttr("autosize-bound"), "true");
  textarea.addEventListener("input", () => resizeTextarea(textarea));
  resizeTextarea(textarea);
  return true;
}

function bindClearButton(button: HTMLElement) {
  if (button.hasAttribute(frontendDataAttr("clear-bound"))) return false;
  button.setAttribute(frontendDataAttr("clear-bound"), "true");
  button.addEventListener("click", () => {
      const target = resolveDocumentTarget(button.getAttribute(frontendDataAttr("clear")));
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        target.value = "";
        dispatchInputChange(target);
      }
  });
  return true;
}

function bindPasswordToggle(button: HTMLElement) {
  if (button.hasAttribute(frontendDataAttr("password-bound"))) return false;
  button.setAttribute(frontendDataAttr("password-bound"), "true");
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
  bindChoiceControls(root);
  bindDisclosures(root);
  bindDropdowns(root);
  bindSearchControls(root);
  bindStatusFields(root);
  bindTabs(root);
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
  setUploadRemoteSelection,
  uploadConfigPayload,
  uploadFieldHtml,
  uploadManager,
};
export *from "./choice.js";
export *from "./disclosure.js";
export *from "./dropdown.js";
export *from "./search.js";
export *from "./status.js";
export *from "./tabs.js";
export type {
  UploadEmptyToggle,
  UploadEntry,
  UploadFieldOptions,
  UploadFlashApi,
  UploadRemoteAction,
  UploadRemoteSelection,
  UploadRootConfig,
  UploadRuntimeOptions,
  UploadState,
} from "./upload/types.js";
export type { InputControllerOptions };
