import { StepsGroupSlotContext } from "./slot.js";
import type { ReactNode } from "react";
import { highlightAttrs } from "#8xdkni5exuif";
import { frontendClassName, frontendDataAttrs } from "#5vbaqj4pirp3";
import {
  primitiveCardRowAttrs,
  primitiveCardRowClassName,
  primitiveInlineRowClassName,
  primitiveStackClassName,
  primitiveTextClassName,
} from "#hzrmwbvgt2ax";
import { groupSharedSteps, normalizeSharedSteps, stepTone } from "./model.js";
import type { SharedStepCardInput, SharedStepGroup } from "./model.js";

function linkAttrs(href: string, highlight: string) {
  if (!href) return {};
  return { ...frontendDataAttrs({ "step-href": href }), ...highlightAttrs(highlight), role: "link", tabIndex: 0 };
}

function SharedStepCard(props: { step: SharedStepCardInput }) {
  const step = props.step;
  const tone = stepTone(String(step.level || ""));
  return (
    <div
    className={primitiveCardRowClassName({
          className: primitiveStackClassName({ className: frontendClassName("min-height-fit"), gap: "xs" }),
    })}
    {...primitiveCardRowAttrs()}
    {...linkAttrs(String(step.href || ""), String(step.highlight || ""))}
    >
    <div className={primitiveInlineRowClassName({ gap: "xs" })} style={{ alignItems: "flex-start" }}>
    <span className={`${frontendClassName("pill")} ${frontendClassName("no-shrink")} ${tone.className}`.trim()}>{tone.label}</span>
    <span
    className={primitiveTextClassName({ breakWord: true, className: frontendClassName("display-block"), size: "sm" })}
    style={{ flex: "1 1 auto", lineHeight: "1.4" }}
    >
    {step.message}
    </span>
    </div>
    {step.recordedAtLabel ? (
        <span
        className={primitiveTextClassName({
              breakWord: true,
              className: frontendClassName("display-block"),
              muted: true,
              size: "xs",
        })}
        style={{ lineHeight: "1.35" }}
        >
        {step.recordedAtLabel}
        </span>
      ) : null}
    </div>
  );
}

type GroupHeaders = Record<string, ReactNode> | null | undefined;

function stepCardNodes(steps: SharedStepCardInput[]) {
  return steps.map((step, index) => <SharedStepCard key={`${step.key || "step"}-${index}`} step={step} />);
}

function SharedStepGroupSection(props: { group: SharedStepGroup; header?: ReactNode }) {
  const group = props.group;
  if (props.header) {
    return (
      <section {...frontendDataAttrs({ "steps-group": group.key, "steps-group-card": "" })}>
      <StepsGroupSlotContext.Provider value={{ count: group.steps.length, steps: stepCardNodes(group.steps) }}>
      {props.header}
      </StepsGroupSlotContext.Provider>
      </section>
    );
  }
  const actionLabel = String(group.actionLabel || "");
  return (
    <section className={primitiveStackClassName({ gap: "xs" })} {...frontendDataAttrs({ "steps-group": group.key })}>
    <hr aria-hidden="true" />
    <div className={primitiveStackClassName({ gap: "xs2" })}>
    <h5>{group.label}</h5>
    {actionLabel ? (
        <span className={primitiveTextClassName({ muted: true, size: "xs" })}>
        {actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)}
        </span>
      ) : null}
    </div>
    <div className={primitiveStackClassName({ gap: "xs" })} {...frontendDataAttrs({ "steps-group-list": group.key })}>
    {stepCardNodes(group.steps)}
    </div>
    </section>
  );
}

function SharedStepCards(props: { groupHeaders?: GroupHeaders; steps: unknown }) {
  const steps = normalizeSharedSteps(props.steps);
  const ungrouped = steps.filter((step) => !step.groupKey && !step.groupLabel);
  const groups = groupSharedSteps(steps.filter((step) => step.groupKey || step.groupLabel));
  const newestFirst = (groups.length ? ungrouped : steps).slice().reverse();
  return (
    <>
    {newestFirst.map((step, index) => <SharedStepCard key={`${step.key || "step"}-${index}`} step={step} />)}
    {groups.map((group) => (
          <SharedStepGroupSection key={group.key} group={group} header={props.groupHeaders && props.groupHeaders[group.key]} />
    ))}
    </>
  );
}

export { SharedStepCards };
