import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { classNames } from "#ndsvdqv80epr";

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
    className={classNames("tbf-button", className)}
    data-tbf-tooltip={tooltip}
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
    className={classNames("tbf-tooltip-text", className)}
    data-tbf-tooltip={tooltip}
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
    className={classNames("tbf-status-icon", className)}
    data-tbf-status-icon=""
    aria-label={label}
    role="img"
    tabIndex={props.tabIndex ?? 0}
    >
    {children as ReactNode}
    </span>
  );
}

function TooltipLayer(props: HTMLAttributes<HTMLDivElement>) {
  const { className, id = "tbf_tooltip", ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames("tbf-tooltip", className)}
    data-tbf-tooltip-layer=""
    id={id}
    aria-hidden="true"
    role="tooltip"
    />
  );
}

export { StatusIcon, TooltipButton, TooltipLayer, TooltipText };
export type { StatusIconProps, TooltipButtonProps, TooltipTextProps };
