import type { ReactNode } from "react";
import { default as disclosure } from "#7xsqb2bbtamg";
import { bar as loader_bar } from "#6hfutrhvm6x6";
import { joinClassNames } from "#6mupcizo1mwq";
import {
  primitiveStackClassName,
  primitiveTextClassName,
} from "#hzrmwbvgt2ax";

type SharedStepsPanelProps = {
  beforeList?: ReactNode;
  className?: string;
  dataAttrs?: Record<string, string>;
  emptyCopy?: string;
  hidden?: boolean;
  lang?: string;
  listClassName?: string;
  progressBarAttr?: string;
  title?: string;
  type?: "steps" | "disclosure";
};

function stepsPanelModel(props: SharedStepsPanelProps) {
  const isDisclosure = props.type === "disclosure";
  const title = stepsLabel(props.lang);
  return {
    attrs:
    props.dataAttrs && typeof props.dataAttrs === "object"
    ? props.dataAttrs
    : {},
    beforeList: isDisclosure
    ? loader_bar({
        label: "",
        meta: "",
        percent: 0,
        wrapperAttributes: String(props.progressBarAttr || "").trim(),
    })
    : props.beforeList,
    emptyCopy:
    String(props.emptyCopy || "").trim() || noStepsLabel(props.lang),
    isDisclosure,
    title: isDisclosure
    ? title
    : String(props.title || "").trim() || title,
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
        data-steps-panel=""
        data-steps-type={model.isDisclosure ? "disclosure" : "steps"}
        data-steps-default-copy={model.emptyCopy}
        data-steps-default-title={model.title}
        {...model.attrs}
        >
        <p className={primitiveTextClassName({ muted: true })} data-steps-copy="">
        {model.emptyCopy}
        </p>
        {model.beforeList}
        <div
        className={primitiveStackClassName({
          className: joinClassNames(
            "max-height-xl",
            "scroll",
            "scroll-min",
            props.listClassName,
          ),
          gap: "xs",
        })}
        data-steps-list=""
        />
        </section>
      ),
      hidden: props.hidden === true,
      label: <h4 data-steps-title="">{model.title}</h4>,
      panelClassName: primitiveStackClassName({ gap: "sm" }),
      panelId: `${model.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "steps"}_panel`,
      rootClassName: primitiveStackClassName({ gap: "sm" }),
      triggerClassName: "text-left",
  });
}

export type { SharedStepsPanelProps };
export default shared_steps_panel;

function stepsLabel(_lang: string | undefined) {
  return "Steps";
}

function noStepsLabel(_lang: string | undefined) {
  return "No steps yet.";
}
