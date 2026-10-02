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
import type { PrimitiveButtonVariant } from "#0rl8rpgzssot";
import { FRONTEND_PREFIX, frontendClassName, frontendDataAttr, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { HeadingScope } from "#7ly3b59upz0n";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  download?: boolean | string;
  href?: string;
  rel?: string;
  size?: SurfaceSize;
  softRedirect?: boolean;
  target?: string;
  variant?: PrimitiveButtonVariant;
};

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "a" | "article" | "div" | "li" | "section";
  href?: string;
  interactive?: boolean;
  softRedirect?: boolean;
  tone?: SurfaceTone;
};

type CardSectionProps = HTMLAttributes<HTMLDivElement> & {
  padding?: SurfaceSize;
};

type FrameProps = HTMLAttributes<HTMLDivElement> & {
  ratio?: string;
};

type PinnedSplitProps = HTMLAttributes<HTMLDivElement> & {
  aside: ReactNode;
  asideSide?: "end" | "start";
  asideWidth?: string;
  top?: string;
};

type TrackListProps = HTMLAttributes<HTMLOListElement> & {
  as?: "ol" | "ul";
};

type TrackItemProps = HTMLAttributes<HTMLLIElement> & {
  marker?: ReactNode;
};

type BrandCanvasProps = HTMLAttributes<HTMLElement> & {
  action?: ReactNode;
  caption?: ReactNode;
  clearSpace?: string;
  guides?: boolean;
  height?: string;
  spec?: ReactNode;
  tone?: SurfaceTone;
};

type TagProps = HTMLAttributes<HTMLSpanElement> & {
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
    target, type: _type, variant: _variant, ...rest } = props;
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
    target: _target, type = "button", variant = "secondary", ...rest } = props;
  const buttonClassName = classNames(
    surfaceClass(frontendClassName("button"), { size, variant }),
    className,
  );
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
  const { as, children, className, href, interactive, softRedirect, tone, ...rest } = props;
  const Tag = as || (href ? "a" : "div");
  const isInteractive = interactive ?? Boolean(href);
  return (
    <Tag
    {...rest}
    className={classNames(surfaceClass(frontendClassName("card"), { tone }), className)}
    href={Tag === "a" ? href : undefined}
    {...frontendDataAttrs({ "card": "" })}
    {...frontendDataAttrs({ "interactive": isInteractive ? "true" : undefined })}
    {...frontendDataAttrs({ "soft-redirect": softRedirect === true ? "" : undefined })}
    >
    <HeadingScope>{children}</HeadingScope>
    </Tag>
  );
}

function Frame(props: FrameProps) {
  const { children, className, ratio, style, ...rest } = props;
  const ratioStyle = ratio ? { [`--${FRONTEND_PREFIX}-surf-frame-root-ratio`]: ratio } : undefined;
  return (
    <div
    {...rest}
    className={classNames(frontendClassName("frame"), className)}
    style={ratioStyle ? { ...ratioStyle, ...style } : style}
    >
    {children}
    </div>
  );
}

