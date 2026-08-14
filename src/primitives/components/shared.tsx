import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import type { BindActionTriggerOptions } from "#2qlqsnwrvrgx";
import type { SubmitActionButtonOptions } from "#7yo06l20dfgo";
import { appendClassName, joinClassNames, jsonScript, toText } from "#ndsvdqv80epr";

function jsonAttr(value: unknown) {
  if (value === undefined || typeof value === "function") return undefined;
  return jsonScript(value);
}

function actionButtonAttrs(options?: SubmitActionButtonOptions) {
  if (!options) return {};
  return {
    "data-tbf-action-body": jsonAttr(options.body),
    "data-tbf-action-method": options.method,
    "data-tbf-action-ui": jsonAttr(options.ui),
    "data-tbf-action-url": options.url,
    "data-tbf-confetti": options.successConfetti === true ? "true" : undefined,
    "data-tbf-confirm":
    typeof options.confirm === "boolean" ? String(options.confirm) : undefined,
    "data-tbf-ignore-response-action":
    options.ignoreResponseAction === true ? "true" : undefined,
    "data-tbf-submit": "",
    "data-tbf-success": options.success,
    "data-tbf-success-tab": options.successTab,
  };
}

function actionTriggerAttrs(options?: BindActionTriggerOptions) {
  if (!options) return {};
  return {
    "data-tbf-action-trigger": options.action,
    "data-tbf-external-href": options.externalHref,
    "data-tbf-href": options.href,
  };
}

function wrapTriggerHostNode(children: ReactNode, options?: BindActionTriggerOptions) {
  if (!options || (!options.action && !options.href && !options.externalHref)) {
    return children;
  }
  if (isValidElement(children) && typeof children.type === "string") {
    return cloneElement(
      children as ReactElement<Record<string, unknown>>,
      actionTriggerAttrs(options),
    );
  }
  return (
    <span
    {...actionTriggerAttrs(options)}
    className="action-trigger-host"
    style={{ display: "contents" }}
    >
    {children}
    </span>
  );
}

export {
  actionButtonAttrs,
  actionTriggerAttrs,
  appendClassName,
  joinClassNames,
  jsonAttr,
  toText,
  wrapTriggerHostNode,
};
