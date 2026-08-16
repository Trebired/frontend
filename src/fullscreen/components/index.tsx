import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { classNames, dataBool } from "#ndsvdqv80epr";
import type { FullscreenTriggerMode } from "#e1wjbzbsyghi";
import { frontendClassName, frontendDataAttrs } from "#5vbaqj4pirp3";

type FullscreenTargetProps = HTMLAttributes<HTMLDivElement> & {
  fullscreenId: string;
  group?: string;
  persist?: boolean;
};

type FullscreenButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullscreenId?: string;
  group?: string;
  mode?: FullscreenTriggerMode;
  nativeTarget?: string;
};

function FullscreenTarget(props: FullscreenTargetProps) {
  const {
    children,
    className,
    fullscreenId,
    group = "default",
    persist,
    ...rest
  } = props;
  return (
    <div
    {...rest}
    className={classNames(frontendClassName("fullscreen-target"), className)}
    {...frontendDataAttrs({ "fullscreen-target": "" })}
    {...frontendDataAttrs({ "fullscreen-id": fullscreenId })}
    {...frontendDataAttrs({ "fullscreen-group": group })}
    {...frontendDataAttrs({ "fullscreen-persist": dataBool(persist) })}
    >
    {children as ReactNode}
    </div>
  );
}

function FullscreenButton(props: FullscreenButtonProps) {
  const {
    children,
    className,
    fullscreenId,
    group = "default",
    mode = "toggle",
    nativeTarget,
    type = "button",
    ...rest
  } = props;
  const panel = Boolean(fullscreenId);
  return (
    <button
    {...rest}
    className={classNames(`${frontendClassName("button")} ${frontendClassName("fullscreen-button")}`, className)}
    {...frontendDataAttrs({ "fullscreen-trigger": panel ? "" : undefined })}
    {...frontendDataAttrs({ "fullscreen-id": fullscreenId })}
    {...frontendDataAttrs({ "fullscreen-group": panel ? group : undefined })}
    {...frontendDataAttrs({ "fullscreen-mode": mode })}
    {...frontendDataAttrs({ "fullscreen-target": nativeTarget })}
    {...frontendDataAttrs({ "fullscreen-toggle": !panel && mode === "toggle" ? "" : undefined })}
    {...frontendDataAttrs({ "fullscreen-enter": !panel && mode === "open" ? "" : undefined })}
    {...frontendDataAttrs({ "fullscreen-exit": !panel && (mode === "close" || mode === "exit") ? "" : undefined })}
    type={type}
    >
    {children}
    </button>
  );
}

function FullscreenOpenButton(props: Omit<FullscreenButtonProps, "mode">) {
  return <FullscreenButton {...props} mode="open" />;
}

function FullscreenCloseButton(props: Omit<FullscreenButtonProps, "mode">) {
  return <FullscreenButton {...props} mode="close" />;
}

export {
  FullscreenButton,
  FullscreenCloseButton,
  FullscreenOpenButton,
  FullscreenTarget,
};
export type { FullscreenButtonProps, FullscreenTargetProps };
