import type {
  HTMLAttributes,
  HtmlHTMLAttributes,
  ReactNode,
} from "react";
import {
  Layout,
  LayoutContent,
  LayoutDocument,
  ProductShellSidebarMinimizedContext,
  type LayoutDocumentProps,
} from "#qsb4858ln9g5";
import { BootScript } from "./boot.js";
import { productShellAside, productShellNavMobile, productShellNavSidebar } from "./shell-nav.js";
import { SeoHeadTags } from "./seo.js";
import { readProductShellLayoutState } from "#etloxyxm9hhu";
import type {
  ProductShellLayoutProps,
  ProductShellLayoutRenderContext,
  ProductShellLayoutState,
  ProductShellSidebarRenderContext,
} from "#cdsjz7wn4cgk";
import { FRONTEND_PREFIX, frontendDataAttr } from "#5vbaqj4pirp3";

type ProductShellDocumentNode =
| ReactNode
| ((context: ProductShellLayoutRenderContext) => ReactNode);

type ProductShellDocumentAttributes<T> =
| T
| ((context: ProductShellLayoutRenderContext) => T);

type ProductShellDocumentBootOptions = {
  layout?: boolean;
  sidebar?: boolean;
  theme?: boolean;
};

type ProductShellDocumentProps =
Omit<
LayoutDocumentProps,
"bodyAttributes" | "children" | "head" | "htmlAttributes" | "scripts" | "theme"
> & {
  bodyAttributes?: ProductShellDocumentAttributes<HTMLAttributes<HTMLBodyElement>>;
  boot?: boolean | ProductShellDocumentBootOptions;
  children?: ProductShellDocumentNode;
  defaultTheme?: string;
  head?: ProductShellDocumentNode;
  headAfterTheme?: ProductShellDocumentNode;
  headBeforeTheme?: ProductShellDocumentNode;
  htmlAttributes?: ProductShellDocumentAttributes<HtmlHTMLAttributes<HTMLHtmlElement>>;
  nonce?: string;
  seo?: Record<string, unknown> | null;
  scripts?: ProductShellDocumentNode;
  shell?: unknown;
  theme?: string;
  themeKey?: string;
};

function productShellSidebarContext(
  state: ProductShellLayoutState,
  side: "left" | "right",
): ProductShellSidebarRenderContext {
  return {
    ...state,
    side,
    sidebar: side === "left" ? state.leftSidebar : state.rightSidebar,
  };
}

function resolveProductShellNav(props: ProductShellLayoutProps, context: ProductShellSidebarRenderContext) {
  return typeof props.nav === "function" ? props.nav(context) : props.nav ?? null;
}

function renderProductShellSidebar(
  state: ProductShellLayoutState,
  props: ProductShellLayoutProps,
  side: "left" | "right",
) {
  const visible = side === "left" ? state.showLeftSidebar : state.showRightSidebar;
  if (!visible) return null;
  const context = productShellSidebarContext(state, side);
  if (side === "left") {
    const nav = resolveProductShellNav(props, context);
    return nav ? productShellNavSidebar(context, nav, props.labels) : null;
  }
  const aside = typeof props.aside === "function" ? props.aside(context) : props.aside ?? null;
  return aside ? productShellAside(context, aside) : null;
}

function renderProductShellMobileNav(state: ProductShellLayoutState, props: ProductShellLayoutProps) {
  if (!state.showHeader) return null;
  const nav = resolveProductShellNav(props, productShellSidebarContext(state, "left"));
  return nav ? productShellNavMobile(state, nav, props.labels) : null;
}

function resolveProductShellValue<T>(
  value: T | ((context: ProductShellLayoutRenderContext) => T) | undefined,
  context: ProductShellLayoutRenderContext,
): T | undefined {
  const raw = value as unknown;
  return typeof raw === "function"
  ? (raw as (context: ProductShellLayoutRenderContext) => T)(context)
  : value as T | undefined;
}

function renderProductShellContent(
  props: ProductShellLayoutProps,
  state: ProductShellLayoutState,
) {
  if (typeof props.children === "function") return props.children(state);
  return props.body ?? props.children;
}

function ProductShellLayout(props: ProductShellLayoutProps) {
  const {
    aside: _aside,
    body: _body,
    children: _children,
    currentPath,
    labels: _labels,
    mainId = `${FRONTEND_PREFIX}_live_content`,
    nav: _nav,
    renderBottomBar,
    renderHeader,
    renderSecondaryHeader,
    shell,
    ...rest
  } = props;
  const state = readProductShellLayoutState(shell, { currentPath });

  return (
    <ProductShellSidebarMinimizedContext.Provider value={state.sidebarMinimized}>
    <Layout
    {...rest}
    header={state.showHeader && renderHeader ? renderHeader(state) : null}
    mobileNav={renderProductShellMobileNav(state, props)}
    leftSidebar={renderProductShellSidebar(state, props, "left")}
    mainId={mainId}
    rightSidebar={renderProductShellSidebar(state, props, "right")}
    secondaryHeader={
      state.showSecondaryHeader && renderSecondaryHeader
      ? renderSecondaryHeader(state)
      : null
    }
    bottomBar={
      state.hasMobileBottomBar && renderBottomBar ? renderBottomBar(state) : null
    }
    >
    <LayoutContent>{renderProductShellContent(props, state)}</LayoutContent>
    </Layout>
    </ProductShellSidebarMinimizedContext.Provider>
  );
}

