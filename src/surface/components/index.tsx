import { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";
import { FullscreenTarget } from "#vbkfq413o3u7";
import { FullscreenToggle } from "#85ylxmukhmrq";
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

type BrandCanvasProps = HTMLAttributes<HTMLElement> & {
  action?: ReactNode;
  caption?: ReactNode;
  clearSpace?: string;
  guides?: boolean;
  height?: string;
  spec?: ReactNode;
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

type CanvasPanelProps = HTMLAttributes<HTMLDivElement> & {
  actions?: ReactNode;
  fullscreenGroup?: string;
  fullscreenId?: string;
  lang?: string;
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
    className={classNames(className) || undefined}
    href={Tag === "a" ? href : undefined}
    {...frontendDataAttrs({ "card": "", container: "card", variant: tone || undefined })}
    {...frontendDataAttrs({ "interactive": isInteractive ? "true" : undefined })}
    {...frontendDataAttrs({ "soft-redirect": softRedirect === true ? "" : undefined })}
    >
    <HeadingScope>{children}</HeadingScope>
    </Tag>
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
    <div
    className={frontendElementClass("brand-canvas", "stage")}
    {...frontendDataAttrs({ dark: tone === "inverse" ? "" : undefined })}
    >
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
    {...frontendDataAttrs({ "tone": invert ? "dark" : "light" })}
    >
    {children}
    </Tag>
  );
}

function CanvasPanel(props: CanvasPanelProps) {
  const { actions, children, className, fullscreenGroup, fullscreenId, lang, subtitle, title, ...rest } = props;
  const body = (
    <div {...rest} className={classNames(frontendClassName("canvas-panel"), className)} {...frontendDataAttrs({ "canvas-panel": "" })}>
    <CanvasPanelHeader
    actions={actions}
    fullscreenGroup={fullscreenGroup}
    fullscreenId={fullscreenId}
    lang={lang}
    subtitle={subtitle}
    title={title}
    />
    <div className={frontendElementClass("canvas-panel", "body")}>{children}</div>
    </div>
  );
  return fullscreenId
  ? <FullscreenTarget fullscreenId={fullscreenId} group={fullscreenGroup}>{body}</FullscreenTarget>
  : body;
}

type CanvasPanelHeaderProps = Pick<
CanvasPanelProps,
"actions" | "fullscreenGroup" | "fullscreenId" | "lang" | "subtitle" | "title"
>;

function CanvasPanelHeader(props: CanvasPanelHeaderProps) {
  if (!props.title && !props.subtitle && !props.actions && !props.fullscreenId) return null;
  const hasTitles = Boolean(props.title || props.subtitle);
  const actions = props.actions
  ? <div className={frontendElementClass("canvas-panel", "actions")}>{props.actions}</div>
  : null;
  return (
    <div className={classNames(frontendElementClass("canvas-panel", "header"))} {...frontendDataAttrs({ container: "card" })}>
    <div className={frontendElementClass("canvas-panel", "top")}>
    {hasTitles ? (
        <div className={frontendElementClass("canvas-panel", "titles")}>
        {props.title ? <span className={frontendElementClass("canvas-panel", "title")}>{props.title}</span> : null}
        {props.subtitle ? <span className={frontendElementClass("canvas-panel", "subtitle")}>{props.subtitle}</span> : null}
        </div>
      ) : actions}
    {props.fullscreenId ? (
        <FullscreenToggle fullscreenId={props.fullscreenId} group={props.fullscreenGroup} lang={props.lang} />
      ) : null}
    </div>
    {hasTitles ? actions : null}
    </div>
  );
}

export {
  BrandCanvas,
  Button,
  CanvasPanel,
  Card,
  HairlineCell,
  HairlinePanel,
};
export type {
  BrandCanvasProps,
  ButtonProps,
  CanvasPanelProps,
  CardProps,
  HairlineCellProps,
  HairlinePanelProps,
};
