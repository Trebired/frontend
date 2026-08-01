import { parseJsonText, readElementJson } from "#er0dlx1gtbzh";
import { bool, toText } from "./text.js";
import type { UploadRootConfig } from "./types.js";

const UPLOAD_CONFIG_SELECTOR =
  'script[type="application/json"][data-tbf-upload-config]';

const DEFAULT_EMPTY_LABEL = "No file selected";

const uploadConfigs = new WeakMap<HTMLElement, UploadRootConfig>();

function normalizeUploadConfig(config: UploadRootConfig = {}) {
  return {
    allowDirectory: bool(config.allowDirectory),
    allowDrop: bool(config.allowDrop),
    allowDropDirectory: bool(config.allowDropDirectory),
    allowMixedPicker: bool(config.allowMixedPicker),
    allowMultiple: bool(config.allowMultiple),
    aspect: toText(config.aspect),
    canClearCurrentPreview: bool(config.canClearCurrentPreview),
    crop: bool(config.crop),
    cropFailedMessage: toText(config.cropFailedMessage, "Failed to crop the selected image."),
    cropImageOnlyDescription: toText(config.cropImageOnlyDescription, "Choose an accepted image file."),
    cropImageOnlyMessage: toText(config.cropImageOnlyMessage, "Only image files can be cropped."),
    currentPreviewUrl: toText(config.currentPreviewUrl),
    emptyLabel: toText(config.emptyLabel, DEFAULT_EMPTY_LABEL),
    emptyToggleValue: toText(config.emptyToggleValue, "1"),
    formatNotAllowedDescription: toText(config.formatNotAllowedDescription, "Choose an accepted file format."),
    formatNotAllowedMessage: toText(config.formatNotAllowedMessage, "File format not allowed."),
    formats: toText(config.formats),
    modalDescription: toText(config.modalDescription, "Adjust the crop before saving."),
    modalTitle: toText(config.modalTitle, "Crop image"),
    noPreview: bool(config.noPreview),
    skipDirs: toText(config.skipDirs),
    useImageLabel: toText(config.useImageLabel, "Use image"),
  } satisfies UploadRootConfig;
}

function readUploadConfig(root: HTMLElement | null) {
  if (!(root instanceof HTMLElement)) return normalizeUploadConfig();
  const fromScript = readElementJson<UploadRootConfig>(root, UPLOAD_CONFIG_SELECTOR, {});
  const fromAttr = parseJsonText<UploadRootConfig>(root.getAttribute("data-tbf-upload-config") || "", {});
  return normalizeUploadConfig({ ...fromScript, ...fromAttr });
}

function setUploadRootConfig(root: HTMLElement | null, config: UploadRootConfig = {}) {
  if (!(root instanceof HTMLElement)) return false;
  uploadConfigs.set(root, normalizeUploadConfig(config));
  return true;
}

function uploadRootConfig(root: HTMLElement | null) {
  if (!(root instanceof HTMLElement)) return normalizeUploadConfig();
  const config = uploadConfigs.get(root);
  if (config) return config;
  const next = readUploadConfig(root);
  uploadConfigs.set(root, next);
  return next;
}

function isUploadDropRoot(element: Element | null) {
  return element instanceof HTMLElement
    ? uploadRootConfig(element).allowDrop === true
    : false;
}

export {
  DEFAULT_EMPTY_LABEL,
  UPLOAD_CONFIG_SELECTOR,
  isUploadDropRoot,
  normalizeUploadConfig,
  readUploadConfig,
  setUploadRootConfig,
  uploadRootConfig,
};
export type { UploadRootConfig };
