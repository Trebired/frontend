import { actionLabel } from "#qq0hbx8lfn3p";
import { FRONTEND_PREFIX } from "#5vbaqj4pirp3";
import { formatLabels, isImageAcceptItem, parseAcceptList } from "./files.js";
import { toText } from "./text.js";
import type { UploadEmptyToggle, UploadFieldOptions } from "./types.js";

type UploadModel = ReturnType<typeof uploadModel>;

const DEFAULT_UPLOAD_CLEAR_ICON = "remixicon:close-line";
const DEFAULT_UPLOAD_DIRECTORY_ICON = "remixicon:folder-upload-line";
const DEFAULT_UPLOAD_FILE_ICON = "remixicon:file-upload-line";

function uploadId(id?: string) {
  return toText(id) || `${FRONTEND_PREFIX}_upload_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeUploadEmptyToggle(input: UploadEmptyToggle | undefined) {
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
    clearLabel: actionLabel("remove", options.lang),
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

function uploadIcons(options: UploadFieldOptions) {
  return {
    clearIconSpec: toText(options.clearIconSpec, DEFAULT_UPLOAD_CLEAR_ICON),
    directoryOptionIconSpec: toText(
      options.directoryOptionIconSpec,
      DEFAULT_UPLOAD_DIRECTORY_ICON,
    ),
    fileOptionIconSpec: toText(options.fileOptionIconSpec, DEFAULT_UPLOAD_FILE_ICON),
    triggerIconSpec: toText(
      options.triggerIconSpec,
      options.directory === true ? DEFAULT_UPLOAD_DIRECTORY_ICON : DEFAULT_UPLOAD_FILE_ICON,
    ),
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
  const emptyToggle = normalizeUploadEmptyToggle(options.emptyToggle);
  return {
    ...accept,
    ...labels,
    ...uploadIcons(options),
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
