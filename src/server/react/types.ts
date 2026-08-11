import type { ServerResponseLike } from "#hf241ii8z71i";

type FrontendRenderShell = {
  dev?: Record<string, unknown>;
  lang?: string;
  locale?: Record<string, unknown>;
  navigation?: Record<string, unknown>;
  nonce?: string;
  pageProps?: Record<string, unknown>;
  permissionState?: Record<string, unknown>;
  requirePermission?: Record<string, unknown>;
  renderMode?: Record<string, unknown>;
  security?: Record<string, unknown>;
  product?: Record<string, unknown>;
  theme?: string;
  ui?: Record<string, unknown>;
  viewer?: Record<string, unknown>|null;
  seo?: Record<string, unknown>;
};

type FrontendAssetLinkSet = {
  cssLinks?: string;
  fontPreloadLinks?: string;
  jsLinks?: string;
};

type FrontendDocumentContext = {
  componentId: string;
  currentUrl: string;
  cssLinks: string;
  entryIds: string[];
  fontPreloadLinks: string;
  jsLinks: string;
  locale: Record<string, unknown>;
  pageId: string;
  pageTitle: string;
  security: Record<string, unknown>;
  seo: Record<string, unknown>;
  shell: FrontendRenderShell;
  ui: Record<string, unknown>;
};

type FrontendReactRendererOptions = {
  buildAssetLinks: (entryIds: string[]) => FrontendAssetLinkSet;
  buildPermissionState?: (context: {
      res: ServerResponseLike;
      shellInput?: FrontendRenderShell;
  }) => Record<string, unknown>;
  createElement: (component: any, props: Record<string, unknown>) => unknown;
  createIconRenderer?: () => ((spec: string) => unknown) | undefined;
  defaultLang?: string;
  defaultTheme?: string;
  defaultUi?: Record<string, unknown> | (() => Record<string, unknown>);
  dev?: Record<string, unknown>;
  faviconHref?: string | ((context: FrontendDocumentContext) => string);
  log?: {
    info?: (message: string, metadata?: Record<string, unknown>) => unknown;
  };
  normalizePageId?: (pageId: unknown) => string;
  product?: Record<string, unknown>;
  recordRender?: (durationMs: number) => unknown;
  renderToStaticMarkup?: (node: unknown) => string;
  renderToString: (node: unknown) => string;
  resolvePageComponent: (pageId: string) => any;
  resolvePageTitle?: (context: FrontendDocumentContext) => string;
  resolveRootDocument: () => any;
  resolveTitle?: (context: FrontendDocumentContext) => string;
};

type RenderReactPageOptions = {
  componentId?: string;
  shell?: FrontendRenderShell;
  viewName?: string;
};

export type {
  FrontendAssetLinkSet,
  FrontendDocumentContext,
  FrontendReactRendererOptions,
  FrontendRenderShell,
  RenderReactPageOptions,
};
