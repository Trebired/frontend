import { toString } from "#dqy2d22qyujv";
import { type ReactNode } from "react";
import {
  primitiveStackClassName,
  primitiveTextClassName,
} from "#hzrmwbvgt2ax";
import "./index.client.js";

type radio_option = {
  bodyClassName?: string;
  checked?: boolean;
  content?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  id?: string;
  input_attrs?: Record<string, unknown>;
  inputClassName?: string;
  optionClassName?: string;
  tag?: "div" | "label";
  title?: ReactNode;
  value: string;
  wrap_attrs?: Record<string, unknown>;
};

type radio_props = {
  className?: string;
  currentValue?: string;
  name: string;
  options?: radio_option[];
};

type radio_option_render_props = {
  currentValue: string;
  index: number;
  inputName: string;
  option: radio_option;
};

function radioOptionModel(props: radio_option_render_props) {
  const option = props.option;
  const Tag: any = option && option.tag === "div" ? "div" : "label";
  const optionValue =
  option && option.value != null ? String(option.value) : "";
  const optionId = toString(
    option && option.id,
    props.inputName
    ? `${props.inputName}_${props.index}`
    : `radio_option_${props.index}`,
  );
  const checked =
  option && option.checked === true
  ? true
  : props.currentValue === optionValue;
  const optionClass = toString(option && option.optionClassName);
  const optionBodyClass = toString(option && option.bodyClassName);
  const inputClass = toString(option && option.inputClassName);
  const optionClassName = `choice-row radio-option radius-lg${optionClass ? ` ${optionClass}` : ""}`;
  const optionBodyClassName = `radio-option-body flex-1${optionBodyClass ? ` ${optionBodyClass}` : ""}`;
  const computedInputClassName = `radio-input radio${inputClass ? ` ${inputClass}` : ""}`;
  const title =
  option && "title" in option ? option.title : option && option.content;
  return {
    checked,
    computedInputClassName,
    optionBodyClassName,
    optionClassName,
    optionId,
    optionValue,
    Tag,
    title,
  };
}

function radioInput(option: radio_option, props: any, model: any) {
  return (
    <input
    {...(toString(model.optionId) ? { id: toString(model.optionId) } : {})}
    type="radio"
    name={props.inputName}
    value={model.optionValue}
    className={model.computedInputClassName}
    tabIndex={-1}
    defaultChecked={model.checked}
    disabled={option && option.disabled === true}
    {...(option &&
          option.input_attrs &&
          typeof option.input_attrs === "object"
        ? option.input_attrs
        : {})}
    />
  );
}

function radioDescription(option: radio_option) {
  if (!option || !option.description) return null;
  return (
    <span className={primitiveTextClassName({
      breakWord: true,
      className: "radio-option-description",
      muted: true,
      size: "sm",
    })}>
    {option.description}
    </span>
  );
}

function radioOption(props: radio_option_render_props) {
  const option = props.option;
  const model = radioOptionModel(props);
  const Tag = model.Tag;
  return (
    <Tag
    key={model.optionId}
    className={model.optionClassName}
    {...(option && option.wrap_attrs && typeof option.wrap_attrs === "object"
        ? option.wrap_attrs
        : {})}
    >
    {radioInput(option, props, model)}
    <span className="radio-control" aria-hidden="true">
    <span className="radio-control-icon active" />
    </span>
    <span className={model.optionBodyClassName}>
    <span className="radio-option-title">{model.title}</span>
    {radioDescription(option)}
    </span>
    </Tag>
  );
}

function radio(props: radio_props) {
  const options = Array.isArray(props.options) ? props.options : [];
  if (options.length < 2) return null;

  const currentValue = String(props.currentValue || "");
  const groupClassName = [
    "radio-group-root",
    toString(props.className) || primitiveStackClassName({ gap: "xs" }),
  ]
  .filter(Boolean)
  .join(" ");
  const inputName = toString(props.name);

  return (
    <div className={groupClassName} data-tbf-radio-group="">
    {options.map((option, index) =>
        radioOption({
            currentValue,
            index,
            inputName,
            option,
        }),
    )}
    </div>
  );
}

export type { radio_option, radio_props };
export default radio;
