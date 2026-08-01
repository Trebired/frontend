import Cropper from "cropperjs";
import {
  createElement as h,
  useEffect,
  useRef,
  type RefObject,
} from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { flash as defaultFlash } from "#33o6e7mug9pg";
import { closeModal, openModal, prepareModal } from "#8rm3pzkj3gge";
import { resolveFrontendLogger } from "#mhi409n0a05q";
import { uploadRootConfig } from "./config.js";
import {
  buildCropData,
  canvasToPreviewUrl,
  parseAspectRatio,
  prepareCropSource,
} from "./crop.js";
import { dispatchUploadChange, setUploadFile } from "./state.js";
import type { UploadRuntimeOptions } from "./types.js";

type CropperInstance = InstanceType<typeof Cropper>;
type CropSession = {
  aspectRatio: number;
  busy: boolean;
  description: string;
  file: File;
  imageUrl: string;
  input: HTMLInputElement | null;
  options: UploadRuntimeOptions;
  ready: boolean;
  revoke: () => void;
  root: HTMLElement;
  scale: { scaleX: number; scaleY: number };
  title: string;
  trigger: HTMLElement | null;
};

type CropperViewProps = CropSession & {
  onCancel: () => void;
  onConfirm: () => void;
  onReadyChange: (ready: boolean) => void;
  registerCropper: (cropper: CropperInstance | null) => void;
};

const CROP_MODAL_ID = "tbf_upload_crop_modal";
const CROP_MODAL_CONTENT_ID = "tbf_upload_crop_modal_content";
let modalElement: HTMLElement | null = null;
let modalContentElement: HTMLElement | null = null;
let modalRoot: Root | null = null;
let activeCropper: CropperInstance | null = null;
let activeSession: CropSession | null = null;

function loggerFor(options: UploadRuntimeOptions = {}) {
  return resolveFrontendLogger(options.logging as any);
}

function flashFor(options: UploadRuntimeOptions = {}) {
  return options.flash || defaultFlash;
}

function patchSession(patch: Partial<CropSession>) {
  if (!activeSession) return;
  activeSession = { ...activeSession, ...patch };
  renderCropModal();
}

function useUploadCropper(props: CropperViewProps, imageRef: RefObject<HTMLImageElement | null>) {
  useEffect(() => {
    if (!props.imageUrl || !imageRef.current) return undefined;
    const cropper = new Cropper(imageRef.current, {
      aspectRatio: Number.isFinite(props.aspectRatio) ? props.aspectRatio : Number.NaN,
      autoCropArea: 1,
      background: false,
      checkOrientation: false,
      dragMode: "move",
      guides: true,
      modal: true,
      responsive: true,
      restore: false,
      toggleDragModeOnDblclick: false,
      viewMode: 1,
      zoomable: true,
      ready() {
        props.onReadyChange(true);
      },
    });
    props.registerCropper(cropper);
    return () => {
      props.onReadyChange(false);
      props.registerCropper(null);
      cropper.destroy();
    };
  }, [imageRef, props.aspectRatio, props.imageUrl]);
}

function CropperView(props: CropperViewProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  useUploadCropper(props, imageRef);
  return h("div", { className: "tbf-upload-crop" },
    h("div", { className: "tbf-upload-crop__header" },
      h("h2", { className: "tbf-upload-crop__title" }, props.title),
      props.description
        ? h("p", { className: "tbf-upload-crop__description" }, props.description)
        : null,
    ),
    h("div", { className: "tbf-upload-crop__stage" },
      h("img", {
        alt: props.title,
        className: "tbf-upload-crop__image",
        ref: imageRef,
        src: props.imageUrl,
      }),
    ),
    h("div", { className: "tbf-upload-crop__actions" },
      h("button", {
        className: "tbf-upload__button",
        disabled: props.busy,
        onClick: props.onCancel,
        type: "button",
      }, "Cancel"),
      h("button", {
        className: "tbf-upload__button tbf-upload__button--strong",
        disabled: props.busy || !props.ready,
        onClick: props.onConfirm,
        type: "button",
      }, props.busy ? "Saving" : uploadRootConfig(props.root).useImageLabel),
    ),
  );
}

