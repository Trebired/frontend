import { uploadRootConfig } from "./config.js";
import { isImageFileObject } from "./files.js";

const MAX_CROP_WORKING_DIMENSION = 2048;
const MAX_CROP_PREVIEW_DIMENSION = 512;

function shouldCrop(root: HTMLElement, file: File) {
  if (!isImageFileObject(file)) return false;
  const config = uploadRootConfig(root);
  return config.crop === true || Number.isFinite(parseAspectRatio(config.aspect));
}

function parseAspectRatio(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return Number.NaN;
  const parts = text.split(":").map(Number);
  if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
    return parts[0] / parts[1];
  }
  const number = Number(text);
  return Number.isFinite(number) && number > 0 ? number : Number.NaN;
}

function buildCropData(cropper: any, scale: { scaleX?: number; scaleY?: number } | null = null) {
  if (!cropper || typeof cropper.getData !== "function") return null;
  const data = cropper.getData();
  if (!data || typeof data !== "object") return null;
  const scaleX = Number(scale?.scaleX) > 0 ? Number(scale?.scaleX) : 1;
  const scaleY = Number(scale?.scaleY) > 0 ? Number(scale?.scaleY) : 1;
  return {
    height: Math.max(0, (Number(data.height) || 0) * scaleY),
    width: Math.max(0, (Number(data.width) || 0) * scaleX),
    x: (Number(data.x) || 0) * scaleX,
    y: (Number(data.y) || 0) * scaleY,
  };
}

function fitDimensions(width: number, height: number, maxDimension: number) {
  if (!(width > 0) || !(height > 0)) return null;
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return {
    height: Math.max(1, Math.round(height * scale)),
    width: Math.max(1, Math.round(width * scale)),
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, type = "image/png", quality?: number) {
  return new Promise<Blob | null>((resolve) => {
      try {
        canvas.toBlob((blob) => resolve(blob || null), type, quality);
      } catch {
        resolve(null);
      }
  });
}

function safeObjectUrl(blob: Blob | File | null) {
  if (!(blob instanceof Blob)) return "";
  if (typeof URL.createObjectURL !== "function") return "";
  try {
    return URL.createObjectURL(blob);
  } catch {
    return "";
  }
}

function renderResizedCanvas(source: CanvasImageSource, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, width, height);
  return canvas;
}

function cropSourceResult(imageUrl: string, scaleX = 1, scaleY = 1) {
  return {
    imageUrl,
    revoke() {
      if (imageUrl && typeof URL.revokeObjectURL === "function") URL.revokeObjectURL(imageUrl);
    },
    scaleX,
    scaleY,
  };
}

async function prepareCropSource(file: File) {
  const fallbackUrl = safeObjectUrl(file);
  if (typeof createImageBitmap !== "function") return cropSourceResult(fallbackUrl);
  const bitmap = await createImageBitmap(file);
  try {
    const size = fitDimensions(bitmap.width, bitmap.height, MAX_CROP_WORKING_DIMENSION);
    if (!size || (size.width === bitmap.width && size.height === bitmap.height)) {
      return cropSourceResult(fallbackUrl);
    }
    const canvas = renderResizedCanvas(bitmap, size.width, size.height);
    const blob = canvas ? await canvasToBlob(canvas, file.type || "image/png") : null;
    if (!(blob instanceof Blob)) return cropSourceResult(fallbackUrl);
    if (fallbackUrl && typeof URL.revokeObjectURL === "function") URL.revokeObjectURL(fallbackUrl);
    return cropSourceResult(
      safeObjectUrl(blob),
      bitmap.width / size.width,
      bitmap.height / size.height,
    );
  } finally {
    bitmap.close?.();
  }
}

async function canvasToPreviewUrl(canvas: HTMLCanvasElement, type: string) {
  const size = fitDimensions(canvas.width, canvas.height, MAX_CROP_PREVIEW_DIMENSION);
  const preview = size && (size.width !== canvas.width || size.height !== canvas.height)
  ? renderResizedCanvas(canvas, size.width, size.height)
  : canvas;
  const blob = preview ? await canvasToBlob(preview, type || "image/png") : null;
  if (!(blob instanceof Blob)) throw new Error("Missing crop preview.");
  return safeObjectUrl(blob);
}

export {
  buildCropData,
  canvasToPreviewUrl,
  parseAspectRatio,
  prepareCropSource,
  shouldCrop,
};
