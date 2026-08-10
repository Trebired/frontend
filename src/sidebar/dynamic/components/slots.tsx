import type { ReactNode } from "react";
import { jsonScript } from "#ndsvdqv80epr";
import {
  defaultDynamicSidebarCount,
  defaultDynamicSidebarIcon,
  defaultDynamicSidebarLoader,
  defaultDynamicSidebarState,
} from "./defaults.js";
import type {
  DynamicSidebarCountContext,
  DynamicSidebarContext,
  DynamicSidebarItemContext,
  DynamicSidebarLinkItem,
  DynamicSidebarLiveRootProps,
  DynamicSidebarLoaderContext,
  DynamicSidebarStateContext,
} from "#9w9ch5jtlv9e";
import {
  dynamicSidebarCount,
  dynamicSidebarTextValue,
  textValue,
} from "#yv4ubgils4dc";
import { primitiveTextClassName } from "#hzrmwbvgt2ax";

function DynamicSidebarLiveRoot(props: DynamicSidebarLiveRootProps) {
  const { children, config, style, ...rest } = props;
  return (
    <div
    {...rest}
    data-tbf-sidebar-dynamic-live=""
    style={{ display: "contents", ...style }}
    >
    <script
    data-tbf-sidebar-dynamic-live-config=""
    hidden
    type="application/json"
    dangerouslySetInnerHTML={{ __html: jsonScript(config) }}
    />
    {children}
    </div>
  );
}

function DynamicSidebarCountSlot(props: {
    active: boolean;
    context: DynamicSidebarItemContext;
    path: string;
    render?: (context: DynamicSidebarCountContext) => ReactNode;
    sidebar: DynamicSidebarContext;
    visibility: string;
}) {
  const disabled = props.context.disabled;
  const count = disabled || (props.visibility === "active" && !props.active)
  ? null
  : dynamicSidebarCount(props.sidebar, props.path);
  const render = props.render || defaultDynamicSidebarCount;
  return (
    <span
    data-tbf-sidebar-active={props.active ? "1" : "0"}
    data-tbf-sidebar-count-path={props.path}
    data-tbf-sidebar-count-slot=""
    data-tbf-sidebar-count-visibility={props.visibility}
    data-tbf-sidebar-disabled={disabled ? "1" : "0"}
    >
    {count == null ? null : render({ ...props.context, count, path: props.path })}
    </span>
  );
}

function loaderContext(props: {
    context: DynamicSidebarItemContext;
    item: DynamicSidebarLinkItem;
    sidebar: DynamicSidebarContext;
}): DynamicSidebarLoaderContext {
  const idleCountPath = textValue(props.item.statusIdleCountPath);
  const loaderPath = textValue(props.item.loaderPath);
  const statusPath = textValue(props.item.statusPath);
  return {
    ...props.context,
    idleCount: idleCountPath ? dynamicSidebarCount(props.sidebar, idleCountPath) : null,
    idleCountPath,
    lastStatus: dynamicSidebarTextValue(props.sidebar, statusPath),
    loaderPath,
    repositoryId: textValue(props.item.statusRepositoryId),
    running: dynamicSidebarCount(props.sidebar, loaderPath),
    statusPath,
  };
}

function DynamicSidebarLoaderSlot(props: {
    active: boolean;
    context: DynamicSidebarItemContext;
    item: DynamicSidebarLinkItem;
    render?: (context: DynamicSidebarLoaderContext) => ReactNode;
    sidebar: DynamicSidebarContext;
}) {
  const context = loaderContext(props);
  if (!context.loaderPath && !context.statusPath && !context.repositoryId) return null;
  const visibility = props.item.loaderVisibility === "active" ? "active" : "always";
  const render = props.render || defaultDynamicSidebarLoader;
  const hidden = props.context.disabled || (visibility === "active" && !props.active);
  return (
    <span
    data-tbf-sidebar-active={props.active ? "1" : "0"}
    data-tbf-sidebar-disabled={props.context.disabled ? "1" : "0"}
    data-tbf-sidebar-loader-path={context.loaderPath}
    data-tbf-sidebar-loader-slot=""
    data-tbf-sidebar-loader-visibility={visibility}
    data-tbf-sidebar-status-idle-count-path={context.idleCountPath}
    data-tbf-sidebar-status-path={context.statusPath}
    data-tbf-sidebar-status-repository-id={context.repositoryId}
    >
    {hidden ? null : render(context)}
    </span>
  );
}

function DynamicSidebarStateSlot(props: {
    active: boolean;
    context: DynamicSidebarItemContext;
    path: string;
    render?: (context: DynamicSidebarStateContext) => ReactNode;
    sidebar: DynamicSidebarContext;
}) {
  const state = props.context.disabled
  ? ""
  : dynamicSidebarTextValue(props.sidebar, props.path);
  const render = props.render || defaultDynamicSidebarState;
  return (
    <span
    data-tbf-sidebar-active={props.active ? "1" : "0"}
    data-tbf-sidebar-disabled={props.context.disabled ? "1" : "0"}
    data-tbf-sidebar-state-path={props.path}
    data-tbf-sidebar-state-slot=""
    >
    {render({ ...props.context, path: props.path, state })}
    </span>
  );
}

function DynamicSidebarIcon(props: {
    context: DynamicSidebarItemContext;
    render?: (context: DynamicSidebarItemContext) => ReactNode;
}) {
  const node = props.render
  ? props.render(props.context)
  : props.context.item.icon || defaultDynamicSidebarIcon(props.context);
  return node ? (
    <span className={primitiveTextClassName({ muted: true })} data-tbf-sidebar-link-icon="">
    {node}
    </span>
  ) : null;
}

export {
  DynamicSidebarCountSlot,
  DynamicSidebarIcon,
  DynamicSidebarLiveRoot,
  DynamicSidebarLoaderSlot,
  DynamicSidebarStateSlot,
};
