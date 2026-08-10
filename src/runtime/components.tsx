import { toString } from "#dqy2d22qyujv";
import dropdown from "#79y0zfcyhzga";
import { Icon } from "#lbkpzw8nphru";
import shared_steps_panel from "#hpgy4recky69";
import { jsonScript } from "#ndsvdqv80epr";

type attr_map = Record<string, string | number | boolean | null | undefined>;

type RuntimeActionProgressProps = {
  emptyCopy?: string;
  lang?: string;
};

type RuntimeActivityBootstrapProps = {
  activity?: unknown;
};

type runtime_dropdown_props = {
  className?: string;
  disabled?: boolean;
  id?: string;
  inputId?: string;
  inputProps?: attr_map;
  label?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  wrapperClassName?: string;
};

function runtimeOption(value: unknown) {
  const normalized = toString(value, "nodejs").toLowerCase();
  if (normalized === "bun")
  return { iconSpec: "simple-icons bun", label: "Bun", value: "bun" };
  if (normalized === "deno")
  return { iconSpec: "simple-icons deno", label: "Deno", value: "deno" };
  return {
    iconSpec: "simple-icons nodedotjs",
    label: "Node.js",
    value: "nodejs",
  };
}

function runtimeOptionContent(option: ReturnType<typeof runtimeOption>) {
  return (
    <>
    <Icon spec={option.iconSpec} />
    {option.label}
    </>
  );
}

function runtimeOptions() {
  return ["nodejs", "bun", "deno"].map((value) => {
      const option = runtimeOption(value);
      return {
        html: runtimeOptionContent(option),
        label: option.label,
        value: option.value,
      };
  });
}

function runtime_action_progress(props: RuntimeActionProgressProps = {}) {
  return shared_steps_panel({
      type: "disclosure",
      lang: props.lang,
      progressBarAttr: "data-runtime-action-progress-bar",
      dataAttrs: {
        "data-runtime-action-progress-panel": "",
      },
      emptyCopy:
      String(props.emptyCopy || "").trim() || "No steps yet.",
      hidden: false,
  });
}

function runtime_activity_bootstrap(props: RuntimeActivityBootstrapProps) {
  return (
    <script
    type="application/json"
    data-runtime-activity-bootstrap=""
    dangerouslySetInnerHTML={{
        __html: jsonScript(
          props && props.activity && typeof props.activity === "object"
          ? props.activity
          : {},
        ),
    }}
    />
  );
}

function runtime_dropdown(props: runtime_dropdown_props) {
  const selected = runtimeOption(props.value);
  return dropdown({
      className: toString(props.className, "width-max"),
      disabled: props.disabled === true,
      id: props.id,
      inputId: props.inputId,
      inputProps: props.inputProps,
      label: props.label,
      name: toString(props.name, "runtime"),
      options: runtimeOptions(),
      placeholder: toString(props.placeholder, selected.label),
      selectedHtml: runtimeOptionContent(selected),
      value: selected.value,
      wrapperClassName: props.wrapperClassName,
  });
}

export {
  runtime_action_progress,
  runtime_activity_bootstrap,
  runtime_dropdown,
};
export type {
  RuntimeActionProgressProps,
  RuntimeActivityBootstrapProps,
  runtime_dropdown_props,
};