function resolvedProductShellDocumentBoot(
  boot: ProductShellDocumentProps["boot"],
): Required<ProductShellDocumentBootOptions> {
  if (boot === false) return { layout: false, sidebar: false, theme: false };
  if (boot === undefined || boot === true) {
    return { layout: true, sidebar: true, theme: true };
  }
  return {
    layout: boot.layout !== false,
    sidebar: boot.sidebar !== false,
    theme: boot.theme !== false,
  };
}

function productShellBodyAttributes(
  props: ProductShellDocumentProps,
  state: ProductShellLayoutState,
) {
  const attrs = {
    ...resolveProductShellValue(props.bodyAttributes, state),
    [frontendDataAttr("header-primary")]: state.showHeader ? "true" : "false",
    [frontendDataAttr("header-secondary")]: state.showSecondaryHeader ? "true" : "false",
    [frontendDataAttr("layout-mobile")]: state.hasMobileBottomBar ? "true" : "false",
    [frontendDataAttr("sidebar-left")]: state.showLeftSidebar ? "true" : "false",
    [frontendDataAttr("sidebar-right")]: state.showRightSidebar ? "true" : "false",
    [frontendDataAttr("sidebar-left-minimized")]: state.sidebarMinimized.left ? "true" : "false",
    [frontendDataAttr("sidebar-right-minimized")]: state.sidebarMinimized.right ? "true" : "false",
  };
  return attrs as HTMLAttributes<HTMLBodyElement>;
}

function productShellDocumentHead(
  props: ProductShellDocumentProps,
  state: ProductShellLayoutState,
  boot: Required<ProductShellDocumentBootOptions>,
) {
  return (
    <>
    {resolveProductShellValue(props.headBeforeTheme, state)}
    {props.seo ? <SeoHeadTags nonce={props.nonce} seo={props.seo} /> : null}
    {boot.theme ? (
        <BootScript nonce={props.nonce} theme={state.themeKey} />
      ) : null}
    {resolveProductShellValue(props.head, state)}
    {resolveProductShellValue(props.headAfterTheme, state)}
    </>
  );
}

function productShellDocumentBody(
  props: ProductShellDocumentProps,
  state: ProductShellLayoutState,
  boot: Required<ProductShellDocumentBootOptions>,
) {
  return (
    <>
    {boot.layout || boot.sidebar ? (
        <BootScript
        nonce={props.nonce}
        layout={boot.layout
          ? {
            hasHeader: state.showHeader,
            hasLeftSidebar: state.showLeftSidebar,
            hasMobileBottomBar: state.hasMobileBottomBar,
            hasRightSidebar: state.showRightSidebar,
            hasSecondaryHeader: state.showSecondaryHeader,
          }
          : false}
        sidebar={
          boot.sidebar && state.sidebarSides.length
          ? { sides: state.sidebarSides }
          : false
        }
        theme={false}
        />
      ) : null}
    {resolveProductShellValue(props.children, state)}
    </>
  );
}

function productShellSeoText(props: ProductShellDocumentProps, key: string) {
  const seo = props.seo && typeof props.seo === "object" ? props.seo : {};
  const value = seo[key];
  if (typeof value !== "string") return "";
  return key === "titleSuffix" ? value : value.trim();
}

function productShellDocumentHtmlAttributes(
  props: ProductShellDocumentProps,
  state: ProductShellLayoutState,
) {
  const attrs = {
    ...resolveProductShellValue(props.htmlAttributes, state),
  } as HtmlHTMLAttributes<HTMLHtmlElement>;
  const lang = productShellSeoText(props, "htmlLang");
  return lang && !attrs.lang ? { ...attrs, lang } : attrs;
}

function productShellDocumentTitle(props: ProductShellDocumentProps) {
  if (typeof props.title === "string" && props.title.trim()) return props.title;
  const title = productShellSeoText(props, "title");
  const suffix = productShellSeoText(props, "titleSuffix");
  return title ? `${title}${suffix.trim() ? suffix : ""}` : undefined;
}

function ProductShellDocument(props: ProductShellDocumentProps) {
  const {
    bodyAttributes: _bodyAttributes,
    boot,
    children: _children,
    defaultTheme,
    head: _head,
    headAfterTheme: _headAfterTheme,
    headBeforeTheme: _headBeforeTheme,
    htmlAttributes: _htmlAttributes,
    nonce: _nonce,
    seo: _seo,
    scripts,
    shell,
    theme,
    themeKey,
    title: _title,
    ...rest
  } = props;
  const state = readProductShellLayoutState(shell, {
      defaultTheme,
      theme,
      themeKey,
  });
  const resolvedBoot = resolvedProductShellDocumentBoot(boot);
  return (
    <LayoutDocument
    {...rest}
    bodyAttributes={productShellBodyAttributes(props, state)}
    htmlAttributes={productShellDocumentHtmlAttributes(props, state)}
    head={productShellDocumentHead(props, state, resolvedBoot)}
    scripts={resolveProductShellValue(scripts, state)}
    theme={state.themeKey}
    title={productShellDocumentTitle(props)}
    >
    {productShellDocumentBody(props, state, resolvedBoot)}
    </LayoutDocument>
  );
}

export { ProductShellDocument, ProductShellLayout };
export type {
  ProductShellDocumentAttributes,
  ProductShellDocumentBootOptions,
  ProductShellDocumentNode,
  ProductShellDocumentProps,
};
