import { formatLabels, isImageAcceptItem, parseAcceptList } from "./files.js";
import { toText } from "./text.js";
import type { UploadEmptyToggle, UploadFieldOptions } from "./types.js";

type UploadModel = ReturnType<typeof uploadModel>;

function uploadId(id?: string) {
  return toText(id) || `tbf_upload_${Math.random().toString(36).slice(2, 10)}`;
}

function uploadEmptyToggle(input: UploadEmptyToggle | undefined) {
  return input && typeof input === "object" ? input : null;
}

function uploadAcceptModel(options: UploadFieldOptions) {
  const accept = toText(options.formats || options.accept);
  const items = parseAcceptList(accept);
  const labels = formatLabels(items);
  const previewEnabled =
    options.preview === true ||
    (options.preview !== false && (Boolean(options.previewUrl) || items.some(isImageAcceptItem)));
  return {
    accept,
    formatsText: labels.length ? `Accepted formats: ${labels.join(", ")}` : "",
    previewEnabled,
  };
}

function uploadLabels(options: UploadFieldOptions) {
  return {
    clearLabel: toText(options.clearLabel, "Clear"),
    cropFailedMessage: toText(options.cropFailedMessage, "Failed to crop the selected image."),
    cropImageOnlyDescription: toText(options.cropImageOnlyDescription, "Choose an accepted image file."),
    cropImageOnlyMessage: toText(options.cropImageOnlyMessage, "Only image files can be cropped."),
    directoryOptionLabel: toText(options.directoryOptionLabel, "Choose folder"),
    emptyLabel: toText(options.emptyLabel, "No file selected"),
    fileOptionLabel: toText(options.fileOptionLabel, "Choose file"),
    formatNotAllowedDescription: toText(options.formatNotAllowedDescription, "Choose an accepted file format."),
    formatNotAllowedMessage: toText(options.formatNotAllowedMessage, "File format not allowed."),
    modalDescription: toText(options.modalDescription, "Adjust the crop before saving."),
    modalTitle: toText(options.modalTitle, "Crop image"),
    previewAlt: toText(options.previewAlt, "Selected upload preview"),
    previewEmptyText: "Upload preview",
    triggerLabel: toText(options.triggerLabel, "Choose file"),
    useImageLabel: toText(options.useImageLabel, "Use image"),
  };
}

function pickerModel(options: UploadFieldOptions) {
  return {
    allowDirectory: options.directory === true,
    allowDrop: options.drop === true,
    allowDropDirectory: options.dropDirectory === true,
    allowMixedPicker: options.mixedPicker === true,
    allowMultiple: options.multiple === true,
  };
}

function uploadModel(options: UploadFieldOptions) {
  const accept = uploadAcceptModel(options);
  const labels = uploadLabels(options);
  const picker = pickerModel(options);
  const emptyToggle = uploadEmptyToggle(options.emptyToggle);
  return {
    ...accept,
    ...labels,
    ...picker,
    aspect: toText(options.aspect),
    canClearCurrentPreview: Boolean(emptyToggle && options.previewUrl),
    crop: options.crop === true,
    dropHint: picker.allowDrop
      ? picker.allowDropDirectory || picker.allowDirectory
        ? "Drop files or folders here"
        : "Drop files here"
      : "",
    emptyToggle,
    helperText: toText(options.helperText),
    id: uploadId(options.id),
    name: toText(options.name),
    previewShape: toText(options.previewShape, "square") === "circle" ? "circle" : "square",
    previewUrl: toText(options.previewUrl),
    skipDirs: toText(options.skipDirs),
  };
}

export { uploadModel };
export type { UploadModel };
