import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { flash as defaultFlash } from "#33o6e7mug9pg";
import { uploadRootConfig } from "./config.js";
import {
  getClear,
  getDirectoryInput,
  getDirectoryTrigger,
  getFileTrigger,
  getTrigger,
  getUploadFileInput,
  setNativeInputFiles,
} from "./dom.js";
import {
  closestDropRoot,
  dataTransferHasFiles,
  hasSkippedDirectory,
  preventFileDragDefault,
  readDropEntries,
  relatedTargetInside,
  skippedDirectoryNames,
} from "./drop.js";
import { inputEntries, isImageFileObject, matchesAccept, parseAcceptList } from "./files.js";
import { shouldCrop } from "./crop.js";
import {
  clearUpload,
  dispatchUploadChange,
  getUploadEntries,
  getUploadFiles,
  setUploadEntries as writeUploadEntries,
  setUploadFile,
  syncClearAndEmpty,
  syncPreview,
} from "./state.js";
import type { UploadEntry, UploadRuntimeOptions } from "./types.js";

const UPLOAD_SELECTOR = "[data-tbf-upload]";
const boundUploadRoots = new WeakSet<HTMLElement>();
const rootOptions = new WeakMap<HTMLElement, UploadRuntimeOptions>();
let booted = false;
let documentDropGuardBound = false;

function flashFor(options: UploadRuntimeOptions = {}) {
  return options.flash || defaultFlash;
}

function optionsFor(root: HTMLElement, options: UploadRuntimeOptions = {}) {
  const next = { ...(rootOptions.get(root) || {}), ...options };
  rootOptions.set(root, next);
  return next;
}

function acceptListFor(root: HTMLElement, input: HTMLInputElement | null) {
  return parseAcceptList(uploadRootConfig(root).formats || input?.accept || "");
}

function normalizeEntries(root: HTMLElement, entries: UploadEntry[]) {
  const skipped = skippedDirectoryNames(root);
  return entries.filter((entry) => {
    if (!(entry?.file instanceof File)) return false;
    const path = String(entry.path || entry.file.name || "").trim();
    return Boolean(path) && !hasSkippedDirectory(path, skipped);
  }).map((entry) => ({ file: entry.file, path: entry.path || entry.file.name }));
}

function rejectInvalidEntries(
  root: HTMLElement,
  input: HTMLInputElement | null,
  entries: UploadEntry[],
  options: UploadRuntimeOptions,
) {
  const acceptList = acceptListFor(root, input);
  if (!acceptList.length || entries.every((entry) => matchesAccept(entry.file, acceptList))) {
    return false;
  }
  const config = uploadRootConfig(root);
  flashFor(options).warn?.(config.formatNotAllowedMessage, config.formatNotAllowedDescription);
  restoreNativeInput(root, input);
  return true;
}

function restoreNativeInput(root: HTMLElement, input: HTMLInputElement | null) {
  const entries = getUploadEntries(root);
  if (!input) return false;
  return entries.length ? setNativeInputFiles(input, entries) : clearInput(input);
}

function clearInput(input: HTMLInputElement | null) {
  if (!input) return false;
  input.value = "";
  return true;
}

function setSelectedEntries(
  root: HTMLElement,
  input: HTMLInputElement | null,
  entries: UploadEntry[],
  options: UploadRuntimeOptions = {},
) {
  const normalized = normalizeEntries(root, entries);
  if (rejectInvalidEntries(root, input, normalized, options)) return false;
  writeUploadEntries(root, normalized, input);
  return true;
}

async function setSelectedSingleFile(
  root: HTMLElement,
  input: HTMLInputElement | null,
  file: File,
  trigger: HTMLElement | null,
  options: UploadRuntimeOptions,
) {
  if (rejectInvalidEntries(root, input, [{ file, path: file.name }], options)) return false;
  if (shouldCrop(root, file)) return await requestCrop(root, input, file, trigger, options);
  setUploadFile(root, input, file);
  dispatchUploadChange(root);
  return true;
}

async function requestCrop(
  root: HTMLElement,
  input: HTMLInputElement | null,
  file: File,
  trigger: HTMLElement | null,
  options: UploadRuntimeOptions,
) {
  if (!isImageFileObject(file)) {
    const config = uploadRootConfig(root);
    flashFor(options).warn?.(config.cropImageOnlyMessage, config.cropImageOnlyDescription);
    restoreNativeInput(root, input);
    return false;
  }
  const ok = await openUploadCropSession(root, input, file, trigger, options);
  if (!ok) restoreNativeInput(root, input);
  return ok;
}

async function handleFileSelection(
  root: HTMLElement,
  input: HTMLInputElement | null,
  trigger: HTMLElement | null,
  options: UploadRuntimeOptions,
) {
  const entries = inputEntries(input);
  if (!entries.length) return false;
  const config = uploadRootConfig(root);
  const multi = config.allowDirectory || config.allowMultiple || input?.multiple === true;
  if (multi || entries.length > 1) return setSelectedEntries(root, input, entries, options);
  return await setSelectedSingleFile(root, input, entries[0].file, trigger, options);
}

function bindUploadTriggers(root: HTMLElement) {
  const input = getUploadFileInput(root);
  getTrigger(root)?.addEventListener("click", () => input?.click());
  getFileTrigger(root)?.addEventListener("click", () => input?.click());
  getDirectoryTrigger(root)?.addEventListener("click", () => getDirectoryInput(root)?.click());
}

