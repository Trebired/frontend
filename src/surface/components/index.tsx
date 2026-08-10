import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { classNames } from "#ndsvdqv80epr";
import { FullscreenCloseButton, FullscreenOpenButton, FullscreenTarget } from "#vbkfq413o3u7";
import { surfaceClass, type SurfaceSize, type SurfaceTone } from "#vuk08leruwgb";

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
  return (
    <button {...rest} className={classNames(surfaceClass("tbf-button", { size, tone }), className)} type={type}>
    {children}
    </button>
  );
}

function Card(props: CardProps) {
  const { children, className, interactive, tone, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames(surfaceClass("tbf-card", { tone }), className)}
    data-tbf-card=""
    data-tbf-interactive={interactive ? "true" : undefined}
    >
    {children}
    </div>
  );
}

function CardHeader(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return <div {...rest} className={classNames("tbf-card__header", className)}>{children}</div>;
}

function CardBody(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return <div {...rest} className={classNames("tbf-card__body", className)}>{children}</div>;
}

function CardFooter(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return <div {...rest} className={classNames("tbf-card__footer", className)}>{children}</div>;
}

function CanvasPanel(props: CanvasPanelProps) {
  const { actions, children, className, fullscreenId, subtitle, title, ...rest } = props;
  const body = (
    <div {...rest} className={classNames("tbf-canvas-panel", className)} data-tbf-canvas-panel="">
    <CanvasPanelHeader actions={actions} fullscreenId={fullscreenId} subtitle={subtitle} title={title} />
    <div className="tbf-canvas-panel__body">{children}</div>
    </div>
  );
  return fullscreenId ? <FullscreenTarget fullscreenId={fullscreenId}>{body}</FullscreenTarget> : body;
}

function CanvasPanelHeader(props: Pick<CanvasPanelProps, "actions" | "fullscreenId" | "subtitle" | "title">) {
  if (!props.title && !props.subtitle && !props.actions && !props.fullscreenId) return null;
  return (
    <div className="tbf-canvas-panel__header">
    <div className="tbf-canvas-panel__titles">
    {props.title ? <strong>{props.title}</strong> : null}
    {props.subtitle ? <span>{props.subtitle}</span> : null}
    </div>
    <div className="tbf-canvas-panel__actions">
    {props.actions}
    {props.fullscreenId ? <FullscreenOpenButton fullscreenId={props.fullscreenId}>Open</FullscreenOpenButton> : null}
    {props.fullscreenId ? <FullscreenCloseButton fullscreenId={props.fullscreenId}>Close</FullscreenCloseButton> : null}
    </div>
    </div>
  );
}

export { Button, CanvasPanel, Card, CardBody, CardFooter, CardHeader };
export type { ButtonProps, CanvasPanelProps, CardProps };
