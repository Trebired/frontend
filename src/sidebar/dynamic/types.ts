import type { HTMLAttributes, ReactNode } from "react";

type DynamicSidebarVisibility = "active" | "always";

type DynamicSidebarLiveConfig = {
  params?: Record<string, unknown>;
  path?: string;
  rooms?: string[];
  side?: string;
  type?: string;
};

type DynamicSidebarContext = {
  entity_counts?: unknown;
  live?: DynamicSidebarLiveConfig | null;
  type?: string;
  [key: string]: unknown;
};

type DynamicSidebarDividerItem = {
  key?: string;
  kind: "divider";
  show?: boolean;
};

type DynamicSidebarLinkItem = {
  countPath?: string;
  countVisibility?: DynamicSidebarVisibility;
  disabled?: boolean;
  disabledPath?: string;
  exact?: boolean;
  hideWhenDisabled?: boolean;
  href?: string;
  icon?: ReactNode;
  iconKey?: string;
  iconSpec?: string;
  key?: string;
  kind: "link";
  label?: ReactNode;
  loaderPath?: string;
  loaderVisibility?: DynamicSidebarVisibility;
  navIgnore?: boolean;
  show?: boolean;
  statePath?: string;
  statusIdleCountPath?: string;
  statusPath?: string;
  statusRepositoryId?: string;
};

type DynamicSidebarItem = DynamicSidebarDividerItem | DynamicSidebarLinkItem;

type DynamicSidebarItemContext = {
  active: boolean;
  disabled: boolean;
  item: DynamicSidebarLinkItem;
  sidebar: DynamicSidebarContext;
};

type DynamicSidebarCountContext = DynamicSidebarItemContext & {
  count: number | null;
  path: string;
};

type DynamicSidebarLoaderContext = DynamicSidebarItemContext & {
  idleCount: number | null;
  idleCountPath: string;
  lastStatus: string;
  loaderPath: string;
  repositoryId: string;
  running: number;
  statusPath: string;
};

type DynamicSidebarStateContext = DynamicSidebarItemContext & {
  path: string;
  state: string;
};

type DynamicSidebarLinkListProps =
Omit<HTMLAttributes<HTMLUListElement>, "children"> & {
  actionTrigger?: boolean;
  currentPath?: string;
  items: DynamicSidebarItem[];
  linksId?: string;
  renderCount?: (context: DynamicSidebarCountContext) => ReactNode;
  renderIcon?: (context: DynamicSidebarItemContext) => ReactNode;
  renderLoader?: (context: DynamicSidebarLoaderContext) => ReactNode;
  renderState?: (context: DynamicSidebarStateContext) => ReactNode;
  sidebar?: DynamicSidebarContext | null;
  wrapLink?: (
    node: ReactNode,
    context: DynamicSidebarItemContext & { href: string },
  ) => ReactNode;
};

type DynamicSidebarLiveRootProps = HTMLAttributes<HTMLDivElement> & {
  config: DynamicSidebarLiveConfig;
};

type DynamicSidebarDescriptor = {
  key: string;
  params: Record<string, unknown>;
  path: string;
  rooms: string[];
  side: string;
  type: string;
};

type DynamicSidebarResponseItem = {
  entity_counts?: unknown;
  key?: string;
  resolved?: boolean;
};

export type {
  DynamicSidebarContext,
  DynamicSidebarCountContext,
  DynamicSidebarDescriptor,
  DynamicSidebarDividerItem,
  DynamicSidebarItem,
  DynamicSidebarItemContext,
  DynamicSidebarLinkItem,
  DynamicSidebarLinkListProps,
  DynamicSidebarLiveConfig,
  DynamicSidebarLiveRootProps,
  DynamicSidebarLoaderContext,
  DynamicSidebarResponseItem,
  DynamicSidebarStateContext,
  DynamicSidebarVisibility,
};
