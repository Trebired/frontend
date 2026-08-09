import { createLocalTranslator } from "#dqy2d22qyujv";
import { toString } from "#dqy2d22qyujv";
import type { ReactNode } from "react";
import { button } from "#dqy2d22qyujv";
import {
  primitiveStackClassName,
  primitiveTextClassName,
} from "#hzrmwbvgt2ax";

type toggle_option = {
  available?: boolean;
  description?: ReactNode;
  label: ReactNode;
  statusLabel?: ReactNode;
  value: string;
};

type toggle_props = {
  className?: string;
  currentValue?: string;
  inputId?: string;
  lang?: string;
  name?: string;
  options?: toggle_option[];
};

function readCurrentToggleValue(props: toggle_props, options: toggle_option[]) {
  return (
    toString(props.currentValue) ||
      toString(
      options.find((option) => option && option.available !== false)?.value,
    ) ||
      toString(options[0] && options[0].value)
  );
}

function toggleSideButton(props: {
    currentValue: string;
    index: number;
    lang?: string;
    option?: toggle_option;
}) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  const option = props.option;
  const value = toString(option && option.value, `option_${props.index}`);
  const isActive = props.currentValue === value;
  const isAvailable = option && option.available !== false;
  const note = isAvailable
  ? option && option.description
  : option && option.statusLabel
  ? option.statusLabel
  : localT("state.unavailable");

  return (
    <button
    key={value}
    type="button"
    className={`toggle-side${isActive ? " active" : ""}${isAvailable ? "" : " is-unavailable"}`}
    data-toggle-option=""
    data-value={value}
    aria-pressed={isActive ? "true" : "false"}
    >
    <span className="toggle-side-label">{option && option.label}</span>
    {note ? (
        <span className={primitiveTextClassName({ className: "toggle-side-note", muted: true })}>{note}</span>
      ) : null}
    </button>
  );
}

function toggleHiddenInput(name: string, id: string, value: string) {
  if (!name) return null;
  return (
    <input
    {...(id ? { id } : {})}
    type="hidden"
    name={name}
    value={value}
    data-toggle-input=""
    />
  );
}

function toggleHandle(
  currentValue: string,
  options: toggle_option[],
  localT: any,
) {
  return button({
      type: "button",
      "data-toggle-handle": "",
      role: "switch",
      "aria-checked":
      currentValue === toString(options[1] && options[1].value)
      ? "true"
      : "false",
      "aria-label": localT("actions.toggle"),
      className: "toggle-handle",
      children: (
        <>
        <span className="toggle-track" aria-hidden="true">
        <span className="toggle-thumb" />
        </span>
        </>
      ),
  });
}

function toggle(props: toggle_props) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  const options = (Array.isArray(props.options) ? props.options : []).slice(
    0,
    2,
  );
  if (options.length < 2) return null;
  const currentValue = readCurrentToggleValue(props, options);
  const wrapperClassName = toString(props.className) || primitiveStackClassName({ gap: "xs" });
  const inputName = toString(props.name);
  const inputId = toString(props.inputId);
  return (
    <div
    className={wrapperClassName}
    data-toggle=""
    data-toggle-value={currentValue}
    >
    {toggleHiddenInput(inputName, inputId, currentValue)}
    <div className="toggle" data-toggle-ui="">
    {toggleSideButton({
          currentValue,
          index: 0,
          lang: props.lang,
          option: options[0],
    })}
    {toggleHandle(currentValue, options, localT)}
    {toggleSideButton({
          currentValue,
          index: 1,
          lang: props.lang,
          option: options[1],
    })}
    </div>
    </div>
  );
}

export type { toggle_option, toggle_props };
export default toggle;
