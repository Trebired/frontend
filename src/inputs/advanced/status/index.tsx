import sharedInput from "#8y47rueq20kg";
import { primitiveStackClassName } from "#hzrmwbvgt2ax";
import "./index.client.js";
import { frontendClassName, frontendDataAttrs } from "#5vbaqj4pirp3";
import { describedBy, fieldError, fieldHelp, fieldIds, statusIcons } from "./field.js";

type BackendStatusCheckConfig = {
  contextFields?: Record<string, string>;
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
  help?: string;
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
    contextFields: check.contextFields || {},
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
    <script {...frontendDataAttrs({ "status-field-config": "" })} hidden type="application/json">
    {JSON.stringify(config)}
    </script>
  );
}

function status_input(props: status_input_props) {
  const required = props.required === false ? {} : { "aria-required": "true", required: true };
  const check = props.statusCheck || null;
  const match = props.matchStatus || null;
  const shouldWrap = Boolean(check || match || props.statusIcons);
  const { className: wrapClassName, ...wrapAttrs } = props.wrapAttrs || {};
  const help = String(props.help || "").trim();
  const ids = fieldIds(props.id || `${props.name}-field`);

  const input = sharedInput({
      className: props.className,
      type: props.type || "text",
      id: ids.input,
      name: props.name,
      defaultValue: props.defaultValue || "",
      autoComplete: props.autoComplete || undefined,
      placeholder: props.placeholder || undefined,
      "aria-describedby": describedBy(ids, Boolean(help)),
      "aria-invalid": "false",
      ...(props.inputAttrs || {}),
      ...required,
  });

  return (
    <div className={primitiveStackClassName({ gap: "xs" })}>
    <label className={frontendClassName("label")} htmlFor={ids.input}>{props.label}</label>
    {fieldHelp(ids, help)}
    {shouldWrap ? (
        <div
        className={[frontendClassName("input-status-wrap"), wrapClassName]
          .filter(Boolean)
          .join(" ")}
        {...frontendDataAttrs({ "status-field": "" })}
        {...wrapAttrs}
        >
        {statusConfigScript(statusFieldConfig(props))}
        {input}
        {statusIcons()}
        </div>
      ) : (
        input
    )}
    {fieldError(ids)}
    </div>
  );
}

export { status_input };
export type { BackendStatusCheckConfig, MatchStatusConfig, status_input_props };
