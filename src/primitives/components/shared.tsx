import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import type { BindActionTriggerOptions } from "#2qlqsnwrvrgx";
import type { SubmitActionButtonOptions } from "#7yo06l20dfgo";
import { appendClassName, joinClassNames, jsonScript, toText } from "#ndsvdqv80epr";
import { frontendDataAttr } from "#5vbaqj4pirp3";

function jsonAttr(value: unknown) {
  if (value === undefined || typeof value === "function") return undefined;
  return jsonScript(value);
}

function actionButtonAttrs(options?: SubmitActionButtonOptions) {
  if (!options) return {};
  return {
    [frontendDataAttr("action-body")]: jsonAttr(options.body),
    [frontendDataAttr("action-method")]: options.method,
    [frontendDataAttr("action-ui")]: jsonAttr(options.ui),
    [frontendDataAttr("action-url")]: options.url,
    [frontendDataAttr("confetti")]: options.successConfetti === true ? "true" : undefined,
    [frontendDataAttr("confirm")]:
    typeof options.confirm === "boolean" ? String(options.confirm) : undefined,
    [frontendDataAttr("ignore-response-action")]:
    options.ignoreResponseAction === true ? "true" : undefined,
    [frontendDataAttr("submit")]: "",
    [frontendDataAttr("success")]: options.success,
    [frontendDataAttr("success-tab")]: options.successTab,
  };
}

function actionTriggerAttrs(options?: BindActionTriggerOptions) {
  if (!options) return {};
  return {
    [frontendDataAttr("action-trigger")]: options.action,
    [frontendDataAttr("external-href")]: options.externalHref,
    [frontendDataAttr("href")]: options.href,
  };
}

const NATIVE_TRIGGER_TAGS = new Set(["a", "button", "input", "select", "textarea"]);

function triggerSemanticsAttrs(
  options: BindActionTriggerOptions,
  tag: string,
  existing?: Record<string, unknown>,
) {
  if (NATIVE_TRIGGER_TAGS.has(tag)) return {};
  const attrs: Record<string, unknown> = {};
  if (existing?.role === undefined) {
    attrs.role = options.href || options.externalHref ? "link" : "button";
  }
  if (existing?.tabIndex === undefined) attrs.tabIndex = 0;
  return attrs;
}

function wrapTriggerHostNode(children: ReactNode, options?: BindActionTriggerOptions) {
  if (!options || (!options.action && !options.href && !options.externalHref)) {
    return children;
  }
  if (isValidElement(children) && typeof children.type === "string") {
    const element = children as ReactElement<Record<string, unknown>>;
    return cloneElement(element, {
        ...actionTriggerAttrs(options),
        ...triggerSemanticsAttrs(options, element.type as string, element.props),
    });
  }
  return (
    <span
    {...actionTriggerAttrs(options)}
    {...triggerSemanticsAttrs(options, "span")}
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
