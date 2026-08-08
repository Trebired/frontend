import type {
  HTMLAttributes,
  HtmlHTMLAttributes,
  ReactNode,
  ScriptHTMLAttributes,
} from "react";
import { classNames } from "#ndsvdqv80epr";
import { LayerRoot } from "#4okrafkbueid";
import { TooltipLayer } from "#8sfk4kby98q6";
import { createLayoutBootScript, LAYOUT_PORTAL_ROOT_ID, type LayoutBodyState } from "#ieim4iimrwal";

type LayoutDocumentProps = {
  bodyAttributes?: HTMLAttributes<HTMLBodyElement>;
  children?: ReactNode;
  csrfToken?: string;
  faviconHref?: string;
  head?: ReactNode;
  htmlAttributes?: HtmlHTMLAttributes<HTMLHtmlElement>;
  lang?: string;
  scripts?: ReactNode;
  theme?: string;
  title?: string;
  viewerId?: string;
};

type LayoutProps = HTMLAttributes<HTMLDivElement> & {
  bottomBar?: ReactNode;
  header?: ReactNode;
  leftSidebar?: ReactNode;
  mainId?: string;
  mobileNav?: ReactNode;
  portalRoot?: ReactNode;
  rightSidebar?: ReactNode;
  secondaryHeader?: ReactNode;
};

type LayoutMainProps = HTMLAttributes<HTMLElement> & {
  live?: boolean;
};

type LayoutContentProps = HTMLAttributes<HTMLDivElement>;

type LayoutBootScriptProps = ScriptHTMLAttributes<HTMLScriptElement> & Partial<LayoutBodyState>;

function LayoutDocument(props: LayoutDocumentProps) {
  const {
    bodyAttributes,
    children,
    csrfToken,
    faviconHref,
    head,
    htmlAttributes,
    lang = "en",
    scripts,
    theme,
    title,
    viewerId,
  } = props;
  return (
    <html
      {...htmlAttributes}
      lang={htmlAttributes?.lang || lang}
      data-tbf-theme={theme || htmlAttributes?.["data-tbf-theme"]}
      data-tbf-layout-document=""
    >
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {csrfToken ? <meta name="csrf-token" content={csrfToken} /> : null}
        {viewerId ? <meta name="viewer-id" content={viewerId} /> : null}
        {title ? <title>{title}</title> : null}
        {faviconHref ? <link id="app_favicon" rel="icon" type="image/svg+xml" href={faviconHref} /> : null}
        {head}
      </head>
      <body
        {...bodyAttributes}
        data-tbf-layout=""
        data-tbf-theme={theme || bodyAttributes?.["data-tbf-theme"]}
      >
        {children}
        {scripts}
      </body>
    </html>
  );
}

function Layout(props: LayoutProps) {
  const {
    bottomBar,
    children,
    className,
    header,
    leftSidebar,
    mainId = "tbf_live_content",
    mobileNav,
    portalRoot,
    rightSidebar,
    secondaryHeader,
    ...rest
  } = props;
  return (
    <>
      {header}
      {mobileNav}
      {portalRoot === undefined ? <LayoutPortalRoot /> : portalRoot}
      <div
        {...rest}
        className={classNames("tbf-layout", className)}
        data-tbf-layout-root=""
      >
        {leftSidebar}
        <LayoutMain id={mainId}>
          {secondaryHeader}
          {children}
        </LayoutMain>
        {rightSidebar}
      </div>
      {bottomBar}
    </>
  );
}

function LayoutMain(props: LayoutMainProps) {
  const { children, className, live = true, ...rest } = props;
  return (
    <main
      {...rest}
      className={classNames("tbf-layout-main", className)}
      data-tbf-layout-main=""
      data-tbf-live-content={live ? "" : undefined}
    >
      {children}
    </main>
  );
}

function LayoutContent(props: LayoutContentProps) {
  const { children, className, ...rest } = props;
  return (
    <div
      {...rest}
      className={classNames("tbf-layout-content", className)}
      data-tbf-layout-content=""
    >
      {children}
    </div>
  );
}

function LayoutCenter(props: LayoutContentProps) {
  const { children, className, ...rest } = props;
  return (
    <div
      {...rest}
      className={classNames("tbf-layout-center", className)}
      data-tbf-layout-center=""
    >
      {children}
    </div>
  );
}

function LayoutPortalRoot(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, id = LAYOUT_PORTAL_ROOT_ID, ...rest } = props;
  return (
    <div
      {...rest}
      className={classNames("tbf-layout-portal-root", className)}
      data-tbf-layout-portal-root=""
      id={id}
    >
      {children === undefined ? (
        <>
          <LayerRoot />
          <TooltipLayer />
        </>
      ) : children}
    </div>
  );
}

function LayoutHeader(props: HTMLAttributes<HTMLElement>) {
  const { children, className, ...rest } = props;
  return (
    <header
      {...rest}
      className={classNames("tbf-layout-header", className)}
      data-tbf-layout-header=""
    >
      {children}
    </header>
  );
}

function LayoutSecondaryHeader(props: HTMLAttributes<HTMLElement>) {
  const { children, className, ...rest } = props;
  return (
    <header
      {...rest}
      className={classNames("tbf-layout-secondary-header", className)}
      data-tbf-layout-secondary-header=""
    >
      {children}
    </header>
  );
}

function LayoutBottomBar(props: HTMLAttributes<HTMLElement>) {
  const { children, className, ...rest } = props;
  return (
    <nav
      {...rest}
      className={classNames("tbf-layout-bottom-bar", className)}
      data-tbf-layout-bottom-bar=""
    >
      {children}
    </nav>
  );
}

function LayoutBootScript(props: LayoutBootScriptProps) {
  const {
    hasLeftSidebar,
    hasMobileBottomBar,
    hasRightSidebar,
    ...rest
  } = props;
  return (
    <script
      {...rest}
      data-tbf-layout-boot=""
      dangerouslySetInnerHTML={{
        __html: createLayoutBootScript({
          hasLeftSidebar,
          hasMobileBottomBar,
          hasRightSidebar,
        }),
      }}
    />
  );
}

export {
  Layout,
  LayoutBootScript,
  LayoutBottomBar,
  LayoutCenter,
  LayoutContent,
  LayoutDocument,
  LayoutHeader,
  LayoutMain,
  LayoutPortalRoot,
  LayoutSecondaryHeader,
};
export * from "./breadcrumb.js";
export * from "./header.js";
export * from "./mobile.js";
export type {
  LayoutBootScriptProps,
  LayoutContentProps,
  LayoutDocumentProps,
  LayoutMainProps,
  LayoutProps,
};
