import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { classNames } from "#ndsvdqv80epr";
import { FullscreenCloseButton, FullscreenOpenButton, FullscreenTarget } from "#vbkfq413o3u7";
import { surfaceClass, type SurfaceSize, type SurfaceTone } from "#vuk08leruwgb";
import { FRONTEND_PREFIX, frontendClassName, frontendDataAttr, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { HeadingScope } from "#7ly3b59upz0n";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  rel?: string;
  size?: SurfaceSize;
  softRedirect?: boolean;
  target?: string;
  tone?: SurfaceTone;
};

type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  tone?: SurfaceTone;
};

type HairlinePanelProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "dl" | "ul";
  min?: string;
};

type HairlineCellProps = HTMLAttributes<HTMLElement> & {
  align?: "center" | "start";
  as?: "article" | "div" | "li" | "section";
  interactive?: boolean;
  invert?: boolean;
};

type SectionProps = HTMLAttributes<HTMLElement> & {
  flush?: boolean;
  tone?: "inverse" | "muted";
};

type CanvasPanelProps = HTMLAttributes<HTMLDivElement> & {
  actions?: ReactNode;
  fullscreenId?: string;
  subtitle?: ReactNode;
  title?: ReactNode;
};

function ButtonLink(props: ButtonProps & { href: string; buttonClassName: string }) {
  const { buttonClassName, children, className: _className, href, rel, size: _size, softRedirect,
    target, tone: _tone, type: _type, ...rest } = props;
  const anchorProps = rest as unknown as AnchorHTMLAttributes<HTMLAnchorElement>;
  return (
    <a
    {...anchorProps}
    className={buttonClassName}
    href={href}
    rel={target === "_blank" ? rel || "noopener noreferrer" : rel}
    target={target}
    {...frontendDataAttrs({ "soft-redirect": softRedirect === true ? "" : undefined })}
    >
    {children}
    </a>
  );
}

function Button(props: ButtonProps) {
  const { children, className, href, rel: _rel, size, softRedirect: _softRedirect,
    target: _target, tone, type = "button", ...rest } = props;
  const buttonClassName = classNames(surfaceClass(frontendClassName("button"), { size, tone }), className);
  if (href) return <ButtonLink {...props} buttonClassName={buttonClassName} href={href} />;
  const ariaHasPopup =
  rest["aria-haspopup"] ??
  ((rest as Record<string, unknown>)[frontendDataAttr("modal-open")] === undefined
    ? undefined
    : "dialog");
  return (
    <button {...rest} aria-haspopup={ariaHasPopup} className={buttonClassName} type={type}>
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
    <HeadingScope>{children}</HeadingScope>
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

function HairlinePanel(props: HairlinePanelProps) {
  const { as: Tag = "div", children, className, min, style, ...rest } = props;
  const minStyle = min ? { [`--${FRONTEND_PREFIX}-surf-hairline-root-min`]: min } : undefined;
  return (
    <Tag
    {...rest}
    className={classNames(frontendClassName("hairline"), className)}
    style={minStyle ? { ...minStyle, ...style } : style}
    >
    {children}
    </Tag>
  );
}

function HairlineCell(props: HairlineCellProps) {
  const { align, as: Tag = "div", children, className, interactive, invert, ...rest } = props;
  return (
    <Tag
    {...rest}
    className={classNames(frontendElementClass("hairline", "cell"), className)}
    {...frontendDataAttrs({ "hairline-align": align === "center" ? "center" : undefined })}
    {...frontendDataAttrs({ "hairline-interactive": interactive ? "true" : undefined })}
    {...frontendDataAttrs({ "hairline-invert": invert ? "true" : undefined })}
    >
    {children}
    </Tag>
  );
}

function Section(props: SectionProps) {
  const { children, className, flush, tone, ...rest } = props;
  return (
    <section
    {...rest}
    className={classNames(frontendClassName("section"), className)}
    {...frontendDataAttrs({ "section-flush": flush ? "true" : undefined })}
    {...frontendDataAttrs({ "section-tone": tone })}
    >
    {children}
    </section>
  );
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
    <div className={classNames(frontendElementClass("canvas-panel", "header"), "card")}>
    <div className={frontendElementClass("canvas-panel", "titles")}>
    {props.title ? <span className={frontendElementClass("canvas-panel", "title")}>{props.title}</span> : null}
    {props.subtitle ? <span className={frontendElementClass("canvas-panel", "subtitle")}>{props.subtitle}</span> : null}
    </div>
    <div className={frontendElementClass("canvas-panel", "actions")}>
    {props.actions}
    {props.fullscreenId ? <FullscreenOpenButton fullscreenId={props.fullscreenId}>Open</FullscreenOpenButton> : null}
    {props.fullscreenId ? <FullscreenCloseButton fullscreenId={props.fullscreenId}>Close</FullscreenCloseButton> : null}
    </div>
    </div>
  );
}

export { Button, CanvasPanel, Card, CardBody, CardFooter, CardHeader, HairlineCell, HairlinePanel, Section };
export type { ButtonProps, CanvasPanelProps, CardProps, HairlineCellProps, HairlinePanelProps, SectionProps };
