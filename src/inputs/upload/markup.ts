import { escapeHtml, jsonScriptPayload, toText } from "./text.js";
import { uploadModel } from "./model.js";
import type { UploadFieldOptions } from "./types.js";

const directoryPickerAttrs = " webkitdirectory directory";

function iconHtml(spec: string) {
  return spec
  ? `<i aria-hidden="true" class="tbf-icon icon-glyph" data-tbf-icon="${escapeHtml(spec)}"></i>`
  : "";
}

function attr(name: string, value: unknown) {
  const text = toText(value);
  return text ? ` ${name}="${escapeHtml(text)}"` : "";
}

function boolAttr(name: string, enabled: boolean) {
  return enabled ? ` ${name}` : "";
}

function uploadConfigPayload(model: ReturnType<typeof uploadModel>) {
  return {
    allowDirectory: model.allowDirectory,
    allowDrop: model.allowDrop,
    allowDropDirectory: model.allowDropDirectory,
    allowMixedPicker: model.allowMixedPicker,
    allowMultiple: model.allowMultiple,
    aspect: model.aspect,
    canClearCurrentPreview: model.canClearCurrentPreview,
    crop: model.crop,
    cropFailedMessage: model.cropFailedMessage,
    cropImageOnlyDescription: model.cropImageOnlyDescription,
    cropImageOnlyMessage: model.cropImageOnlyMessage,
    currentPreviewUrl: model.previewUrl,
    emptyLabel: model.emptyLabel,
    emptyToggleValue: toText(model.emptyToggle?.value, "1"),
    formatNotAllowedDescription: model.formatNotAllowedDescription,
    formatNotAllowedMessage: model.formatNotAllowedMessage,
    formats: model.accept,
    modalDescription: model.modalDescription,
    modalTitle: model.modalTitle,
    noPreview: !model.previewEnabled,
    skipDirs: model.skipDirs,
    useImageLabel: model.useImageLabel,
  };
}

function nativeInputs(model: ReturnType<typeof uploadModel>) {
  return [
    [
      '<input class="tbf-upload__input" data-tbf-upload-slot="native-file"',
      `id="${escapeHtml(model.id)}_input" type="file" name="${escapeHtml(model.name)}"`,
      `${boolAttr("multiple", model.allowMultiple)}${attr("accept", model.accept)}>`,
    ].join(" "),
    model.allowDirectory || model.allowMixedPicker
    ? [
      '<input class="tbf-upload__input" data-tbf-upload-slot="native-directory"',
      `id="${escapeHtml(model.id)}_directory" type="file" name="${escapeHtml(model.name)}"`,
      `multiple${directoryPickerAttrs}>`,
    ].join(" ")
    : "",
    model.name && model.crop
    ? `<input type="hidden" name="${escapeHtml(model.name)}_crop" value="" data-tbf-upload-slot="crop-field">`
    : "",
  ].join("");
}

function preview(model: ReturnType<typeof uploadModel>) {
  if (!model.previewEnabled) return "";
  const src = attr("src", model.previewUrl);
  return [
    [
      '<div class="tbf-upload__preview" data-tbf-upload-slot="preview"',
      `data-tbf-upload-preview-shape="${escapeHtml(model.previewShape)}"`,
      `${model.previewUrl ? "" : " hidden"}>`,
    ].join(" "),
    [
      '<img class="tbf-upload__preview-image" data-tbf-upload-slot="preview-image"',
      `alt="${escapeHtml(model.previewAlt)}"${src}${model.previewUrl ? "" : " hidden"}>`,
    ].join(" "),
    [
      '<span class="tbf-upload__preview-empty" data-tbf-upload-slot="preview-empty"',
      `${model.previewUrl ? " hidden" : ""}>${escapeHtml(model.previewEmptyText)}</span>`,
    ].join(" "),
    "</div>",
  ].join("");
}