function BrandCanvas(props: BrandCanvasProps) {
  const { action, caption, children, className, clearSpace, guides = true, height, spec, style, tone, ...rest } = props;
  const stageStyle: Record<string, string> = {};
  if (clearSpace) stageStyle[`--${FRONTEND_PREFIX}-surf-brand-canvas-clear-space`] = clearSpace;
  if (height) stageStyle[`--${FRONTEND_PREFIX}-surf-brand-canvas-stage-min-h`] = height;
  return (
    <figure
    {...rest}
    className={classNames(surfaceClass(frontendClassName("brand-canvas"), { tone }), className)}
    style={Object.keys(stageStyle).length > 0 ? { ...stageStyle, ...style } : style}
    {...frontendDataAttrs({ "brand-canvas-guides": guides ? "true" : undefined })}
    >
    <div className={frontendElementClass("brand-canvas", "stage")}>
    <div className={frontendElementClass("brand-canvas", "clear")}>
    <div className={frontendElementClass("brand-canvas", "art")}>{children}</div>
    </div>
    {clearSpace && guides ? (
        <>
        <span
        className={frontendElementClass("brand-canvas", "measure")}
        {...frontendDataAttrs({ "brand-canvas-measure": "block" })}
        >
        {clearSpace}
        </span>
        <span
        className={frontendElementClass("brand-canvas", "measure")}
        {...frontendDataAttrs({ "brand-canvas-measure": "inline" })}
        >
        {clearSpace}
        </span>
        </>
      ) : null}
    </div>
    {caption || spec || action ? (
        <figcaption className={frontendElementClass("brand-canvas", "caption")}>
        {caption ? <span>{caption}</span> : null}
        {spec || action ? (
            <span className={frontendElementClass("brand-canvas", "caption-end")}>
            {spec ? <span className={frontendElementClass("brand-canvas", "spec")}>{spec}</span> : null}
            {action}
            </span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

function Tag(props: TagProps) {
  const { children, className, tone, ...rest } = props;
  return (
    <span {...rest} className={classNames(surfaceClass(frontendClassName("tag"), { tone }), className)}>
    {children}
    </span>
  );
}

function CardHeader(props: CardSectionProps) {
  const { children, className, padding, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames(frontendElementClass("card", "header"), className)}
    {...frontendDataAttrs({ "card-padding": padding })}
    >
    {children}
    </div>
  );
}

function CardBody(props: CardSectionProps) {
  const { children, className, padding, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames(frontendElementClass("card", "body"), className)}
    {...frontendDataAttrs({ "card-padding": padding })}
    >
    {children}
    </div>
  );
}

function CardFooter(props: CardSectionProps) {
  const { children, className, padding, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames(frontendElementClass("card", "footer"), className)}
    {...frontendDataAttrs({ "card-padding": padding })}
    >
    {children}
    </div>
  );
}

function PinnedSplit(props: PinnedSplitProps) {
  const { aside, asideSide = "start", asideWidth, children, className, style, top, ...rest } = props;
  const vars: Record<string, string> = {};
  if (asideWidth) vars[`--${FRONTEND_PREFIX}-surf-pinned-aside-width`] = asideWidth;
  if (top) vars[`--${FRONTEND_PREFIX}-surf-pinned-aside-top`] = top;
  return (
    <div
    {...rest}
    className={classNames(frontendClassName("pinned-split"), className)}
    style={Object.keys(vars).length > 0 ? { ...vars, ...style } : style}
    {...frontendDataAttrs({ "pinned-aside": asideSide })}
    >
    <div className={frontendElementClass("pinned-split", "aside")}>{aside}</div>
    <div className={frontendElementClass("pinned-split", "body")}>{children}</div>
    </div>
  );
}

function TrackList(props: TrackListProps) {
  const { as: Tag = "ol", children, className, ...rest } = props;
  return (
    <Tag {...rest} className={classNames(frontendClassName("track"), className)}>
    {children}
    </Tag>
  );
}

function TrackItem(props: TrackItemProps) {
  const { children, className, marker, ...rest } = props;
  return (
    <li {...rest} className={classNames(frontendElementClass("track", "item"), className)}>
    <span aria-hidden="true" className={frontendElementClass("track", "mark")}>
    {marker}
    </span>
    <div className={frontendElementClass("track", "body")}>{children}</div>
    </li>
  );
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
    <div className={classNames(frontendElementClass("canvas-panel", "header"), frontendClassName("card"))}>
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
  BrandCanvas,
  Button,
  CanvasPanel,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FrameAction,
  FrameCaption,
  Frame,
  FrameCover,
  FrameScrim,
  HairlineCell,
  HairlinePanel,
  IconTile,
  PageBand,
  PinnedSplit,
  Tag,
  TrackItem,
  TrackList,
};
export type {
  AccentRuleProps,
  ActionRowProps,
  BrandCanvasProps,
  ButtonProps,
  CanvasPanelProps,
  CardProps,
  CardSectionProps,
  FrameCoverProps,
  FrameLayerProps,
  FrameProps,
  HairlineCellProps,
  HairlinePanelProps,
  IconTileProps,
  PageBandProps,
  PinnedSplitProps,
  TagProps,
  TrackItemProps,
  TrackListProps,
};
