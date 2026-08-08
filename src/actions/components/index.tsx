import type {
  ButtonHTMLAttributes,
  FormHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { classNames, dataBool, jsonScript } from "#ndsvdqv80epr";

type ActionFormProps = FormHTMLAttributes<HTMLFormElement> & {
  actionConfig?: Record<string, unknown>;
  body?: "json";
  children?: ReactNode;
  confirm?: boolean;
  ignoreResponseAction?: boolean;
  jsonBody?: boolean;
  lifecycle?: boolean;
  silent?: boolean;
  success?: "soft-reload";
  successConfetti?: boolean;
  successTab?: string;
};

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  actionBody?: Record<string, unknown>;
  actionMethod?: string;
  actionUrl?: string;
  confirm?: boolean;
  ignoreResponseAction?: boolean;
  success?: "soft-reload";
  successConfetti?: boolean;
  successTab?: string;
};

type ActionTriggerProps = HTMLAttributes<HTMLButtonElement> & {
  action: string;
  externalHref?: string;
  href?: string;
};

function actionConfig(props: ActionFormProps) {
  return {
    ...(props.actionConfig || {}),
    ...(props.body ? { body: props.body } : {}),
    ...(props.jsonBody ? { body: "json" } : {}),
    ...(props.ignoreResponseAction ? { ignoreResponseAction: true } : {}),
    ...(props.lifecycle ? { lifecycle: true } : {}),
    ...(props.silent ? { silent: true } : {}),
    ...(props.success ? { success: props.success } : {}),
    ...(props.successConfetti ? { successConfetti: true } : {}),
    ...(props.successTab ? { successTab: props.successTab } : {}),
  };
}

function ActionForm(props: ActionFormProps) {
  const {
    actionConfig: _actionConfig,
    body: _body,
    children,
    className,
    confirm,
    ignoreResponseAction: _ignoreResponseAction,
    jsonBody: _jsonBody,
    lifecycle: _lifecycle,
    silent: _silent,
    success: _success,
    successConfetti: _successConfetti,
    successTab: _successTab,
    ...rest
  } = props;
  const config = actionConfig(props);
  return (
    <form
      {...rest}
      className={classNames("tbf-form", className)}
      data-tbf-action=""
      data-tbf-confirm={dataBool(confirm)}
    >
      {Object.keys(config).length ? (
        <script
          data-tbf-action-config=""
          hidden
          type="application/json"
          dangerouslySetInnerHTML={{ __html: jsonScript(config) }}
        />
      ) : null}
      {children}
    </form>
  );
}

function ActionButton(props: ActionButtonProps) {
  const {
    actionBody,
    actionMethod,
    actionUrl,
    children,
    className,
    confirm,
    ignoreResponseAction,
    success,
    successConfetti,
    successTab,
    type = "button",
    ...rest
  } = props;
  return (
    <button
      {...rest}
      className={classNames("tbf-button", className)}
      data-tbf-action-body={actionBody ? jsonScript(actionBody) : undefined}
      data-tbf-action-method={actionMethod}
      data-tbf-action-url={actionUrl}
      data-tbf-confetti={dataBool(successConfetti)}
      data-tbf-confirm={dataBool(confirm)}
      data-tbf-ignore-response-action={dataBool(ignoreResponseAction)}
      data-tbf-success={success}
      data-tbf-success-tab={successTab}
      type={type}
    >
      {children}
    </button>
  );
}

function ActionTrigger(props: ActionTriggerProps) {
  const { action, children, className, externalHref, href, role, tabIndex, ...rest } = props;
  return (
    <button
      {...rest}
      className={classNames("tbf-action-trigger", className)}
      data-tbf-action-trigger={action}
      data-tbf-external-href={externalHref}
      data-tbf-href={href}
      role={role}
      tabIndex={tabIndex}
      type="button"
    >
      {children}
    </button>
  );
}

export { ActionButton, ActionForm, ActionTrigger };
export type { ActionButtonProps, ActionFormProps, ActionTriggerProps };
