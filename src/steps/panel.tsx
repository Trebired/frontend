import { frontendClassName, frontendDataAttrs } from "#5vbaqj4pirp3";
import type { ReactNode } from "react";
import { default as disclosure } from "#7xsqb2bbtamg";
import { bar as loader_bar } from "#6hfutrhvm6x6";
import { joinClassNames } from "#6mupcizo1mwq";
import {
  primitiveStackClassName,
  primitiveTextClassName,
} from "#hzrmwbvgt2ax";
import { Title } from "#7ly3b59upz0n";
import { SharedStepCards } from "./cards.js";
import { normalizeStepsRecord, stepsRecordAttrs } from "./record.js";
import type { StepsRecord, StepsSave } from "./record.js";

type SharedStepsPanelProps = {
  beforeList?: ReactNode;
  className?: string;
  dataAttrs?: Record<string, string>;
  emptyCopy?: string;
  groupHeaders?: Record<string, ReactNode> | null;
  hidden?: boolean;
  lang?: string;
  listClassName?: string;
  progressBarAttr?: string;
  record?: StepsRecord | null;
  save?: StepsSave | null;
  title?: string;
  type?: "steps" | "disclosure";
};

function stepsPanelModel(props: SharedStepsPanelProps) {
  const isDisclosure = props.type === "disclosure";
  const title = defaultStepsPanelLabel(props.lang);
  const record = normalizeStepsRecord(props.record);
  const saved = record && record.steps.length ? record : null;
  const defaultTitle = isDisclosure ? title : String(props.title || "").trim() || title;
  return {
    attrs: {
      ...(props.dataAttrs && typeof props.dataAttrs === "object" ? props.dataAttrs : {}),
      ...stepsRecordAttrs(saved, props.save),
    },
    beforeList: isDisclosure
    ? loader_bar({
        meta: saved ? String(saved.meta || "") : "",
        percent: saved && saved.percent != null ? saved.percent : 0,
        showLabel: false,
        wrapperAttributes: String(props.progressBarAttr || "").trim(),
    })
    : props.beforeList,
    copy: saved && saved.copy ? saved.copy : "",
    emptyCopy:
    String(props.emptyCopy || "").trim() || noStepsLabel(props.lang),
    isDisclosure,
    record: saved,
    title: (saved && saved.title) || defaultTitle,
    defaultTitle,
  };
}

function shared_steps_panel(props: SharedStepsPanelProps) {
  const model = stepsPanelModel(props);
  return disclosure({
      content: (
        <section
        className={primitiveStackClassName({
              className: props.className,
              gap: "sm",
        })}
        {...frontendDataAttrs({ "steps-panel": "" })}
        {...frontendDataAttrs({ "steps-type": model.isDisclosure ? "disclosure" : "steps" })}
        {...frontendDataAttrs({ "steps-default-copy": model.emptyCopy })}
        {...frontendDataAttrs({ "steps-default-title": model.defaultTitle })}
        {...model.attrs}
        >
        <p className={primitiveTextClassName({ muted: true })} {...frontendDataAttrs({ "steps-copy": "" })}>
        {model.copy || model.emptyCopy}
        </p>
        {model.beforeList}
        <div
        className={primitiveStackClassName({
              className: joinClassNames(
                frontendClassName("max-height-xl"),
                frontendClassName("scroll"),
                frontendClassName("scroll-min"),
                props.listClassName,
              ),
              gap: "xs",
        })}
        {...frontendDataAttrs({ "steps-list": "" })}
        >
        {model.record ? <SharedStepCards groupHeaders={props.groupHeaders} steps={model.record.steps} /> : null}
        </div>
        {Object.entries(props.groupHeaders || {}).map(([key, header]) => (
              <template key={key} {...frontendDataAttrs({ "steps-group-header": key })}>{header}</template>
        ))}
        </section>
      ),
      hidden: props.hidden === true,
      open: Boolean(model.record),
      label: <Title fit={false} {...frontendDataAttrs({ "steps-title": "" })}>{model.title}</Title>,
      panelId: `${model.defaultTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "steps"}_panel`,
      triggerClassName: "text-left",
  });
}

export type { SharedStepsPanelProps };
export default shared_steps_panel;

function defaultStepsPanelLabel(_lang: string | undefined) {
  return "Steps";
}

function noStepsLabel(_lang: string | undefined) {
  return "No steps yet.";
}
