import type { ReactNode } from "react";
import { Icon } from "#lbkpzw8nphru";
import {
  ProductShellMobileNav,
  ProductShellSidebar,
  ProductShellSidebarDefaultControls,
} from "#qsb4858ln9g5";
import { DynamicSidebarLinkList } from "./../sidebar/dynamic/components/list.js";
import type {
  ProductShellAside,
  ProductShellLabels,
  ProductShellLayoutRenderContext,
  ProductShellNav,
  ProductShellSidebarRenderContext,
} from "#cdsjz7wn4cgk";

function ProductShellNavLinks(props: { context: ProductShellSidebarRenderContext; linksId: string; nav: ProductShellNav }) {
  return (
    <DynamicSidebarLinkList
    currentPath={props.context.currentPath}
    items={[...props.nav.items]}
    linksId={props.linksId}
    sidebar={props.context.sidebar}
    statuses={props.nav.statuses}
    />
  );
}

function productShellNavSidebar(
  context: ProductShellSidebarRenderContext,
  nav: ProductShellNav,
  labels?: ProductShellLabels,
): ReactNode {
  const product = context.shell.product as { name?: unknown } | undefined;
  return (
    <ProductShellSidebar
    ariaLabel={nav.label}
    content={<ProductShellNavLinks context={context} linksId="sidebar_links" nav={nav} />}
    footerActions={(
        <ProductShellSidebarDefaultControls
        labels={labels}
        lang={String(context.shell.lang ?? "en")}
        productName={String(product?.name ?? "")}
        side={context.side}
        theme={context.theme}
        />
    )}
    side={context.side}
    />
  );
}

function productShellNavMobile(
  context: ProductShellLayoutRenderContext,
  nav: ProductShellNav,
  labels?: ProductShellLabels,
): ReactNode {
  const sidebarContext = { ...context, side: "left", sidebar: context.leftSidebar };
  return (
    <ProductShellMobileNav
    accountContent={nav.mobile?.account}
    closeIcon={<Icon spec="remixicon close-line" />}
    headerContent={nav.mobile?.header}
    labels={labels}
    shell={context.shell}
    sidebarContent={<ProductShellNavLinks context={sidebarContext} linksId="mobile_nav_links" nav={nav} />}
    />
  );
}

function productShellAside(context: ProductShellSidebarRenderContext, aside: ProductShellAside): ReactNode {
  return (
    <ProductShellSidebar
    ariaLabel={aside.label}
    content={aside.content}
    persist={false}
    showFooter={false}
    side={context.side}
    />
  );
}

export { productShellAside, productShellNavMobile, productShellNavSidebar };
