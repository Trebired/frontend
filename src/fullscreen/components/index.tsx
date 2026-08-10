import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { classNames, dataBool } from "#ndsvdqv80epr";
import type { FullscreenTriggerMode } from "#e1wjbzbsyghi";

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
    className={classNames("tbf-fullscreen-target", className)}
    data-tbf-fullscreen-target=""
    data-tbf-fullscreen-id={fullscreenId}
    data-tbf-fullscreen-group={group}
    data-tbf-fullscreen-persist={dataBool(persist)}
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
    className={classNames("tbf-button tbf-fullscreen-button", className)}
    data-tbf-fullscreen-trigger={panel ? "" : undefined}
    data-tbf-fullscreen-id={fullscreenId}
    data-tbf-fullscreen-group={panel ? group : undefined}
    data-tbf-fullscreen-mode={mode}
    data-tbf-fullscreen-target={nativeTarget}
    data-tbf-fullscreen-toggle={!panel && mode === "toggle" ? "" : undefined}
    data-tbf-fullscreen-enter={!panel && mode === "open" ? "" : undefined}
    data-tbf-fullscreen-exit={!panel && (mode === "close" || mode === "exit") ? "" : undefined}
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
