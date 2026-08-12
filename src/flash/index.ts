import {
  FLASH_CONFIRM_TIMEOUT_MS,
  FLASH_PROMPT_TIMEOUT_MS,
  computeFlashDurationMs,
} from "./duration.js";
import {
  buildConfirmModel,
  confirm,
  confirmationVariantAttrs,
  confirmElement,
  hasElementConfirmRequest,
  prompt,
  readElementConfirmRequest,
} from "./dialogs.js";
import {
  dismissFlash,
  liveFlash,
  showFlash,
  showFlashImpl,
  showFlashMessage,
  stickyFlash,
} from "./toast.js";

(showFlash as any).info = (message: unknown, description = "", options = {}) =>
showFlashImpl("info", message, description, options);
(showFlash as any).success = (message: unknown, description = "", options = {}) =>
showFlashImpl("success", message, description, options);
(showFlash as any).warn = (message: unknown, description = "", options = {}) =>
showFlashImpl("warn", message, description, options);
(showFlash as any).error = (message: unknown, description = "", options = {}) =>
showFlashImpl("error", message, description, options);
(showFlash as any).sticky = stickyFlash;
(showFlash as any).stickyInfo = (message: unknown, description = "", options = {}) =>
stickyFlash("info", message, description, options);
(showFlash as any).stickySuccess = (message: unknown, description = "", options = {}) =>
stickyFlash("success", message, description, options);
(showFlash as any).stickyWarn = (message: unknown, description = "", options = {}) =>
stickyFlash("warn", message, description, options);
(showFlash as any).stickyError = (message: unknown, description = "", options = {}) =>
stickyFlash("error", message, description, options);
(showFlash as any).live = liveFlash;
(showFlash as any).liveInfo = (message: unknown, description = "", options = {}) =>
liveFlash("info", message, description, options);
(showFlash as any).liveSuccess = (message: unknown, description = "", options = {}) =>
liveFlash("success", message, description, options);
(showFlash as any).liveWarn = (message: unknown, description = "", options = {}) =>
liveFlash("warn", message, description, options);
(showFlash as any).liveError = (message: unknown, description = "", options = {}) =>
liveFlash("error", message, description, options);
(showFlash as any).dismiss = dismissFlash;
(showFlash as any).confirm = confirm;
(showFlash as any).prompt = prompt;
(showFlash as any).confirmElement = confirmElement;
(showFlash as any).computeFlashDurationMs = computeFlashDurationMs;

const flash = showFlash as typeof showFlash&Record<string, any>;

function installFlashGlobal(target?: Window&typeof globalThis) {
  const host = target || (typeof window !== "undefined" ? window : null);
  if (!host) return flash;
  (host as any).flash = flash;
  return flash;
}

if (typeof window !== "undefined") {
  installFlashGlobal(window);
}

export {
  buildConfirmModel,
  FLASH_CONFIRM_TIMEOUT_MS,
  FLASH_PROMPT_TIMEOUT_MS,
  computeFlashDurationMs,
  confirm,
  confirmationVariantAttrs,
  confirmElement,
  dismissFlash,
  flash,
  hasElementConfirmRequest,
  installFlashGlobal,
  liveFlash,
  prompt,
  readElementConfirmRequest,
  showFlash,
  stickyFlash,
  showFlashMessage,
};
export type {
  ConfirmationAttrsInput,
  ConfirmModel,
  ConfirmOptions,
  ConfirmVariant,
  FlashHandle,
  FlashOptions,
  FlashProgressTone,
  FlashStackPriority,
  FlashType,
  PromptOptions,
} from "./types.js";
export default flash;
