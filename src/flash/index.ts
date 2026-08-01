import {
  FLASH_CONFIRM_TIMEOUT_MS,
  FLASH_PROMPT_TIMEOUT_MS,
  computeFlashDurationMs,
} from "./duration.js";
import { confirm, confirmElement, prompt } from "./dialogs.js";
import { dismissFlash, liveFlash, showFlash, showFlashImpl, stickyFlash } from "./toast.js";

(showFlash as any).info = (message: unknown, description = "", options = {}) =>
  showFlashImpl("info", message, description, options);
(showFlash as any).success = (message: unknown, description = "", options = {}) =>
  showFlashImpl("success", message, description, options);
(showFlash as any).warn = (message: unknown, description = "", options = {}) =>
  showFlashImpl("warn", message, description, options);
(showFlash as any).error = (message: unknown, description = "", options = {}) =>
  showFlashImpl("error", message, description, options);
(showFlash as any).sticky = stickyFlash;
(showFlash as any).live = liveFlash;
(showFlash as any).dismiss = dismissFlash;
(showFlash as any).confirm = confirm;
(showFlash as any).prompt = prompt;
(showFlash as any).confirmElement = confirmElement;
(showFlash as any).computeFlashDurationMs = computeFlashDurationMs;

const flash = showFlash as typeof showFlash & Record<string, any>;

export {
  FLASH_CONFIRM_TIMEOUT_MS,
  FLASH_PROMPT_TIMEOUT_MS,
  computeFlashDurationMs,
  confirm,
  confirmElement,
  dismissFlash,
  flash,
  liveFlash,
  prompt,
  showFlash,
  stickyFlash,
};
export type {
  ConfirmOptions,
  FlashHandle,
  FlashOptions,
  FlashType,
  PromptOptions,
} from "./types.js";
export default flash;
