import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { classNames } from "#ndsvdqv80epr";
import { FRONTEND_PREFIX, frontendClassName, frontendDataAttrs } from "#5vbaqj4pirp3";

type TooltipButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tooltip: string;
};

type TooltipTextProps = HTMLAttributes<HTMLSpanElement> & {
  tooltip: string;
};

type StatusIconProps = HTMLAttributes<HTMLSpanElement> & {
  label: string;
};

function TooltipButton(props: TooltipButtonProps) {
  const { children, className, tooltip, type = "button", ...rest } = props;
  return (
    <button
    {...rest}
    className={classNames(frontendClassName("button"), className)}
    {...frontendDataAttrs({ "tooltip": tooltip })}
    type={type}
    >
    {children}
    </button>
  );
}

function TooltipText(props: TooltipTextProps) {
  const { children, className, tooltip, ...rest } = props;
  return (
    <span
    {...rest}
    className={classNames(frontendClassName("tooltip-text"), className)}
    {...frontendDataAttrs({ "tooltip": tooltip })}
    tabIndex={props.tabIndex ?? 0}
    >
    {children}
    </span>
  );
}

function StatusIcon(props: StatusIconProps) {
  const { children = "i", className, label, ...rest } = props;
  return (
    <span
    {...rest}
    className={classNames(frontendClassName("status-icon"), className)}
    {...frontendDataAttrs({ "status-icon": "" })}
    aria-label={label}
    role="img"
    tabIndex={props.tabIndex ?? 0}
    >
    {children as ReactNode}
    </span>
  );
}

function TooltipLayer(props: HTMLAttributes<HTMLDivElement>) {
  const { className, id = `${FRONTEND_PREFIX}_tooltip`, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames(frontendClassName("tooltip"), className)}
    {...frontendDataAttrs({ "tooltip-layer": "" })}
    id={id}
    aria-hidden="true"
    role="tooltip"
    />
  );
}

export { StatusIcon, TooltipButton, TooltipLayer, TooltipText };
export type { StatusIconProps, TooltipButtonProps, TooltipTextProps };
