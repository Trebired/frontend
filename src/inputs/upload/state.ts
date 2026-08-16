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
  getRemoteActions,
  getRemoteField,
  setNativeInputFiles,
} from "./dom.js";
import { fileExtension, isImageFileObject } from "./files.js";
import { uploadRootConfig } from "./config.js";
import { toText } from "./text.js";
import type { UploadEntry, UploadRemoteSelection, UploadState } from "./types.js";
import { frontendDataAttr, frontendEventName } from "#5vbaqj4pirp3";

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
    remoteLabel: "",
    remoteSelected: false,
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

function selectedName(
  state: UploadState,
  entries: UploadEntry[],
  file: File | null,
  emptyLabel: string,
) {
  if (entries.length > 1) return `${entries.length} files selected`;
  if (entries.length === 1) return entries[0].path || entries[0].file.name;
  if (state.remoteSelected) return state.remoteLabel || emptyLabel;
  return file?.name || emptyLabel;
}

function previewFallback(state: UploadState, entries: UploadEntry[], file: File | null) {
  if (entries.length > 1) return "Files";
  if (state.remoteSelected) return "File";
  const selected = file || entries[0]?.file || null;
  return fileExtension(selected).toUpperCase() || "File";
}

function currentPreviewUrl(state: UploadState) {
  if (state.previewUrl) return state.previewUrl;
  if (state.emptySelected) return "";
  return state.currentPreviewUrl;
}

function createPreviewObjectUrl(file: File) {
  if (typeof URL.createObjectURL !== "function") return "";
  try {
    return URL.createObjectURL(file);
  } catch {
    return "";
  }
}

function syncPreview(root: HTMLElement) {
  const state = getUploadState(root);
  const config = uploadRootConfig(root);
  const entries = state.entries;
  const file = state.file || (entries.length === 1 ? entries[0].file : null);
  const hasSelection = Boolean(file || entries.length || state.remoteSelected);
  syncSelectedLabel(
    root,
    selectedName(state, entries, file, config.emptyLabel || ""),
    hasSelection,
  );
  syncList(root, entries);
  syncPreviewContent(
    root,
    state,
    entries,
    file,
    currentPreviewUrl(state),
    config.noPreview === true,
  );
  root.toggleAttribute(frontendDataAttr("upload-has-files"), hasSelection);
  root.setAttribute(frontendDataAttr("upload-has-files"), hasSelection ? "true" : "false");
  root.setAttribute(frontendDataAttr("upload-entry-count"), String(entries.length));
}

function syncSelectedLabel(root: HTMLElement, label: string, hasSelection: boolean) {
  const node = getFileNameNode(root);
  if (!node) return;
  node.textContent = label;
  if (hasSelection) node.title = label;
  else node.removeAttribute("title");
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
  state: UploadState,
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
    empty.textContent = previewFallback(state, entries, file);
  }
}

function syncClearAndEmpty(root: HTMLElement) {
  const state = getUploadState(root);
  const clear = getClear(root);
  const toggle = getEmptyToggle(root);
  const hasEntries =
  state.entries.length > 0 ||
    state.file instanceof File ||
    state.remoteSelected;
  const canClearCurrent = state.currentPreviewClearable && state.currentPreviewUrl && !state.emptySelected;
  if (clear) clear.hidden = !(hasEntries || canClearCurrent);
  getRemoteActions(root).forEach((action) => {
      const attr = frontendDataAttr("upload-hide-when-selected");
      const hideWhenSelected = action.getAttribute(attr) !== "false";
      action.hidden = hideWhenSelected && hasEntries;
  });
  if (toggle) toggle.value = state.emptySelected ? uploadRootConfig(root).emptyToggleValue || "1" : "0";
}

function dispatchUploadChange(root: HTMLElement) {
  const state = getUploadState(root);
  root.dispatchEvent(new CustomEvent(frontendEventName("upload-change"), {
        bubbles: true,
        detail: {
          cropData: state.cropData,
          entries: state.entries.slice(),
          files: state.entries.map((entry) => entry.file),
          previewUrl: currentPreviewUrl(state),
          remoteSelected: state.remoteSelected,
        },
  }));
}

