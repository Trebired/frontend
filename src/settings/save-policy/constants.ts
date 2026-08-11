import type { SavePolicyLabels } from "./types.js";

const DEFAULT_UNSAVED_FLASH_ID = "tbf-save-policy-unsaved";

const defaultSavePolicyLabels: Required<SavePolicyLabels> = {
  blockedFormDescription: "Use the page save action.",
  blockedFormMessage: "This form cannot be submitted separately.",
  unsavedDescription: "Save before leaving this page.",
  unsavedMessage: "Unsaved changes.",
};

export { DEFAULT_UNSAVED_FLASH_ID, defaultSavePolicyLabels };
