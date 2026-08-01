import type { UploadEntry } from "./types.js";

function uploadSlot(root: HTMLElement, ...slots: string[]) {
  for (const slot of slots) {
    const found = root.querySelector<HTMLElement>(`[data-tbf-upload-slot="${slot}"]`);
    if (found) return found;
  }
  return null;
}

function getUploadFileInput(root: HTMLElement) {
  return uploadSlot(root, "native-file", "input") as HTMLInputElement | null;
}

function getDirectoryInput(root: HTMLElement) {
  return uploadSlot(root, "native-directory") as HTMLInputElement | null;
}

function getTrigger(root: HTMLElement) {
  return uploadSlot(root, "trigger");
}

function getFileTrigger(root: HTMLElement) {
  return uploadSlot(root, "file-trigger");
}

function getDirectoryTrigger(root: HTMLElement) {
  return uploadSlot(root, "directory-trigger");
}

function getClear(root: HTMLElement) {
  return uploadSlot(root, "clear");
}

function getFileNameNode(root: HTMLElement) {
  return uploadSlot(root, "filename", "label");
}

function getListNode(root: HTMLElement) {
  return uploadSlot(root, "list");
}

function getPreviewNode(root: HTMLElement) {
  return uploadSlot(root, "preview");
}

function getPreviewImage(root: HTMLElement) {
  return uploadSlot(root, "preview-image") as HTMLImageElement | null;
}

function getPreviewEmpty(root: HTMLElement) {
  return uploadSlot(root, "preview-empty");
}

function getCropField(root: HTMLElement) {
  return uploadSlot(root, "crop-field") as HTMLInputElement | null;
}

function getEmptyToggle(root: HTMLElement) {
  return uploadSlot(root, "empty-toggle") as HTMLInputElement | null;
}

function setNativeInputFiles(input: HTMLInputElement | null, entries: UploadEntry[]) {
  if (!input) return false;
  if (!entries.length) {
    input.value = "";
    return true;
  }
  if (typeof DataTransfer !== "function") return false;
  const transfer = new DataTransfer();
  entries.forEach((entry) => transfer.items.add(entry.file));
  try {
    input.files = transfer.files;
    return true;
  } catch {
    return false;
  }
}

function clearNativeInputs(root: HTMLElement, except?: HTMLInputElement | null) {
  [getUploadFileInput(root), getDirectoryInput(root)].forEach((input) => {
    if (input && input !== except) input.value = "";
  });
}

export {
  clearNativeInputs,
  getClear,
  getCropField,
  getDirectoryInput,
  getDirectoryTrigger,
  getEmptyToggle,
  getFileNameNode,
  getFileTrigger,
  getListNode,
  getPreviewEmpty,
  getPreviewImage,
  getPreviewNode,
  getTrigger,
  getUploadFileInput,
  setNativeInputFiles,
  uploadSlot,
};
