import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { classNames } from "#ndsvdqv80epr";
import { FullscreenCloseButton, FullscreenOpenButton, FullscreenTarget } from "#vbkfq413o3u7";
import { surfaceClass, type SurfaceSize, type SurfaceTone } from "#vuk08leruwgb";
import { frontendClassName, frontendDataAttr, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: SurfaceSize;
  tone?: SurfaceTone;
};

type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  tone?: SurfaceTone;
};

type CanvasPanelProps = HTMLAttributes<HTMLDivElement> & {
  actions?: ReactNode;
  fullscreenId?: string;
  subtitle?: ReactNode;
  title?: ReactNode;
};

function Button(props: ButtonProps) {
  const { children, className, size, tone, type = "button", ...rest } = props;
  const ariaHasPopup =
  rest["aria-haspopup"] ??
  ((rest as Record<string, unknown>)[frontendDataAttr("modal-open")] === undefined
    ? undefined
    : "dialog");
  return (
    <button {...rest} aria-haspopup={ariaHasPopup} className={classNames(
        surfaceClass(frontendClassName("button"), { size, tone }),
        className
    )} type={type}>
    {children}
    </button>
  );
}

function Card(props: CardProps) {
  const { children, className, interactive, tone, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames(surfaceClass(frontendClassName("card"), { tone }), className)}
    {...frontendDataAttrs({ "card": "" })}
    {...frontendDataAttrs({ "interactive": interactive ? "true" : undefined })}
    >
    {children}
    </div>
  );
}

function CardHeader(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return <div {...rest} className={classNames(frontendElementClass("card", "header"), className)}>{children}</div>;
}

function CardBody(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return <div {...rest} className={classNames(frontendElementClass("card", "body"), className)}>{children}</div>;
}

function CardFooter(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return <div {...rest} className={classNames(frontendElementClass("card", "footer"), className)}>{children}</div>;
}

function CanvasPanel(props: CanvasPanelProps) {
  const { actions, children, className, fullscreenId, subtitle, title, ...rest } = props;
  const body = (
    <div {...rest} className={classNames(frontendClassName("canvas-panel"), className)} {...frontendDataAttrs({ "canvas-panel": "" })}>
    <CanvasPanelHeader actions={actions} fullscreenId={fullscreenId} subtitle={subtitle} title={title} />
    <div className={frontendElementClass("canvas-panel", "body")}>{children}</div>
    </div>
  );
  return fullscreenId ? <FullscreenTarget fullscreenId={fullscreenId}>{body}</FullscreenTarget> : body;
}

function CanvasPanelHeader(props: Pick<CanvasPanelProps, "actions" | "fullscreenId" | "subtitle" | "title">) {
  if (!props.title && !props.subtitle && !props.actions && !props.fullscreenId) return null;
  return (
    <div className={frontendElementClass("canvas-panel", "header")}>
    <div className={frontendElementClass("canvas-panel", "titles")}>
    {props.title ? <strong>{props.title}</strong> : null}
    {props.subtitle ? <span>{props.subtitle}</span> : null}
    </div>
    <div className={frontendElementClass("canvas-panel", "actions")}>
    {props.actions}
    {props.fullscreenId ? <FullscreenOpenButton fullscreenId={props.fullscreenId}>Open</FullscreenOpenButton> : null}
    {props.fullscreenId ? <FullscreenCloseButton fullscreenId={props.fullscreenId}>Close</FullscreenCloseButton> : null}
    </div>
    </div>
  );
}

export { Button, CanvasPanel, Card, CardBody, CardFooter, CardHeader };
export type { ButtonProps, CanvasPanelProps, CardProps };
