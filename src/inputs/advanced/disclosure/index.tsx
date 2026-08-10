import { toString } from "#dqy2d22qyujv";
import { joinClassNames as classNames } from "#ndsvdqv80epr";

import { type ReactNode } from "react";
import { DisclosureButton } from "#h6suogfkcg6i";
import { icon } from "#dqy2d22qyujv";
import {
  primitiveCardClassName,
  primitiveInlineRowClassName,
} from "#hzrmwbvgt2ax";

type disclosure_props = {
  card?: boolean;
  content?: ReactNode;
  hidden?: boolean;
  id?: string;
  label?: ReactNode;
  open?: boolean;
  panelClassName?: string;
  panelId: string;
  rootAttrs?: Record<string, unknown>;
  rootClassName?: string;
  triggerTag?: "button" | "div";
  triggerClassName?: string;
};

function disclosureModel(props: disclosure_props) {
  const rootId = toString(props.id);
  const rootClassName = classNames([
      "tbf-disclosure",
      props.card === false ? "" : primitiveCardClassName({ layout: "none" }),
      "cursor-pointer",
      "disclosure",
      toString(props.rootClassName),
  ]);
  return {
    isOpen: props.open === true,
    panelClassName: classNames([
        "tbf-disclosure__panel",
        "cursor-auto",
        "disclosure-panel",
        toString(props.panelClassName),
    ]),
    rootAttrs:
    props.rootAttrs && typeof props.rootAttrs === "object"
    ? props.rootAttrs
    : {},
    rootClassName,
    rootId,
    TriggerTag: props.triggerTag === "div" ? "div" : "button",
    triggerClassName: classNames([
        primitiveInlineRowClassName({
            className: "disclosure-trigger",
            gap: "xs",
        }),
        toString(props.triggerClassName),
    ]),
  };
}

function disclosureTriggerContent(props: disclosure_props) {
  return (
    <>
    {props.label}
    <span className="disclosure-indicator" aria-hidden="true">
    {icon({ spec: "remixicon arrow-right-s-line" })}
    </span>
    </>
  );
}

function disclosureTrigger(
  props: disclosure_props,
  model: ReturnType<typeof disclosureModel>,
) {
  const triggerContent = disclosureTriggerContent(props);
  return (
    model.TriggerTag === "div"
    ? (
      <div
      className={model.triggerClassName}
      data-tbf-disclosure-trigger=""
      role="button"
      tabIndex={0}
      aria-controls={props.panelId}
      aria-expanded={model.isOpen ? "true" : "false"}
      >
      {triggerContent}
      </div>
    )
    : (
      <DisclosureButton
      className={model.triggerClassName}
      aria-controls={props.panelId}
      aria-expanded={model.isOpen ? "true" : "false"}
      >
      {triggerContent}
      </DisclosureButton>
    )
  );
}

function disclosurePanel(
  props: disclosure_props,
  model: ReturnType<typeof disclosureModel>,
) {
  return (
    <div
    id={props.panelId}
    className={model.panelClassName}
    data-tbf-disclosure-panel=""
    data-tbf-disclosure-panel-open={model.isOpen ? "true" : "false"}
    {...(model.isOpen ? {} : { hidden: true })}
    >
    {props.content}
    </div>
  );
}

function advancedDisclosure(props: disclosure_props) {
  const model = disclosureModel(props);
  return (
    <div
    {...model.rootAttrs}
    {...(model.rootId ? { id: model.rootId } : {})}
    className={model.rootClassName}
    data-tbf-disclosure=""
    data-tbf-disclosure-open={model.isOpen ? "true" : "false"}
    aria-controls={props.panelId}
    aria-expanded={model.isOpen ? "true" : "false"}
    hidden={props.hidden === true}
    >
    {disclosureTrigger(props, model)}
    {disclosurePanel(props, model)}
    </div>
  );
}

export type { disclosure_props };
export default advancedDisclosure;
