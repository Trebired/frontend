import type {
  ButtonHTMLAttributes,
  FormHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { classNames, dataBool, jsonScript } from "#ndsvdqv80epr";

type ActionFormProps = FormHTMLAttributes<HTMLFormElement> & {
  actionConfig?: Record<string, unknown>;
  children?: ReactNode;
  confirm?: boolean;
  jsonBody?: boolean;
  silent?: boolean;
  successConfetti?: boolean;
};

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  actionBody?: Record<string, unknown>;
  actionMethod?: string;
  actionUrl?: string;
  confirm?: boolean;
  successConfetti?: boolean;
};

type ActionTriggerProps = HTMLAttributes<HTMLButtonElement> & {
  action: string;
  href?: string;
};

function actionConfig(props: ActionFormProps) {
  return {
    ...(props.actionConfig || {}),
    ...(props.jsonBody ? { body: "json" } : {}),
    ...(props.silent ? { silent: true } : {}),
    ...(props.successConfetti ? { successConfetti: true } : {}),
  };
}

function ActionForm(props: ActionFormProps) {
  const {
    actionConfig: _actionConfig,
    children,
    className,
    confirm,
    jsonBody: _jsonBody,
    silent: _silent,
    successConfetti: _successConfetti,
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
    successConfetti,
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
      type={type}
    >
      {children}
    </button>
  );
}

function ActionTrigger(props: ActionTriggerProps) {
  const { action, children, className, href, role, tabIndex, ...rest } = props;
  return (
    <button
      {...rest}
      className={classNames("tbf-action-trigger", className)}
      data-tbf-action-trigger={action}
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
