import type { DynamicSidebarDescriptor, DynamicSidebarResponseItem } from "#9w9ch5jtlv9e";

type DynamicSidebarRuntimeRenderContext = {
  active: boolean;
  counts: unknown;
  disabled: boolean;
  document: Document;
};

type DynamicSidebarRuntimeCountContext =
DynamicSidebarRuntimeRenderContext& {
  count: number;
  path: string;
};

type DynamicSidebarRuntimeLoaderContext =
DynamicSidebarRuntimeRenderContext& {
  idleCount: number | null;
  idleCountPath: string;
  lastStatus: string;
  loaderPath: string;
  repositoryId: string;
  running: number;
  statusPath: string;
};

type DynamicSidebarRuntimeStateContext =
DynamicSidebarRuntimeRenderContext& {
  path: string;
  state: string;
};

type DynamicSidebarRuntimeRenderers = {
  count?: (context: DynamicSidebarRuntimeCountContext) => Node | null;
  loader?: (context: DynamicSidebarRuntimeLoaderContext) => Node | null;
  state?: (context: DynamicSidebarRuntimeStateContext) => Node | null;
};

type DynamicSidebarCleanup = () => void;

type DynamicSidebarSubscribe = (
  room: string,
  listener: (payload: unknown) => void,
) => DynamicSidebarCleanup | void;

type DynamicSidebarLiveOptions = {
  event?: string;
  refreshDelayMs?: number;
  renderers?: DynamicSidebarRuntimeRenderers;
  request?: (
    descriptors: DynamicSidebarDescriptor[],
  ) => Promise<DynamicSidebarResponseItem[]|null|undefined>|
  DynamicSidebarResponseItem[] |
  null |
  undefined;
  subscribe?: DynamicSidebarSubscribe;
};

export type {
  DynamicSidebarCleanup,
  DynamicSidebarLiveOptions,
  DynamicSidebarRuntimeCountContext,
  DynamicSidebarRuntimeLoaderContext,
  DynamicSidebarRuntimeRenderContext,
  DynamicSidebarRuntimeRenderers,
  DynamicSidebarRuntimeStateContext,
  DynamicSidebarSubscribe,
};
