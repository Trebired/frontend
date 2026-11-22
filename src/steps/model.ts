import { frontendClassName } from "#5vbaqj4pirp3";
import { toText as onlyString } from "#ndsvdqv80epr";

type SharedStepCardInput = {
  actionLabel?: string;
  groupKey?: string;
  groupLabel?: string;
  highlight?: string;
  href?: string;
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
        highlight: onlyString(entry && (entry as any).highlight),
        href: onlyString(entry && (entry as any).href),
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
      className: frontendClassName("red"),
      label: "fail",
    };
  }
  if (normalized === "success" || normalized === "ok") {
    return {
      className: frontendClassName("green"),
      label: "success",
    };
  }
  if (normalized === "warn" || normalized === "warning") {
    return {
      className: frontendClassName("yellow"),
      label: "warning",
    };
  }

  return {
    className: frontendClassName("blue"),
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

function defaultStepsLabel() {
  return "Steps";
}

export type { SharedStepCardInput, SharedStepGroup };
export { groupSharedSteps, normalizeSharedSteps, stepTone };
