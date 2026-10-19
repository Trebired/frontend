import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { Icon } from "#lbkpzw8nphru";
import { button as PrimitiveButton } from "#hzrmwbvgt2ax";
import type { ButtonProps } from "#xb7hv37sq5h5";

type VisibilityScopeProps = HTMLAttributes<HTMLDivElement> & { hidden?: boolean };

type VisibilityTargetProps = HTMLAttributes<HTMLDivElement>;

type VisibilityToggleProps = Omit<ButtonProps, "children" | "className" | "tooltip"> & {
  className?: string;
  tooltip?: boolean | string;
  hiddenIcon?: string;
  hiddenLabel?: string;
  shownIcon?: string;
  shownLabel?: string;
};

function visibilityScopeAttrs(hidden?: boolean) {
  return frontendDataAttrs({ visibility: hidden ? "hidden" : "shown" });
}

function visibilityTargetAttrs() {
  return frontendDataAttrs({ "visibility-target": "" });
}

function VisibilityScope(props: VisibilityScopeProps) {
  const { children, className, hidden, ...rest } = props;
  return (
    <div {...rest} className={classNames(frontendClassName("visibility"), className)} {...visibilityScopeAttrs(hidden)}>
    {children}
    </div>
  );
}

function VisibilityTarget(props: VisibilityTargetProps) {
  const { children, className, ...rest } = props;
  return (
    <div {...rest} className={classNames(frontendElementClass("visibility", "target"), className)} {...visibilityTargetAttrs()}>
    {children}
    </div>
  );
}

function VisibilityIcon({ spec, when }: { spec: string; when: "hidden" | "shown" }): ReactNode {
  return (
    <span className={frontendElementClass("visibility", "icon")} {...frontendDataAttrs({ "visibility-when": when })}>
    <Icon spec={spec} />
    </span>
  );
}

function VisibilityToggle(props: VisibilityToggleProps) {
  const {
    className,
    hiddenIcon = "remixicon:eye-line",
    hiddenLabel,
    shownIcon = "remixicon:eye-off-line",
    shownLabel,
    tooltip,
    ...rest
  } = props;

  return (
    <PrimitiveButton
    icon
    {...rest}
    aria-pressed={false}
    className={classNames(frontendElementClass("visibility", "trigger"), className)}
    {...frontendDataAttrs({ "visibility-trigger": "" })}
    {...frontendDataAttrs({ "visibility-label-hidden": hiddenLabel, "visibility-label-shown": shownLabel })}
    tooltip={tooltip === true ? shownLabel : tooltip}
    >
    <VisibilityIcon spec={shownIcon} when="shown" />
    <VisibilityIcon spec={hiddenIcon} when="hidden" />
    </PrimitiveButton>
  );
}

export { VisibilityScope, VisibilityTarget, VisibilityToggle, visibilityScopeAttrs, visibilityTargetAttrs };
export type { VisibilityScopeProps, VisibilityTargetProps, VisibilityToggleProps };
