import { createLocalTranslator } from "#dqy2d22qyujv";
import { toString } from "#dqy2d22qyujv";
import { type ReactNode } from "react";
import { primitiveTextClassName } from "#hzrmwbvgt2ax";
import "./index.client.js";

type checkbox_props = {
  all?: boolean;
  bodyClassName?: string;
  checked?: boolean;
  description?: ReactNode;
  disabled?: boolean;
  group?: string;
  id?: string;
  input_attrs?: Record<string, unknown>;
  inputClassName?: string;
  lang?: string;
  name?: string;
  optionClassName?: string;
  tag?: "div" | "label";
  title?: ReactNode;
  value?: string;
  wrap_attrs?: Record<string, unknown>;
};

function checkboxModel(props: checkbox_props) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  const Tag: any = props.tag === "div" ? "div" : "label";
  const optionClassName = toString(props.optionClassName);
  const computedOptionClassName = `choice-row checkbox-option radius-lg${optionClassName ? ` ${optionClassName}` : ""}`;
  const optionBodyClassName = `checkbox-option-body flex-1${toString(props.bodyClassName) ? ` ${toString(props.bodyClassName)}` : ""}`;
  const computedInputClassName = `checkbox-input checkbox${toString(props.inputClassName) ? ` ${toString(props.inputClassName)}` : ""}`;
  const inputName = toString(props.name);
  const inputGroup = toString(props.group, inputName);
  const inputValue = props.value == null ? "1" : String(props.value);
  const title =
  props.title ?? (props.all === true ? localT("selection.all") : "");
  return {
    computedInputClassName,
    computedOptionClassName,
    inputGroup,
    inputName,
    inputValue,
    optionBodyClassName,
    Tag,
    title,
  };
}

function checkboxInput(props: checkbox_props, model: any) {
  return (
    <input
    {...(toString(props.id) ? { id: toString(props.id) } : {})}
    type="checkbox"
    name={model.inputName}
    value={model.inputValue}
    className={model.computedInputClassName}
    tabIndex={-1}
    defaultChecked={props.checked === true}
    disabled={props.disabled === true}
    {...(props.input_attrs && typeof props.input_attrs === "object"
        ? props.input_attrs
        : {})}
    />
  );
}

function checkboxControl() {
  return (
    <span className="checkbox-control" aria-hidden="true">
    <span className="checkbox-control-icon active" />
    <span className="checkbox-control-icon partial" />
    </span>
  );
}

function checkboxDescription(description: ReactNode) {
  if (!description) return null;
  return (
    <span className={primitiveTextClassName({
          breakWord: true,
          className: "checkbox-option-description",
          muted: true,
          size: "sm",
    })}>
    {description}
    </span>
  );
}

function checkbox(props: checkbox_props) {
  const model = checkboxModel(props);
  const Tag = model.Tag;
  return (
    <Tag
    className={model.computedOptionClassName}
    data-tbf-checkbox-option=""
    {...(props.wrap_attrs && typeof props.wrap_attrs === "object"
        ? props.wrap_attrs
        : {})}
    >
    {props.all === true ? (
        <script data-checkbox-option-config="" hidden type="application/json">
        {JSON.stringify({ all: true })}
        </script>
      ) : null}
    {checkboxInput(props, model)}
    {checkboxControl()}
    <span className={model.optionBodyClassName}>
    <span className="checkbox-option-title">{model.title}</span>
    {checkboxDescription(props.description)}
    </span>
    </Tag>
  );
}

export type { checkbox_props };
export default checkbox;
