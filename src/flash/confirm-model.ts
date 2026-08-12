import { normalizeFlashType } from "./duration.js";
import type {
  ConfirmModel,
  ConfirmOptions,
  ConfirmVariant,
  FlashType,
} from "./types.js";
import { toText as text } from "#ndsvdqv80epr";

function buildConfirmModel(
  message: unknown,
  description: unknown = "",
  options: ConfirmOptions = {},
): ConfirmModel {
  const opts = options && typeof options === "object" ? options : {};
  const variantModel = buildVariantConfirmModel(opts);
  if (variantModel) return variantModel;
  const confirmMode = normalizeConfirmMode(opts.confirmType || opts.confirmMode || opts.mode || "classic");
  const confirmationText = text(opts.confirmationText);
  return {
    cancelText: text(opts.cancelText, "Cancel"),
    confirmButtonText: text(opts.confirmButtonText || opts.confirmText, "OK"),
    confirmMode,
    confirmationText,
    description: text(description),
    isTextConfirm: confirmMode === "text" && Boolean(confirmationText),
    placeholder: text(opts.placeholder, confirmationText),
    progressTone: text(opts.progressTone || opts.progressType),
    title: text(message),
    type: normalizeFlashType(opts.type ||"info"),
  };
}

function buildVariantConfirmModel(options: ConfirmOptions): ConfirmModel | null {
  const variant = normalizeConfirmVariant(options.variant);
  if (!variant) return null;
  const subject = text(options.subject, "item");
  const target = text(options.target, subject);
  const confirmMode = normalizeConfirmMode(options.mode || options.confirmType || options.confirmMode || (
      variant === "delete" ? "text" : "classic"
  ));
  const confirmationText = confirmMode === "text"
  ? text(options.confirmationText, target)
  : "";
  const copy = variantCopy(variant, subject, target);
  return {
    cancelText: text(options.cancelText, "Cancel"),
    confirmButtonText: text(options.confirmButtonText || options.confirmText, copy.button),
    confirmMode,
    confirmationText,
    description: copy.description,
    isTextConfirm: confirmMode === "text" && Boolean(confirmationText),
    placeholder: text(options.placeholder, confirmationText),
    progressTone: text(options.progressTone || options.progressType),
    title: copy.title,
    type: copy.type,
  };
}

function variantCopy(variant: ConfirmVariant, subject: string, target: string) {
  if (variant === "delete") {
    return {
      button: "Delete",
      description: `This will permanently delete ${subject}.`,
      title: `Delete ${target}?`,
      type: "error"as FlashType,
    };
  }
  if (variant === "drop") {
    return {
      button: "Drop",
      description: `This will permanently drop ${subject}.`,
      title: `Drop ${target}?`,
      type: "error"as FlashType,
    };
  }
  return {
    button: "Archive",
    description: `This will archive ${subject}.`,
    title: `Archive ${target}?`,
    type: "warn"as FlashType,
  };
}

function normalizeConfirmVariant(value: unknown): ConfirmVariant | null {
  const variant = text(value).toLowerCase();
  return variant === "archive" || variant === "delete" || variant === "drop"
  ? variant
  : null;
}

function normalizeConfirmMode(value: unknown): "classic" | "text" {
  return text(value).toLowerCase() === "text" ? "text" : "classic";
}

export {
  buildConfirmModel,
  normalizeConfirmMode,
};
