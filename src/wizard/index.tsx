import { createElement, type ReactNode } from "react";
import { Icon } from "#lbkpzw8nphru";
import { joinClassNames } from "#6mupcizo1mwq";
import {
  primitiveButtonClassName,
  primitiveCardClassName,
} from "#hzrmwbvgt2ax";

type wizard_step = {
  actions?: ReactNode;
  id: string;
  content: ReactNode;
};

type wizard_props = {
  className?: string;
  id: string;
  steps: wizard_step[];
};

function wizardStepInactiveProps(active: boolean) {
  if (active) return {};
  return { "aria-hidden": true, inert: true };
}

function wizardStepPositionProps(index: number, lastIndex: number) {
  return {
    "data-wizard-step-index": String(index),
    ...(index === 0 ? { "data-wizard-step-first": "true" } : {}),
    ...(index === lastIndex ? { "data-wizard-step-last": "true" } : {}),
  };
}

function wizard(props: wizard_props) {
  const lastIndex = props.steps.length - 1;

  return createElement(
    "wizard-root",
    {
      className: joinClassNames("wizard", props.className),
      id: props.id,
    },
    props.steps.map((step, index) =>
      createElement(
        "wizard-step",
        {
          className: primitiveCardClassName({ className: "wizard-step", gap: "sm" }),
          id: `${props.id}_${step.id}`,
          key: step.id,
          ...(index === 0 ? { "data-wizard-step-state": "active" } : {}),
          ...wizardStepPositionProps(index, lastIndex),
          ...wizardStepInactiveProps(index === 0),
        },
        step.content,
        step.actions ? (
          <div className="ver-bottom-child">{step.actions}</div>
        ) : null,
      ),
    ),
  );
}

type wizard_nav_button_props = {
  className?: string;
  label: string;
};

function wizard_previous_button(props: wizard_nav_button_props) {
  return createElement(
    "wizard-previous-button",
    null,
    <button
    type="button"
    className={primitiveButtonClassName({ className: props.className })}
    >
    <Icon spec="remixicon arrow-left-line" />
    {props.label}
    </button>
  );
}

function wizard_next_button(props: wizard_nav_button_props) {
  return createElement(
    "wizard-next-button",
    null,
    <button type="button" className={primitiveButtonClassName({ className: props.className })}>
    <Icon spec="remixicon arrow-right-line" />
    {props.label}
    </button>
  );
}

function wizard_final_action(children: ReactNode) {
  return createElement("wizard-final-action", null, children);
}

export type { wizard_nav_button_props, wizard_props, wizard_step };
export { wizard_final_action, wizard_next_button, wizard_previous_button };
export { bindWizard, bindWizardRoot, wizardSteps } from "./client.js";
export default wizard;
