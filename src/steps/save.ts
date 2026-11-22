import { connectChannel } from "@trebired/sockets/client";
import { frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";
import { normalizeSharedSteps } from "./model.js";
import type { SharedStepCardInput } from "./model.js";
import {
  MAX_SAVED_STEPS,
  readPanelRecord,
  SAVE_CHANNEL_ATTR,
  SAVE_EVENT_ATTR,
  SAVE_KEY_ATTR,
  STEPS_SAVE_EVENT,
} from "./record.js";
import type { StepsRecord, StepsSave } from "./record.js";

const SAVE_DELAY_MS = 400;

type SaveSlot = { latest: StepsRecord | null; running: boolean; signature: string; timer: ReturnType<typeof setTimeout>|null };

const saveSlots = new Map<string, SaveSlot>();

function textOf(panel: Element, name: string) {
  const el = panel.querySelector(frontendDataSelector(name));
  return el ? String(el.textContent || "").trim() : "";
}

function percentOf(panel: Element) {
  const bar = panel.querySelector<HTMLElement>(frontendDataSelector("progress"));
  if (!bar || bar.hasAttribute(frontendDataAttr("progress-indeterminate"))) return null;
  const value = parseFloat(bar.style.getPropertyValue("--progress-percent"));
  return Number.isFinite(value) ? value : null;
}

function snapshotPanel(panel: Element, steps: SharedStepCardInput[]): StepsRecord {
  return {
    copy: textOf(panel, "steps-copy"),
    meta: textOf(panel, "progress-meta"),
    percent: percentOf(panel),
    steps: normalizeSharedSteps(steps).slice(-MAX_SAVED_STEPS),
    title: textOf(panel.closest(frontendDataSelector("disclosure")) || panel, "steps-title"),
    updatedAt: new Date().toISOString(),
  };
}

function panelSave(panel: Element): StepsSave | null {
  const channel = String(panel.getAttribute(SAVE_CHANNEL_ATTR) || "").trim();
  const key = String(panel.getAttribute(SAVE_KEY_ATTR) || "").trim();
  if (!channel || !key) return null;
  return { channel, event: String(panel.getAttribute(SAVE_EVENT_ATTR) || "").trim() || STEPS_SAVE_EVENT, key };
}

function recordSignature(record: StepsRecord) {
  return JSON.stringify({ ...record, updatedAt: "" });
}

function slotFor(id: string, panel: Element) {
  let slot = saveSlots.get(id);
  if (!slot) {
    const seeded = readPanelRecord(panel);
    slot = { latest: null, running: false, signature: seeded ? recordSignature(seeded) : "", timer: null };
    saveSlots.set(id, slot);
  }
  return slot;
}

async function flushSlot(save: StepsSave, slot: SaveSlot) {
  if (slot.running || !slot.latest) return;
  const record = slot.latest;
  slot.latest = null;
  slot.running = true;
  try {
    await connectChannel(save.channel).send(save.event || STEPS_SAVE_EVENT, { key: save.key, record });
  } finally {
    slot.running = false;
    if (slot.latest) void flushSlot(save, slot);
  }
}

function scheduleStepsSave(panel: Element, steps: SharedStepCardInput[]) {
  const save = panelSave(panel);
  if (!save || typeof window === "undefined") return;
  const slot = slotFor(`${save.channel}|${save.key}`, panel);
  if (slot.timer) clearTimeout(slot.timer);
  slot.timer = setTimeout(() => {
      slot.timer = null;
      const record = snapshotPanel(panel, steps);
      const signature = recordSignature(record);
      if (signature === slot.signature) return;
      slot.signature = signature;
      slot.latest = record;
      void flushSlot(save, slot);
    }, SAVE_DELAY_MS);
}

export { scheduleStepsSave };
