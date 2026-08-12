import {
  primitiveCardRowClassName,
  primitiveInlineRowClassName,
  primitiveStackClassName,
  primitiveTextClassName,
} from "#hzrmwbvgt2ax";
import { toText as onlyString } from "#ndsvdqv80epr";

type SharedStepCardInput = {
  actionLabel?: string;
  groupKey?: string;
  groupLabel?: string;
  key?: string;
  level?: string;
  message: string;
  recordedAtLabel?: string;
};

type SharedStepGroup = {
  actionLabel?: string;
  key: string;
  label: string;
  steps: SharedStepCardInput[];
};

function normalizeSharedSteps(stepsInput: unknown) {
  return Array.isArray(stepsInput)
  ? stepsInput
  .map((entry) => ({
        actionLabel: onlyString(entry && (entry as any).actionLabel),
        groupKey: onlyString(entry && (entry as any).groupKey),
        groupLabel: onlyString(entry && (entry as any).groupLabel),
        key: onlyString(entry && (entry as any).key),
        level: onlyString(entry && (entry as any).level),
        message: onlyString(entry && (entry as any).message),
        recordedAtLabel: onlyString(entry && (entry as any).recordedAtLabel),
  }))
  .filter((entry) => entry.message)
  : [];
}

function stepTone(level: string) {
  const normalized = onlyString(level).toLowerCase();
  if (normalized === "fail" || normalized === "error") {
    return {
      className: "red",
      label: "fail",
    };
  }
  if (normalized === "success" || normalized === "ok") {
    return {
      className: "green",
      label: "success",
    };
  }
  if (normalized === "warn" || normalized === "warning") {
    return {
      className: "yellow",
      label: "warning",
    };
  }

  return {
    className: "blue",
    label: "event",
  };
}

function normalizedGroupKey(input: SharedStepCardInput, index: number) {
  const explicitKey = onlyString(input && input.groupKey);
  if (explicitKey) return explicitKey;
  const explicitLabel = onlyString(input && input.groupLabel);
  if (explicitLabel) return `group:${explicitLabel.toLowerCase()}`;
  return `group:${index}`;
}

function groupSharedSteps(stepsInput: unknown) {
  const steps = normalizeSharedSteps(stepsInput);

  const hasGrouping = steps.some((entry) => entry.groupKey || entry.groupLabel);
  if (!hasGrouping) return [];

  const groups: SharedStepGroup[] = [];
  const byKey = new Map<string, SharedStepGroup>();

  steps
  .slice()
  .reverse()
  .forEach((entry, index) => {
      const groupKey = normalizedGroupKey(entry, index);
      const groupLabel = onlyString(entry.groupLabel) || defaultStepsLabel();
      const actionLabel = onlyString(entry.actionLabel);
      let group = byKey.get(groupKey);
      if (!group) {
        group = {
          actionLabel,
          key: groupKey,
          label: groupLabel,
          steps: [],
        };
        byKey.set(groupKey, group);
        groups.push(group);
      } else if (!group.label && groupLabel) {
        group.label = groupLabel;
      } else if (!group.actionLabel && actionLabel) {
        group.actionLabel = actionLabel;
      }

      group.steps.push(entry);
  });

  return groups;
}

function createSharedStepCard(doc: Document, input: SharedStepCardInput) {
  const message = onlyString(input && input.message);
  if (!message) return null;

  const row = doc.createElement("div");
  row.className = primitiveCardRowClassName({
      className: primitiveStackClassName({
          className: "min-height-fit",
          gap: "xs",
      }),
  });

  const header = doc.createElement("div");
  header.className = primitiveInlineRowClassName({ gap: "xs" });
  header.style.alignItems = "flex-start";

  const tone = stepTone(input && input.level);
  const badge = doc.createElement("span");
  badge.className = `pill no-shrink ${tone.className}`.trim();
  badge.textContent = tone.label;

  const messageEl = doc.createElement("span");
  messageEl.className = primitiveTextClassName({
      breakWord: true,
      className: "display-block",
      size: "sm",
  });
  messageEl.textContent = message;
  messageEl.style.flex = "1 1 auto";
  messageEl.style.lineHeight = "1.4";

  header.appendChild(badge);
  header.appendChild(messageEl);
  row.appendChild(header);

  appendStepRecordedAt(doc, row, input && input.recordedAtLabel);

  return row;
}

function appendStepRecordedAt(doc: Document, row: HTMLElement, value: unknown) {
  const recordedAtLabel = onlyString(value);
  if (!recordedAtLabel) return;
  const timeEl = doc.createElement("span");
  timeEl.className = primitiveTextClassName({
      breakWord: true,
      className: "display-block",
      muted: true,
      size: "xs",
  });
  timeEl.textContent = recordedAtLabel;
  timeEl.style.lineHeight = "1.35";
  row.appendChild(timeEl);
}

function createSharedStepGroup(doc: Document, group: SharedStepGroup) {
  const wrapper = doc.createElement("section");
  wrapper.className = primitiveStackClassName({ gap: "xs" });
  wrapper.setAttribute("data-steps-group", group.key);

  const separator = doc.createElement("hr");
  separator.setAttribute("aria-hidden", "true");
  wrapper.appendChild(separator);

  const header = doc.createElement("div");
  header.className = primitiveStackClassName({ gap: "2xs" });

  const title = doc.createElement("h5");
  title.textContent = group.label;
  header.appendChild(title);

  const actionLabel = onlyString(group.actionLabel);
  if (actionLabel) {
    const actionEl = doc.createElement("span");
    actionEl.className = primitiveTextClassName({ muted: true, size: "xs" });
    actionEl.textContent =
    actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1);
    header.appendChild(actionEl);
  }

  wrapper.appendChild(header);

  const list = doc.createElement("div");
  list.className = primitiveStackClassName({ gap: "xs" });
  list.setAttribute("data-steps-group-list", group.key);

  group.steps.forEach((entry) => {
      const card = createSharedStepCard(doc, entry);
      if (card) list.appendChild(card);
  });

  wrapper.appendChild(list);
  return wrapper;
}

function renderSharedSteps(
  doc: Document,
  container: HTMLElement,
  stepsInput: unknown,
) {
  container.innerHTML = "";

  const steps = normalizeSharedSteps(stepsInput);
  const groupedEntries = steps.filter(
    (entry) => entry.groupKey || entry.groupLabel,
  );
  const ungroupedEntries = steps.filter(
    (entry) => !entry.groupKey && !entry.groupLabel,
  );
  const grouped = groupSharedSteps(groupedEntries);
  if (grouped.length > 0) {
    ungroupedEntries
    .slice()
    .reverse()
    .forEach((entry) => {
        const card = createSharedStepCard(doc, entry);
        if (card) container.appendChild(card);
    });
    grouped.forEach((group) => {
        const section = createSharedStepGroup(doc, group);
        if (section) container.appendChild(section);
    });
    return;
  }

  steps
  .slice()
  .reverse()
  .forEach((entry) => {
      const card = createSharedStepCard(doc, entry);
      if (card) container.appendChild(card);
  });
}

export type { SharedStepCardInput };
export { createSharedStepCard, groupSharedSteps, renderSharedSteps };

function defaultStepsLabel() {
  return "Steps";
}