function restoreUploadEntries(root: HTMLElement, entries: UploadEntry[], input?: HTMLInputElement | null) {
  const state = getUploadState(root);
  revokePreviewUrl(state);
  state.entries = entries.filter((entry) => entry.file instanceof File);
  state.file = state.entries.length === 1 ? state.entries[0].file : null;
  state.cropData = null;
  state.emptySelected = false;
  state.remoteLabel = "";
  state.remoteSelected = false;
  clearNativeInputs(root, input);
  setNativeInputFiles(input || null, state.entries);
  syncRemoteField(root, "", false);
  syncPreview(root);
  syncClearAndEmpty(root);
}

function setUploadEntries(root: HTMLElement, entries: UploadEntry[], input?: HTMLInputElement | null) {
  restoreUploadEntries(root, entries, input);
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
  state.remoteLabel = "";
  state.remoteSelected = false;
  if (options.previewUrl) state.previewUrl = options.previewUrl;
  else if (state.file && isImageFileObject(state.file)) state.previewObjectUrl = createPreviewObjectUrl(state.file);
  if (state.previewObjectUrl) state.previewUrl = state.previewObjectUrl;
  clearNativeInputs(root, input);
  setNativeInputFiles(input, state.entries);
  syncCropField(root, state.cropData);
  syncRemoteField(root, "", false);
  syncPreview(root);
  syncClearAndEmpty(root);
}

function syncCropField(root: HTMLElement, cropData: Record<string, number>|null) {
  const cropField = getCropField(root);
  if (cropField) cropField.value = cropData ? JSON.stringify(cropData) : "";
}

function syncRemoteField(root: HTMLElement, value: string, notify: boolean) {
  const field = getRemoteField(root);
  if (!field || field.value === value) return;
  field.value = value;
  if (!notify) return;
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
}

function remoteFieldLabel(root: HTMLElement) {
  const field = getRemoteField(root);
  return toText(
    field?.getAttribute(frontendDataAttr("upload-remote-label")),
    uploadRootConfig(root).remoteSelectedLabel || "",
  );
}

function remoteSelectionLabel(root: HTMLElement, label: unknown) {
  return toText(
    label,
    remoteFieldLabel(root) || uploadRootConfig(root).emptyLabel || "",
  );
}

function applyUploadRemoteSelection(
  root: HTMLElement,
  options: UploadRemoteSelection = {},
  effects: { dispatch?: boolean; field?: boolean } = {},
) {
  const previewUrl = toText(options.previewUrl);
  const label = remoteSelectionLabel(root, options.label);
  if (!previewUrl && !label) return false;
  const state = getUploadState(root);
  revokePreviewUrl(state);
  state.file = null;
  state.entries = [];
  state.cropData = options.cropData || null;
  state.emptySelected = false;
  state.previewUrl = previewUrl;
  state.remoteLabel = label;
  state.remoteSelected = true;
  clearNativeInputs(root, null);
  syncCropField(root, state.cropData);
  if (effects.field !== false) syncRemoteField(root, previewUrl, true);
  syncPreview(root);
  syncClearAndEmpty(root);
  if (effects.dispatch !== false) dispatchUploadChange(root);
  return true;
}

function restoreUploadRemoteSelection(root: HTMLElement) {
  const previewUrl = toText(getRemoteField(root)?.value);
  if (!previewUrl) return false;
  return applyUploadRemoteSelection(
    root,
    { cropData: null, label: remoteFieldLabel(root), previewUrl },
    { dispatch: false, field: false },
  );
}

function setUploadRemoteSelection(
  root: HTMLElement,
  options: UploadRemoteSelection = {},
) {
  return applyUploadRemoteSelection(root, options);
}

function clearUpload(root: HTMLElement, input?: HTMLInputElement | null) {
  const state = getUploadState(root);
  const restoreCurrent = Boolean((state.file || state.remoteSelected) && state.currentPreviewUrl);
  const canClearCurrent = state.currentPreviewClearable;
  revokePreviewUrl(state);
  state.file = null;
  state.entries = [];
  state.cropData = null;
  state.emptySelected = !restoreCurrent && canClearCurrent;
  state.remoteLabel = "";
  state.remoteSelected = false;
  if (state.emptySelected) state.currentPreviewUrl = "";
  clearNativeInputs(root, input || null);
  syncCropField(root, null);
  syncRemoteField(root, "", true);
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
  restoreUploadEntries,
  restoreUploadRemoteSelection,
  setUploadEntries,
  setUploadFile,
  setUploadRemoteSelection,
  syncClearAndEmpty,
  syncPreview,
};