function triggerButtons(model: ReturnType<typeof uploadModel>) {
  if (model.allowMixedPicker) {
    return [
      uploadButton("file-trigger", model.fileOptionLabel, model.fileOptionIconSpec),
      uploadButton(
        "directory-trigger",
        model.directoryOptionLabel,
        model.directoryOptionIconSpec,
      ),
      uploadClearButton(model),
    ].join("");
  }
  const slot = model.allowDirectory ? "directory-trigger" : "trigger";
  return [
    uploadButton(slot, model.triggerLabel, model.triggerIconSpec),
    uploadClearButton(model),
  ].join("");
}

function uploadButton(slot: string, label: string, iconSpec: string) {
  return [
    `<button class="btn" type="button" data-tbf-upload-slot="${escapeHtml(slot)}">`,
    iconHtml(iconSpec),
    `<span>${escapeHtml(label)}</span>`,
    "</button>",
  ].join("");
}

function uploadClearButton(model: ReturnType<typeof uploadModel>) {
  const hidden = model.canClearCurrentPreview ? "" : " hidden";
  return [
    '<button class="btn" type="button"',
    `data-tbf-upload-slot="clear"${hidden}>`,
    iconHtml(model.clearIconSpec),
    `<span>${escapeHtml(model.clearLabel)}</span>`,
    "</button>",
  ].join(" ");
}

function uploadHintHtml(value: string, slot?: string) {
  const escapedValue = escapeHtml(value);
  const slotAttribute = slot ? ` data-tbf-upload-slot="${escapeHtml(slot)}"` : "";
  return `<span class="tbf-upload__hint"${slotAttribute} title="${escapedValue}">${escapedValue}</span>`;
}

function uploadFilenameHtml(value: string) {
  const escapedValue = escapeHtml(value);
  return [
    '<span class="tbf-upload__filename" data-tbf-upload-slot="filename"',
    `title="${escapedValue}">${escapedValue}</span>`,
  ].join(" ");
}

function helperLines(model: ReturnType<typeof uploadModel>) {
  return [
    uploadFilenameHtml(model.emptyLabel),
    model.dropHint ? uploadHintHtml(model.dropHint) : "",
    model.helperText ? uploadHintHtml(model.helperText) : "",
    model.formatsText ? uploadHintHtml(model.formatsText, "formats") : "",
    '<ul class="tbf-upload__list" data-tbf-upload-slot="list"></ul>',
  ].join("");
}

function emptyToggle(model: ReturnType<typeof uploadModel>) {
  if (!model.emptyToggle?.name) return "";
  const value = model.emptyToggle.checked === true
  ? toText(model.emptyToggle.value, "1")
  : "0";
  return `<input type="hidden" name="${escapeHtml(model.emptyToggle.name)}" value="${escapeHtml(value)}" data-tbf-upload-slot="empty-toggle">`;
}

function uploadFieldHtml(options: UploadFieldOptions) {
  const model = uploadModel(options);
  return [
    `<script data-tbf-upload-config hidden type="application/json">${jsonScriptPayload(uploadConfigPayload(model))}</script>`,
    nativeInputs(model),
    '<div class="tbf-upload__surface" data-tbf-upload-slot="shell">',
    preview(model),
    '<div class="tbf-upload__content">',
    `<div class="tbf-upload__actions">${triggerButtons(model)}</div>`,
    `<div class="tbf-upload__meta">${helperLines(model)}</div>`,
    "</div>",
    "</div>",
    emptyToggle(model),
  ].join("");
}

function createUploadField(options: UploadFieldOptions) {
  const model = uploadModel(options);
  const root = document.createElement("div");
  root.id = model.id;
  root.className = "tbf-upload";
  root.setAttribute("data-tbf-upload", "");
  root.setAttribute("data-tbf-upload-empty", model.emptyLabel);
  if (model.allowDrop) root.setAttribute("data-tbf-upload-drop", "true");
  root.innerHTML = uploadFieldHtml({ ...options, id: model.id });
  return root;
}

export { createUploadField, uploadConfigPayload, uploadFieldHtml };
