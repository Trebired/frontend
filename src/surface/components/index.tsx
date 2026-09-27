import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ImgHTMLAttributes,
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

type PageBandProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "footer" | "section";
  tone?: SurfaceTone;
};

type IconTileProps = HTMLAttributes<HTMLSpanElement> & {
  glyph?: "accent";
  size?: SurfaceSize;
  tone?: SurfaceTone;
};

type AccentRuleProps = HTMLAttributes<HTMLDivElement>;

type ActionRowProps = HTMLAttributes<HTMLElement> & {
  arrow?: ReactNode;
  as?: "a" | "div" | "li";
  href?: string;
  interactive?: boolean;
  softRedirect?: boolean;
  value?: ReactNode;
};

type FrameLayerProps = HTMLAttributes<HTMLDivElement>;

type FrameCoverProps = ImgHTMLAttributes<HTMLImageElement>;

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

function PageBand(props: PageBandProps) {
  const { as: Tag = "section", children, className, tone, ...rest } = props;
  return (
    <Tag {...rest} className={classNames(surfaceClass(frontendClassName("band"), { tone }), className)}>
    <HeadingScope>{children}</HeadingScope>
    </Tag>
  );
}

function IconTile(props: IconTileProps) {
  const { children, className, glyph, size, tone, ...rest } = props;
  return (
    <span
    {...rest}
    aria-hidden
    className={classNames(surfaceClass(frontendClassName("tile"), { size, tone }), className)}
    {...frontendDataAttrs({ "tile-glyph": glyph })}
    >
    {children}
    </span>
  );
}

function AccentRule(props: AccentRuleProps) {
  const { children, className, ...rest } = props;
  return <div {...rest} className={classNames(frontendClassName("rule"), className)}>{children}</div>;
}

function ActionRow(props: ActionRowProps) {
  const { arrow, as, children, className, href, interactive, softRedirect, value, ...rest } = props;
  const Tag = as || (href ? "a" : "div");
  const isInteractive = interactive ?? Boolean(href);
  return (
    <Tag
    {...rest as HTMLAttributes<HTMLElement>}
    className={classNames(frontendClassName("action-row"), className)}
    href={Tag === "a" ? href : undefined}
    {...frontendDataAttrs({ "interactive": isInteractive ? "true" : undefined })}
    {...frontendDataAttrs({ "soft-redirect": softRedirect === true ? "" : undefined })}
    >
    {children}
    {value === undefined ? null : (
        <span className={frontendElementClass("action-row", "body")}>
        <span className={frontendElementClass("action-row", "value")}>{value}</span>
        </span>
    )}
    {arrow === undefined ? null : (
        <span aria-hidden className={frontendElementClass("action-row", "arrow")}>{arrow}</span>
    )}
    </Tag>
  );
}

function FrameCover(props: FrameCoverProps) {
  const { className, ...rest } = props;
  return <img {...rest} alt={rest.alt || ""} className={classNames(frontendElementClass("frame", "cover"), className)} />;
}

function FrameScrim(props: FrameLayerProps) {
  const { className, ...rest } = props;
  return <div {...rest} aria-hidden className={classNames(frontendElementClass("frame", "scrim"), className)} />;
}

function FrameCaption(props: FrameLayerProps) {
  const { children, className, ...rest } = props;
  return <div {...rest} className={classNames(frontendElementClass("frame", "caption"), className)}>{children}</div>;
}

function FrameAction(props: FrameLayerProps) {
  const { children, className, ...rest } = props;
  return <div {...rest} className={classNames(frontendElementClass("frame", "action"), className)}>{children}</div>;
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

export {
  AccentRule,
  ActionRow,
  Button,
  CanvasPanel,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FrameAction,
  FrameCaption,
  FrameCover,
  FrameScrim,
  HairlineCell,
  HairlinePanel,
  IconTile,
  PageBand,
};
export type {
  AccentRuleProps,
  ActionRowProps,
  ButtonProps,
  CanvasPanelProps,
  CardProps,
  FrameCoverProps,
  FrameLayerProps,
  HairlineCellProps,
  HairlinePanelProps,
  IconTileProps,
  PageBandProps,
};
