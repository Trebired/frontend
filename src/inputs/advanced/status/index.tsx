import { icon } from "#dqy2d22qyujv";
import sharedInput from "#8y47rueq20kg";
import { primitiveStackClassName } from "#hzrmwbvgt2ax";
import "./index.client.js";
import { frontendDataAttrs } from "#5vbaqj4pirp3";

type BackendStatusCheckConfig = {
  endpoint: string;
  errorReasons?: Record<string, string>;
  field?: string;
  kind: string;
  missingReason?: string;
  requestFailedReason?: string;
  reasonSource?: "status_code" | "summary";
  trim?: boolean;
};

type MatchStatusConfig = {
  mismatchReason?: string;
  requiredReason?: string;
  targetId: string;
};

type status_input_props = {
  autoComplete?: string;
  className?: string;
  defaultValue?: string;
  id?: string;
  inputAttrs?: Record<string, unknown>;
  label: string;
  matchStatus?: MatchStatusConfig | false | null;
  name: string;
  placeholder?: string;
  required?: boolean;
  statusCheck?: BackendStatusCheckConfig | false | null;
  statusIcons?: boolean;
  type?: string;
  wrapAttrs?: Record<string, unknown>;
};

function backendStatusConfig(check: BackendStatusCheckConfig, name: string) {
  return {
    endpoint: check.endpoint,
    errorReasons: check.errorReasons || {},
    field: check.field || name,
    kind: check.kind,
    missingReason: check.missingReason || "",
    reasonSource: check.reasonSource || "status_code",
    requestFailedReason: check.requestFailedReason || "",
    trim: check.trim !== false,
  };
}

function statusIcons() {
  return (
    <>
    <span className="input-status-icon ok" {...frontendDataAttrs({ "status-icon": "" })} hidden>
    {icon({ spec: "remixicon checkbox-circle-line" })}
    </span>
    <span className="input-status-icon bad" {...frontendDataAttrs({ "status-icon": "" })} hidden>
    {icon({ spec: "remixicon close-circle-line" })}
    </span>
    </>
  );
}

function statusFieldConfig(props: status_input_props) {
  const check = props.statusCheck || null;
  const config = {
    ...(check ? backendStatusConfig(check, props.name) : {}),
    ...(props.matchStatus ? { match: props.matchStatus } : {}),
  };
  return config;
}

function statusConfigScript(config: Record<string, unknown>) {
  return (
    <script data-status-field-config="" hidden type="application/json">
    {JSON.stringify(config)}
    </script>
  );
}

function status_input(props: status_input_props) {
  const required = props.required === false ? {} : { required: true };
  const check = props.statusCheck || null;
  const match = props.matchStatus || null;
  const shouldWrap = Boolean(check || match || props.statusIcons);
  const { className: wrapClassName, ...wrapAttrs } = props.wrapAttrs || {};
  const inputAttrs = {
    ...(props.inputAttrs || {}),
  };

  const input = sharedInput({
      className: props.className,
      type: props.type || "text",
      id: props.id || undefined,
      name: props.name,
      defaultValue: props.defaultValue || "",
      autoComplete: props.autoComplete || undefined,
      placeholder: props.placeholder || undefined,
      ...inputAttrs,
      ...required,
  });

  return (
    <label className={primitiveStackClassName({ gap: "xs" })}>
    <span className="label">{props.label}</span>
    {shouldWrap ? (
        <div
        className={["input-status-wrap", wrapClassName]
          .filter(Boolean)
          .join(" ")}
        data-status-field=""
        {...wrapAttrs}
        >
        {statusConfigScript(statusFieldConfig(props))}
        {input}
        {statusIcons()}
        </div>
      ) : (
        input
    )}
    </label>
  );
}

export { status_input };
export type { BackendStatusCheckConfig, MatchStatusConfig, status_input_props };
