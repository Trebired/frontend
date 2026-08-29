import { flash as defaultFlash } from "#33o6e7mug9pg";
import {
  DEFAULT_UNSAVED_FLASH_ID,
  defaultSavePolicyLabels,
} from "./constants.js";
import {
  collectTrackedFields,
  formHasSubmitButton,
  isInsidePrimaryForm,
  isSpecialSettingsForm,
  isTrackedField,
  normalizeActionPath,
  normalizedPrimaryFormIds,
  serializeFieldValue,
} from "./fields.js";
import type {
  SavePolicyController,
  SavePolicyFlash,
  SavePolicyInput,
  SavePolicyState,
} from "./types.js";
import { frontendEventName } from "#5vbaqj4pirp3";
import { registerPageCleanup, registerUnsavedWork } from "#o9lroe7t0ma6";

const activeSavePolicies = new Set<SavePolicyController>();
const savePolicies = new WeakMap<HTMLElement, SavePolicyController>();
const savePolicyCleanups = new WeakMap<SavePolicyController, () => void>();
const blockedForms = new WeakSet<HTMLFormElement>();

function showUnsavedFlash(state: SavePolicyState) {
  /**
   * `update: true` replaces any existing toast sharing this id instead of
   * stacking a duplicate. Without it, the brief re-show inside `setSaving`
   * (dirty is still true for one tick before `captureBaseline` clears it) can
   * create a second element that `hideUnsavedFlash` never targets, since
   * dismissal only ever removes the first DOM match for the id.
   */
  return state.flash.stickyWarn?.(
    state.labels.unsavedMessage,
    state.labels.unsavedDescription,
    { id: DEFAULT_UNSAVED_FLASH_ID, stackPriority: "low", update: true },
  ) || null;
}

function hideUnsavedFlash(handle: { hide?: () => void } | null) {
  handle?.hide?.();
}

function showBlockedFormFlash(state: SavePolicyState) {
  state.flash.error?.(
    state.labels.blockedFormMessage,
    state.labels.blockedFormDescription,
  );
}

function logSavePolicyViolation(
  state: SavePolicyState,
  form: HTMLFormElement,
  blocked = false,
) {
  state.logger?.warn?.(state.channel, "save-policy-violation", {
      action: normalizeActionPath(form.getAttribute("action") || form.action || ""),
      blocked,
      formId: String(form.id || "").trim(),
      primaryFormIds: state.primaryFormIds,
  });
}

function updateUnsavedState(state: SavePolicyState, nextDirty: boolean) {
  if (state.destroyed || state.dirty === nextDirty) return;
  state.dirty = nextDirty;
  if (state.dirty && !state.saving) {
    state.unsavedFlashHandle = showUnsavedFlash(state);
    return;
  }
  hideUnsavedFlash(state.unsavedFlashHandle);
  state.unsavedFlashHandle = null;
}

function setSaving(state: SavePolicyState, nextSaving: boolean) {
  if (state.destroyed || state.saving === nextSaving) return;
  state.saving = nextSaving;
  if (state.saving) {
    hideUnsavedFlash(state.unsavedFlashHandle);
    state.unsavedFlashHandle = null;
    return;
  }
  if (state.dirty) state.unsavedFlashHandle = showUnsavedFlash(state);
}

function refreshDirtyState(state: SavePolicyState) {
  if (state.destroyed) return;
  const trackedFields = collectTrackedFields(state.root, state.primaryFormIds);
  if (trackedFields.length !== state.baseline.size) {
    updateUnsavedState(state, true);
    return;
  }
  const dirty = trackedFields.some((field) => {
      const baseline = state.baseline.has(field)
      ? String(state.baseline.get(field))
      : serializeFieldValue(field);
      const current = serializeFieldValue(field);
      if (!state.baseline.has(field)) state.baseline.set(field, baseline);
      return baseline !== current;
  });
  updateUnsavedState(state, dirty);
}

function captureBaseline(state: SavePolicyState) {
  state.baseline.clear();
  collectTrackedFields(state.root, state.primaryFormIds).forEach((field) => {
      state.baseline.set(field, serializeFieldValue(field));
  });
  updateUnsavedState(state, false);
}

function shouldBlockForm(state: SavePolicyState, form: HTMLFormElement) {
  const formId = String(form.id || "").trim();
  if (formId && state.primaryFormIds.includes(formId)) return false;
  if (isSpecialSettingsForm(form, state.specialActionPatterns)) return false;
  if (blockedForms.has(form)) return false;
  return true;
}

function blockUnexpectedForm(state: SavePolicyState, form: HTMLFormElement) {
  if (!shouldBlockForm(state, form)) return;
  blockedForms.add(form);
  form.dataset.tbfSavePolicyViolation = "true";
  logSavePolicyViolation(state, form);
  form.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      showBlockedFormFlash(state);
      logSavePolicyViolation(state, form, true);
  });
}

function bindUnexpectedForms(state: SavePolicyState) {
  state.root.querySelectorAll("form").forEach((node) => {
      const form = node instanceof HTMLFormElement ? node : null;
      if (!form || !formHasSubmitButton(form)) return;
      blockUnexpectedForm(state, form);
  });
}

function createSavePolicyState(input: SavePolicyInput, root: HTMLElement) {
  return {
    baseline: new Map<Element, string>(),
    channel: String(input.channel || "settings.save-policy"),
    destroyed: false,
    dirty: false,
    flash: input.flash || (defaultFlash as SavePolicyFlash),
    labels: { ...defaultSavePolicyLabels, ...(input.labels || {}) },
    logger: input.logger,
    primaryFormIds: normalizedPrimaryFormIds(input.primaryFormIds),
    root,
    saving: false,
    specialActionPatterns: Array.isArray(input.specialActionPatterns)
    ? input.specialActionPatterns
    : [],
    unsavedFlashHandle: null,
    uploadChangeEvents: Array.isArray(input.uploadChangeEvents) &&
      input.uploadChangeEvents.length
    ? input.uploadChangeEvents
    : [frontendEventName("upload-change")],
  } satisfies SavePolicyState;
}

