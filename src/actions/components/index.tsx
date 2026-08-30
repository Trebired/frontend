import type {
  ButtonHTMLAttributes,
  FormHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import type { BindActionTriggerOptions } from "#2qlqsnwrvrgx";
import { classNames, dataBool, jsonScript } from "#ndsvdqv80epr";
import {
  actionTriggerAttrs,
  wrapTriggerHostNode,
} from "#6mupcizo1mwq";
import { frontendClassName, frontendDataAttrs } from "#5vbaqj4pirp3";

type ActionFormProps = FormHTMLAttributes<HTMLFormElement> & {
  actionConfig?: Record<string, unknown>;
  body?: "json";
  children?: ReactNode;
  closeModal?: boolean;
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
  closeModal?: boolean;
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
type ActionTriggerHostOptions = BindActionTriggerOptions;

function actionConfig(props: ActionFormProps) {
  return {
    ...(props.actionConfig || {}),
    ...(props.body ? { body: props.body } : {}),
    ...(props.jsonBody ? { body: "json" } : {}),
    ...(props.closeModal ? { closeModal: true } : {}),
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
    closeModal: _closeModal,
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
    className={classNames(frontendClassName("form"), className)}
    {...frontendDataAttrs({ "action": "" })}
    {...frontendDataAttrs({ "confirm": dataBool(confirm) })}
    >
    {Object.keys(config).length ? (
        <script
        {...frontendDataAttrs({ "action-config": "" })}
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
    closeModal,
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
    className={classNames(frontendClassName("button"), className)}
    {...frontendDataAttrs({ "action-body": actionBody ? jsonScript(actionBody) : undefined })}
    {...frontendDataAttrs({ "action-method": actionMethod })}
    {...frontendDataAttrs({ "action-url": actionUrl })}
    {...frontendDataAttrs({ "close-modal": dataBool(closeModal) })}
    {...frontendDataAttrs({ "confetti": dataBool(successConfetti) })}
    {...frontendDataAttrs({ "confirm": dataBool(confirm) })}
    {...frontendDataAttrs({ "ignore-response-action": dataBool(ignoreResponseAction) })}
    {...frontendDataAttrs({ "success": success })}
    {...frontendDataAttrs({ "success-tab": successTab })}
    type={type}
    >
    {children}
    </button>
  );
}

function ActionTrigger(props: ActionTriggerProps) {
  const { action, children, className, externalHref, href, role, tabIndex, ...rest } = props;
  const triggerAttrs = actionTriggerAttrs({ action, externalHref, href });
  return (
    <button
    {...rest}
    className={classNames(frontendClassName("action-trigger"), className)}
    {...triggerAttrs}
    role={role}
    tabIndex={tabIndex}
    type="button"
    >
    {children}
    </button>
  );
}

export {
  ActionButton,
  ActionForm,
  ActionTrigger,
  wrapTriggerHostNode as actionTrigger,
};
export type {
  ActionButtonProps,
  ActionFormProps,
  ActionTriggerHostOptions,
  ActionTriggerProps,
};
export {
  add_button,
  cancel_button,
  copy_button,
  copy_code_card,
  create_button,
  delete_button,
  drop_button,
  force_stop_button,
  insert_button,
  install_button,
  remove_button,
  removeConfirmationAttrs,
  restart_button,
  save_icon,
  show_button,
  standardActionButton,
  start_button,
  stop_button,
} from "#k632wzgl64a3";
export type {
  CopyButtonProps,
  CopyCodeCardProps,
  RemoveConfirmationProps,
  SaveIconButtonProps,
  StandardActionButtonProps,
} from "#k632wzgl64a3";
