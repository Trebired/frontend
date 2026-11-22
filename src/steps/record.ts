import { frontendDataAttr } from "#5vbaqj4pirp3";
import { normalizeSharedSteps } from "./model.js";
import type { SharedStepCardInput } from "./model.js";

type StepsRecord = {
  copy?: string;
  meta?: string;
  percent?: number | null;
  steps: SharedStepCardInput[];
  title?: string;
  updatedAt?: string;
};

type StepsSave = {
  channel: string;
  event?: string;
  key: string;
};

const STEPS_SAVE_EVENT = "steps:save";
const MAX_SAVED_STEPS = 200;

const RECORD_ATTR = frontendDataAttr("steps-record");
const SAVE_CHANNEL_ATTR = frontendDataAttr("steps-save-channel");
const SAVE_EVENT_ATTR = frontendDataAttr("steps-save-event");
const SAVE_KEY_ATTR = frontendDataAttr("steps-save-key");

function normalizeStepsRecord(input: unknown): StepsRecord | null {
  if (!input || typeof input !== "object") return null;
  const source = input as Record<string, unknown>;
  const steps = normalizeSharedSteps(source.steps).slice(-MAX_SAVED_STEPS);
  const percent = Number(source.percent);
  return {
    copy: String(source.copy || ""),
    meta: String(source.meta || ""),
    percent: source.percent == null || !Number.isFinite(percent) ? null : Math.max(0, Math.min(100, percent)),
    steps,
    title: String(source.title || ""),
    updatedAt: String(source.updatedAt || ""),
  };
}

function readPanelRecord(panel: Element): StepsRecord | null {
  const raw = panel.getAttribute(RECORD_ATTR);
  if (!raw) return null;
  try {
    return normalizeStepsRecord(JSON.parse(raw));
  } catch {
    return null;
  }
}

function stepsRecordAttrs(record: StepsRecord | null | undefined, save: StepsSave | null | undefined) {
  const normalized = normalizeStepsRecord(record);
  const attrs: Record<string, string> = {};
  if (normalized && normalized.steps.length) attrs[RECORD_ATTR] = JSON.stringify(normalized);
  if (save && save.channel && save.key) {
    attrs[SAVE_CHANNEL_ATTR] = save.channel;
    attrs[SAVE_KEY_ATTR] = save.key;
    if (save.event) attrs[SAVE_EVENT_ATTR] = save.event;
  }
  return attrs;
}

export type { StepsRecord, StepsSave };
export {
  MAX_SAVED_STEPS,
  normalizeStepsRecord,
  readPanelRecord,
  RECORD_ATTR,
  SAVE_CHANNEL_ATTR,
  SAVE_EVENT_ATTR,
  SAVE_KEY_ATTR,
  STEPS_SAVE_EVENT,
  stepsRecordAttrs,
};
