import { escapeHtml, jsonScriptPayload, toText } from "./text.js";
import { uploadModel } from "./model.js";
import type { UploadFieldOptions } from "./types.js";
import { frontendClassName, frontendDataAttr, frontendElementClass } from "#5vbaqj4pirp3";

const directoryPickerAttrs = " webkitdirectory directory";

function iconHtml(spec: string) {
  return spec
  ? `<i aria-hidden="true" class="${frontendClassName("icon")} icon-glyph"${data("icon", spec)}></i>`
  : "";
}

function attr(name: string, value: unknown) {
  const text = toText(value);
  return text ? ` ${name}="${escapeHtml(text)}"` : "";
}

function boolAttr(name: string, enabled: boolean) {
  return enabled ? ` ${name}` : "";
}

function data(name: string, value: unknown = "") {
  const attrName = frontendDataAttr(name);
  const text = toText(value);
  return text ? ` ${attrName}="${escapeHtml(text)}"` : ` ${attrName}`;
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
      `<input class="${frontendElementClass("upload", "input")}"${data("upload-slot", "native-file")}`,
      `id="${escapeHtml(model.id)}_input" type="file" name="${escapeHtml(model.name)}"`,
      `${boolAttr("multiple", model.allowMultiple)}${attr("accept", model.accept)}>`,
    ].join(" "),
    model.allowDirectory || model.allowMixedPicker
    ? [
      `<input class="${frontendElementClass("upload", "input")}"${data("upload-slot", "native-directory")}`,
      `id="${escapeHtml(model.id)}_directory" type="file" name="${escapeHtml(model.name)}"`,
      `multiple${directoryPickerAttrs}>`,
    ].join(" ")
    : "",
    model.name && model.crop
    ? `<input type="hidden" name="${escapeHtml(model.name)}_crop" value=""${data("upload-slot", "crop-field")}>`
    : "",
  ].join("");
}

function preview(model: ReturnType<typeof uploadModel>) {
  if (!model.previewEnabled) return "";
  const src = attr("src", model.previewUrl);
  return [
    [
      `<div class="${frontendElementClass("upload", "preview")}"${data("upload-slot", "preview")}`,
      data("upload-preview-shape", model.previewShape),
      `${model.previewUrl ? "" : " hidden"}>`,
    ].join(" "),
    [
      `<img class="${frontendElementClass("upload", "preview-image")}"${data("upload-slot", "preview-image")}`,
      `alt="${escapeHtml(model.previewAlt)}"${src}${model.previewUrl ? "" : " hidden"}>`,
    ].join(" "),
    [
      `<span class="${frontendElementClass("upload", "preview-empty")}"${data("upload-slot", "preview-empty")}`,
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
      uploadRemoteAction(model),
      uploadClearButton(model),
    ].join("");
  }
  const slot = model.allowDirectory ? "directory-trigger" : "trigger";
  return [
    uploadButton(slot, model.triggerLabel, model.triggerIconSpec),
    uploadRemoteAction(model),
    uploadClearButton(model),
  ].join("");
}

function uploadButton(slot: string, label: string, iconSpec: string) {
  return [
    `<button class="btn" type="button"${data("upload-slot", slot)}>`,
    iconHtml(iconSpec),
    `<span>${escapeHtml(label)}</span>`,
    "</button>",
  ].join("");
}

function uploadRemoteAction(model: ReturnType<typeof uploadModel>) {
  const action = model.remoteAction;
  if (!action) return "";
  return [
    '<button class="btn" type="button"',
    attr("id", action.id),
    attr("aria-label", action.ariaLabel),
    attr("name", action.name),
    attr("value", action.value),
    data("upload-slot", "remote-action"),
    data(
      "upload-hide-when-selected",
      action.hiddenWhenSelected ? "true" : "false",
    ),
    ">",
    iconHtml(action.iconSpec),
    `<span>${escapeHtml(action.label)}</span>`,
    "</button>",
  ].join(" ");
}

function uploadClearButton(model: ReturnType<typeof uploadModel>) {
  const hidden = model.canClearCurrentPreview ? "" : " hidden";
  return [
    '<button class="btn" type="button"',
    `${data("upload-slot", "clear")}${hidden}>`,
    iconHtml(model.clearIconSpec),
    `<span>${escapeHtml(model.clearLabel)}</span>`,
    "</button>",
  ].join(" ");
}

function uploadHintHtml(value: string, slot?: string) {
  const escapedValue = escapeHtml(value);
  const slotAttribute = slot ? data("upload-slot", slot) : "";
  return `<span class="${frontendElementClass("upload", "hint")}"${slotAttribute} title="${escapedValue}">${escapedValue}</span>`;
}

function uploadFilenameHtml(value: string) {
  const escapedValue = escapeHtml(value);
  return `<span class="${frontendElementClass("upload", "filename")}"${data("upload-slot", "filename")}>${escapedValue}</span>`;
}

function helperLines(model: ReturnType<typeof uploadModel>) {
  return [
    uploadFilenameHtml(model.emptyLabel),
    model.dropHint ? uploadHintHtml(model.dropHint) : "",
    model.helperText ? uploadHintHtml(model.helperText) : "",
    model.formatsText ? uploadHintHtml(model.formatsText, "formats") : "",
    `<ul class="${frontendElementClass("upload", "list")}"${data("upload-slot", "list")}></ul>`,
  ].join("");
}

function emptyToggle(model: ReturnType<typeof uploadModel>) {
  if (!model.emptyToggle?.name) return "";
  const value = model.emptyToggle.checked === true
  ? toText(model.emptyToggle.value, "1")
  : "0";
  return `<input type="hidden" name="${escapeHtml(model.emptyToggle.name)}" value="${escapeHtml(value)}"${data("upload-slot", "empty-toggle")}>`;
}

function uploadFieldHtml(options: UploadFieldOptions) {
  const model = uploadModel(options);
  return [
    `<script${data("upload-config")} hidden type="application/json">${jsonScriptPayload(uploadConfigPayload(model))}</script>`,
    nativeInputs(model),
    `<div class="${frontendElementClass("upload", "surface")}"${data("upload-slot", "shell")}>`,
    preview(model),
    `<div class="${frontendElementClass("upload", "content")}">`,
    `<div class="${frontendElementClass("upload", "actions")}">${triggerButtons(model)}</div>`,
    `<div class="${frontendElementClass("upload", "meta")}">${helperLines(model)}</div>`,
    "</div>",
    "</div>",
    emptyToggle(model),
  ].join("");
}

function createUploadField(options: UploadFieldOptions) {
  const model = uploadModel(options);
  const root = document.createElement("div");
  root.id = model.id;
  root.className = frontendClassName("upload");
  root.setAttribute(frontendDataAttr("upload"), "");
  root.setAttribute(frontendDataAttr("upload-empty"), model.emptyLabel);
  if (model.allowDrop) root.setAttribute(frontendDataAttr("upload-drop"), "true");
  root.innerHTML = uploadFieldHtml({ ...options, id: model.id });
  return root;
}

export { createUploadField, uploadConfigPayload, uploadFieldHtml };