function bindUploadInputs(root: HTMLElement, options: UploadRuntimeOptions) {
  const input = getUploadFileInput(root);
  const directoryInput = getDirectoryInput(root);
  const trigger = getTrigger(root) || getFileTrigger(root) || getDirectoryTrigger(root);
  input?.addEventListener("change", () => void handleFileSelection(root, input, trigger, options));
  directoryInput?.addEventListener("change", () => {
    void handleFileSelection(root, directoryInput, getDirectoryTrigger(root) || trigger, options);
  });
}

function bindUploadClear(root: HTMLElement) {
  const clear = getClear(root);
  clear?.addEventListener("click", (event) => {
    event.preventDefault();
    clearUpload(root, getUploadFileInput(root));
  });
}

function bindDocumentDropGuard() {
  if (documentDropGuardBound || typeof document === "undefined") return;
  documentDropGuardBound = true;
  document.addEventListener("dragover", guardDocumentDrag, true);
  document.addEventListener("drop", guardDocumentDrop, true);
  document.addEventListener("dragend", () => clearDraggingUploads(document), true);
}

function guardDocumentDrag(event: DragEvent) {
  if (!dataTransferHasFiles(event.dataTransfer) || closestDropRoot(event.target)) return;
  preventFileDragDefault(event, "none");
}

function guardDocumentDrop(event: DragEvent) {
  if (!dataTransferHasFiles(event.dataTransfer)) return;
  if (!closestDropRoot(event.target)) preventFileDragDefault(event, "none");
  clearDraggingUploads(document);
}

function clearDraggingUploads(root: BindRoot = document) {
  queryAll<HTMLElement>(root, UPLOAD_SELECTOR).forEach((element) => {
    element.removeAttribute("data-tbf-upload-drag");
  });
}

function bindUploadDrop(root: HTMLElement, options: UploadRuntimeOptions) {
  if (uploadRootConfig(root).allowDrop !== true) return;
  bindDocumentDropGuard();
  root.addEventListener("dragenter", (event) => handleUploadDrag(root, event, true));
  root.addEventListener("dragover", (event) => handleUploadDrag(root, event, true));
  root.addEventListener("dragleave", (event) => {
    if (!relatedTargetInside(root, event.relatedTarget)) handleUploadDrag(root, event, false);
  });
  root.addEventListener("drop", (event) => void handleUploadDrop(root, event, options));
}

function handleUploadDrag(root: HTMLElement, event: DragEvent, active: boolean) {
  if (!preventFileDragDefault(event, "copy")) return false;
  event.stopPropagation();
  root.toggleAttribute("data-tbf-upload-drag", active);
  return true;
}

async function handleUploadDrop(root: HTMLElement, event: DragEvent, options: UploadRuntimeOptions) {
  if (!handleUploadDrag(root, event, false)) return false;
  const entries = await readDropEntries(root, event.dataTransfer);
  if (!entries.length) return false;
  const input = getUploadFileInput(root);
  const config = uploadRootConfig(root);
  if (config.allowDirectory || config.allowDropDirectory || config.allowMultiple || entries.length > 1) {
    return setSelectedEntries(root, input, entries, options);
  }
  return await setSelectedSingleFile(root, input, entries[0].file, getTrigger(root), options);
}

function bindUploadRoot(root: HTMLElement | null, options: UploadRuntimeOptions = {}) {
  if (!(root instanceof HTMLElement)) return false;
  const runtimeOptions = optionsFor(root, options);
  if (boundUploadRoots.has(root)) return true;
  if (!getUploadFileInput(root)) return false;
  boundUploadRoots.add(root);
  uploadRootConfig(root);
  bindUploadTriggers(root);
  bindUploadInputs(root, runtimeOptions);
  bindUploadClear(root);
  bindUploadDrop(root, runtimeOptions);
  syncPreview(root);
  syncClearAndEmpty(root);
  return true;
}

function bindUploads(root: BindRoot = document, options: UploadRuntimeOptions = {}) {
  queryAll<HTMLElement>(root, UPLOAD_SELECTOR).forEach((element) => {
    bindUploadRoot(element, options);
  });
}

function clearUploadRoot(root: HTMLElement | null) {
  if (!(root instanceof HTMLElement)) return false;
  clearUpload(root, getUploadFileInput(root));
  return true;
}

function setManagerEntries(root: HTMLElement | null, entries: UploadEntry[]) {
  if (!(root instanceof HTMLElement)) return false;
  return setSelectedEntries(root, getUploadFileInput(root), entries, rootOptions.get(root) || {});
}

function bootUploadManager(options: UploadRuntimeOptions = {}) {
  if (!booted) booted = true;
  if (typeof document !== "undefined") bindUploads(document, options);
  return uploadManager;
}

function setUploadFiles(root: HTMLElement | null, files: File[]) {
  if (!(root instanceof HTMLElement)) return false;
  return setManagerEntries(root, files.map((file) => ({ file, path: file.name })));
}

async function openUploadCropSession(
  root: HTMLElement,
  input: HTMLInputElement | null,
  file: File,
  trigger: HTMLElement | null = null,
  options: UploadRuntimeOptions = {},
) {
  const mod = await import("./crop-session.js");
  return await mod.openUploadCropSession(root, input, file, trigger, optionsFor(root, options));
}

const uploadManager = Object.freeze({
  bind: bindUploadRoot,
  bindAll: bindUploads,
  boot: bootUploadManager,
  clear: clearUploadRoot,
  getEntries: getUploadEntries,
  getFiles: getUploadFiles,
  openCrop: openUploadCropSession,
  setEntries: setManagerEntries,
  setFiles: setUploadFiles,
});

export {
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
};
export default uploadManager;
