import {
  clearNativeInputs,
  getClear,
  getCropField,
  getEmptyToggle,
  getFileNameNode,
  getListNode,
  getPreviewEmpty,
  getPreviewImage,
  getPreviewNode,
  setNativeInputFiles,
} from "./dom.js";
import { fileExtension, isImageFileObject } from "./files.js";
import { uploadRootConfig } from "./config.js";
import { toText } from "./text.js";
import type { UploadEntry, UploadState } from "./types.js";

const uploadStates = new WeakMap<HTMLElement, UploadState>();

function getUploadState(root: HTMLElement) {
  const existing = uploadStates.get(root);
  if (existing) return existing;
  const config = uploadRootConfig(root);
  const state: UploadState = {
    cropData: null,
    currentPreviewClearable: config.canClearCurrentPreview === true,
    currentPreviewUrl: toText(config.currentPreviewUrl),
    emptySelected: false,
    entries: [],
    file: null,
    previewObjectUrl: "",
    previewUrl: "",
  };
  uploadStates.set(root, state);
  return state;
}

function revokePreviewUrl(state: UploadState) {
  if (state.previewObjectUrl && typeof URL.revokeObjectURL === "function") {
    URL.revokeObjectURL(state.previewObjectUrl);
  }
  state.previewObjectUrl = "";
  state.previewUrl = "";
}

function selectedName(entries: UploadEntry[], file: File | null, emptyLabel: string) {
  if (entries.length > 1) return `${entries.length} files selected`;
  if (entries.length === 1) return entries[0].path || entries[0].file.name;
  return file?.name || emptyLabel;
}

function previewFallback(entries: UploadEntry[], file: File | null) {
  if (entries.length > 1) return "Files";
  const selected = file || entries[0]?.file || null;
  return fileExtension(selected).toUpperCase() || "File";
}

function currentPreviewUrl(state: UploadState) {
  if (state.previewUrl) return state.previewUrl;
  if (state.emptySelected) return "";
  return state.currentPreviewUrl;
}

function syncPreview(root: HTMLElement) {
  const state = getUploadState(root);
  const config = uploadRootConfig(root);
  const entries = state.entries;
  const file = state.file || (entries.length === 1 ? entries[0].file : null);
  const hasSelection = Boolean(file || entries.length);
  syncSelectedLabel(root, selectedName(entries, file, config.emptyLabel || ""));
  syncList(root, entries);
  syncPreviewContent(root, entries, file, currentPreviewUrl(state), config.noPreview === true);
  root.toggleAttribute("data-tbf-upload-has-files", hasSelection);
  root.setAttribute("data-tbf-upload-has-files", hasSelection ? "true" : "false");
  root.setAttribute("data-tbf-upload-entry-count", String(entries.length));
}

function syncSelectedLabel(root: HTMLElement, label: string) {
  const node = getFileNameNode(root);
  if (!node) return;
  node.textContent = label;
  node.title = label;
}

function syncList(root: HTMLElement, entries: UploadEntry[]) {
  const list = getListNode(root);
  if (!list) return;
  list.replaceChildren(...entries.map((entry) => {
        const item = document.createElement("li");
        item.textContent = entry.path || entry.file.name;
        return item;
  }));
}

function syncPreviewContent(
  root: HTMLElement,
  entries: UploadEntry[],
  file: File | null,
  url: string,
  hidden: boolean,
) {
  const preview = getPreviewNode(root);
  const image = getPreviewImage(root);
  const empty = getPreviewEmpty(root);
  if (!preview) return;
  preview.hidden = hidden;
  if (image) {
    image.hidden = hidden || !url;
    if (url) image.src = url;
    else image.removeAttribute("src");
  }
  if (empty) {
    empty.hidden = hidden || Boolean(url);
    empty.textContent = previewFallback(entries, file);
  }
}

function syncClearAndEmpty(root: HTMLElement) {
  const state = getUploadState(root);
  const clear = getClear(root);
  const toggle = getEmptyToggle(root);
  const hasEntries = state.entries.length > 0 || state.file instanceof File;
  const canClearCurrent = state.currentPreviewClearable && state.currentPreviewUrl && !state.emptySelected;
  if (clear) clear.hidden = !(hasEntries || canClearCurrent);
  if (toggle) toggle.value = state.emptySelected ? uploadRootConfig(root).emptyToggleValue || "1" : "0";
}

function dispatchUploadChange(root: HTMLElement) {
  const state = getUploadState(root);
  root.dispatchEvent(new CustomEvent("tbf:upload-change", {
        bubbles: true,
        detail: {
          cropData: state.cropData,
          entries: state.entries.slice(),
          files: state.entries.map((entry) => entry.file),
        },
  }));
}

function setUploadEntries(root: HTMLElement, entries: UploadEntry[], input?: HTMLInputElement | null) {
  const state = getUploadState(root);
  revokePreviewUrl(state);
  state.entries = entries.filter((entry) => entry.file instanceof File);
  state.file = state.entries.length === 1 ? state.entries[0].file : null;
  state.cropData = null;
  state.emptySelected = false;
  clearNativeInputs(root, input);
  setNativeInputFiles(input || null, state.entries);
  syncPreview(root);
  syncClearAndEmpty(root);
  dispatchUploadChange(root);
}

function setUploadFile(
  root: HTMLElement,
  input: HTMLInputElement | null,
  file: File | null,
  options: { cropData?: Record<string, number>|null; previewUrl?: string } = {},
) {
  const state = getUploadState(root);
  revokePreviewUrl(state);
  state.file = file instanceof File ? file : null;
  state.entries = state.file ? [{ file: state.file, path: state.file.name }] : [];
  state.cropData = options.cropData || null;
  state.emptySelected = false;
  if (options.previewUrl) state.previewUrl = options.previewUrl;
  else if (state.file && isImageFileObject(state.file) && typeof URL.createObjectURL === "function") {
    state.previewObjectUrl = URL.createObjectURL(state.file);
  }
  if (state.previewObjectUrl) state.previewUrl = state.previewObjectUrl;
  clearNativeInputs(root, input);
  setNativeInputFiles(input, state.entries);
  syncCropField(root, state.cropData);
  syncPreview(root);
  syncClearAndEmpty(root);
}

function syncCropField(root: HTMLElement, cropData: Record<string, number>|null) {
  const cropField = getCropField(root);
  if (cropField) cropField.value = cropData ? JSON.stringify(cropData) : "";
}

function clearUpload(root: HTMLElement, input?: HTMLInputElement | null) {
  const state = getUploadState(root);
  const restoreCurrent = Boolean(state.file && state.currentPreviewUrl);
  const canClearCurrent = state.currentPreviewClearable;
  revokePreviewUrl(state);
  state.file = null;
  state.entries = [];
  state.cropData = null;
  state.emptySelected = !restoreCurrent && canClearCurrent;
  if (state.emptySelected) state.currentPreviewUrl = "";
  clearNativeInputs(root, input || null);
  syncCropField(root, null);
  syncPreview(root);
  syncClearAndEmpty(root);
  dispatchUploadChange(root);
}

function getUploadEntries(root: HTMLElement | null) {
  return root instanceof HTMLElement ? getUploadState(root).entries.slice() : [];
}

function getUploadFiles(root: HTMLElement | null) {
  return getUploadEntries(root).map((entry) => entry.file);
}

export {
  clearUpload,
  dispatchUploadChange,
  getUploadEntries,
  getUploadFiles,
  getUploadState,
  revokePreviewUrl,
  setUploadEntries,
  setUploadFile,
  syncClearAndEmpty,
  syncPreview,
};
