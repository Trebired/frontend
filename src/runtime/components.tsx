import shared_steps_panel from "#hpgy4recky69";

type RuntimeActionProgressProps = {
  emptyCopy?: string;
  lang?: string;
};

type RuntimeActivityBootstrapProps = {
  activity?: unknown;
};

function jsonScript(value: unknown) {
  return JSON.stringify(value ?? {}).replace(/</g, "\\u003c");
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

export { runtime_action_progress, runtime_activity_bootstrap };
export type { RuntimeActionProgressProps, RuntimeActivityBootstrapProps };