function ensureCropModalHost() {
  if (modalElement && modalContentElement && modalRoot) return true;
  modalElement = document.getElementById(CROP_MODAL_ID);
  modalContentElement = document.getElementById(CROP_MODAL_CONTENT_ID);
  if (!modalElement) createCropModalHost();
  if (modalElement && !modalContentElement) {
    modalContentElement = modalElement.querySelector("[data-tbf-modal-content]");
  }
  if (!modalElement || !modalContentElement) return false;
  prepareModal(modalElement);
  modalRoot ||= createRoot(modalContentElement);
  return true;
}

function createCropModalHost() {
  modalElement = document.createElement("div");
  modalElement.id = CROP_MODAL_ID;
  modalElement.className = "tbf-modal tbf-upload-cropper-modal";
  modalElement.setAttribute("data-tbf-modal", "");
  modalContentElement = document.createElement("div");
  modalContentElement.id = CROP_MODAL_CONTENT_ID;
  modalContentElement.className = "tbf-modal__content tbf-upload-cropper-modal__content";
  modalContentElement.setAttribute("data-tbf-modal-content", "");
  modalElement.appendChild(modalContentElement);
  document.body.appendChild(modalElement);
}

function renderCropModal(sync = false) {
  if (!modalRoot || !activeSession) return;
  const node = h(CropperView, {
    ...activeSession,
    onCancel: cancelCropSession,
    onConfirm: () => void confirmCropSession(),
    onReadyChange(ready: boolean) {
      patchSession({ ready });
    },
    registerCropper(cropper: CropperInstance | null) {
      activeCropper = cropper;
    },
  });
  if (sync) flushSync(() => modalRoot?.render(node));
  else modalRoot.render(node);
}

function closeCropSession() {
  activeSession?.revoke();
  activeSession = null;
  activeCropper = null;
  closeModal(modalElement);
}

function cancelCropSession() {
  closeCropSession();
}

function croppedCanvas(cropper: CropperInstance) {
  return cropper.getCroppedCanvas({
    fillColor: "#fff",
    imageSmoothingEnabled: true,
    imageSmoothingQuality: "high",
    maxHeight: 1024,
    maxWidth: 1024,
  });
}

async function confirmCropSession() {
  const session = activeSession;
  const cropper = activeCropper;
  if (!session || !cropper) return;
  patchSession({ busy: true });
  try {
    const cropData = buildCropData(cropper, session.scale);
    if (!cropData || cropData.width <= 0 || cropData.height <= 0) {
      throw new Error(uploadRootConfig(session.root).cropFailedMessage);
    }
    const previewUrl = await canvasToPreviewUrl(croppedCanvas(cropper), session.file.type || "image/png");
    setUploadFile(session.root, session.input, session.file, { cropData, previewUrl });
    dispatchUploadChange(session.root);
    loggerFor(session.options).info("upload.crop", "confirmed", { file: session.file.name });
    closeCropSession();
  } catch (error) {
    reportCropFailure(session, error);
    patchSession({ busy: false });
  }
}

function reportCropFailure(session: CropSession, error: unknown) {
  const config = uploadRootConfig(session.root);
  loggerFor(session.options).warn("upload.crop", "failed", {
    error: error instanceof Error ? error.message : String(error),
    file: session.file.name,
  });
  flashFor(session.options).error?.(config.cropFailedMessage, "");
}

async function openUploadCropSession(
  root: HTMLElement,
  input: HTMLInputElement | null,
  file: File,
  trigger: HTMLElement | null,
  options: UploadRuntimeOptions = {},
) {
  if (!ensureCropModalHost()) return false;
  const prepared = await prepareCropSource(file);
  if (!prepared.imageUrl) return false;
  const config = uploadRootConfig(root);
  activeSession = {
    aspectRatio: parseAspectRatio(config.aspect),
    busy: false,
    description: String(config.modalDescription || ""),
    file,
    imageUrl: prepared.imageUrl,
    input,
    options,
    ready: false,
    revoke: prepared.revoke,
    root,
    scale: { scaleX: prepared.scaleX, scaleY: prepared.scaleY },
    title: String(config.modalTitle || "Crop image"),
    trigger,
  };
  renderCropModal(true);
  openModal(modalElement, trigger);
  loggerFor(options).info("upload.crop", "opened", { file: file.name });
  return true;
}

export { CROP_MODAL_CONTENT_ID, CROP_MODAL_ID, openUploadCropSession };