function bindSavePolicyEvents(state: SavePolicyState) {
  const onFieldEvent = (event: Event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!isTrackedField(target, state.primaryFormIds)) return;
    refreshDirtyState(state);
  };
  const onUploadEvent = (event: Event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!isInsidePrimaryForm(target, state.primaryFormIds)) return;
    refreshDirtyState(state);
  };
  const onBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!state.dirty || state.saving) return;
    event.preventDefault();
    event.returnValue = "";
  };
  return bindSavePolicyDomEvents(
    state,
    onFieldEvent,
    onUploadEvent,
    onBeforeUnload,
  );
}

function bindSavePolicyDomEvents(
  state: SavePolicyState,
  onFieldEvent: EventListener,
  onUploadEvent: EventListener,
  onBeforeUnload: EventListener,
) {
  const onFormReset = (event: Event) => {
    const form = event.target instanceof HTMLFormElement ? event.target : null;
    if (!form || !state.primaryFormIds.includes(String(form.id || "").trim())) {
      return;
    }
    window.setTimeout(() => refreshDirtyState(state), 0);
  };
  const onFormSubmit = (event: Event) => {
    const form = event.target instanceof HTMLFormElement ? event.target : null;
    if (!form || !state.primaryFormIds.includes(String(form.id || "").trim())) {
      return;
    }
    setSaving(state, true);
  };
  bindSavePolicyDomListeners(
    state,
    onFieldEvent,
    onUploadEvent,
    onFormReset,
    onFormSubmit,
    onBeforeUnload,
  );
  return () => {
    unbindSavePolicyDomListeners(
      state,
      onFieldEvent,
      onUploadEvent,
      onFormReset,
      onFormSubmit,
      onBeforeUnload,
    );
  };
}

function bindSavePolicyDomListeners(
  state: SavePolicyState,
  onFieldEvent: EventListener,
  onUploadEvent: EventListener,
  onFormReset: EventListener,
  onFormSubmit: EventListener,
  onBeforeUnload: EventListener,
) {
  state.root.addEventListener("input", onFieldEvent, true);
  state.root.addEventListener("change", onFieldEvent, true);
  state.uploadChangeEvents.forEach((eventName) => {
      state.root.addEventListener(eventName, onUploadEvent, true);
  });
  state.root.addEventListener("reset", onFormReset, true);
  state.root.addEventListener("submit", onFormSubmit, true);
  window.addEventListener("beforeunload", onBeforeUnload);
}

function unbindSavePolicyDomListeners(
  state: SavePolicyState,
  onFieldEvent: EventListener,
  onUploadEvent: EventListener,
  onFormReset: EventListener,
  onFormSubmit: EventListener,
  onBeforeUnload: EventListener,
) {
  state.root.removeEventListener("input", onFieldEvent, true);
  state.root.removeEventListener("change", onFieldEvent, true);
  state.uploadChangeEvents.forEach((eventName) => {
      state.root.removeEventListener(eventName, onUploadEvent, true);
  });
  state.root.removeEventListener("reset", onFormReset, true);
  state.root.removeEventListener("submit", onFormSubmit, true);
  window.removeEventListener("beforeunload", onBeforeUnload);
}

function createSavePolicyController(
  state: SavePolicyState,
  unbind: () => void,
) {
  const controller: SavePolicyController = {
    beginSave() {
      setSaving(state, true);
    },
    completeSave(saved = false) {
      setSaving(state, false);
      if (saved) captureBaseline(state);
      else refreshDirtyState(state);
    },
    destroy() {
      if (state.destroyed) return;
      state.destroyed = true;
      unbind();
      savePolicyCleanups.get(controller)?.();
      savePolicyCleanups.delete(controller);
      hideUnsavedFlash(state.unsavedFlashHandle);
      state.unsavedFlashHandle = null;
      savePolicies.delete(state.root);
      activeSavePolicies.delete(controller);
    },
    hasUnsavedChanges() {
      return state.dirty;
    },
    markSaved() {
      setSaving(state, false);
      captureBaseline(state);
    },
    refresh() {
      setSaving(state, false);
      refreshDirtyState(state);
    },
    root: state.root,
  };
  return controller;
}

function enforceSavePolicy(input: SavePolicyInput) {
  const root = input.root instanceof HTMLElement ? input.root : null;
  if (!root) return null;
  savePolicies.get(root)?.destroy();
  const state = createSavePolicyState(input, root);
  const controller = createSavePolicyController(
    state,
    bindSavePolicyEvents(state),
  );
  savePolicies.set(root, controller);
  activeSavePolicies.add(controller);
  const disposePageCleanup = registerPageCleanup(root, () => controller.destroy());
  const disposeUnsavedWork = registerUnsavedWork(
    () => !state.destroyed && state.dirty && !state.saving,
  );
  savePolicyCleanups.set(controller, () => {
      disposePageCleanup();
      disposeUnsavedWork();
  });
  bindUnexpectedForms(state);
  captureBaseline(state);
  return controller;
}

function resolveSavePolicy(root: Element | null) {
  return root instanceof HTMLElement ? savePolicies.get(root) || null : null;
}

function destroyAllSavePolicies() {
  Array.from(activeSavePolicies).forEach((controller) => {
      controller.destroy();
  });
}

export {
  destroyAllSavePolicies,
  enforceSavePolicy,
  resolveSavePolicy,
};
