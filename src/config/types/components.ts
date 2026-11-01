type FrontendComponentTokens = Record<string, unknown>;

type FrontendPrimitiveComponentsConfig = {
  actionControl?: FrontendComponentTokens;
  button?: FrontendComponentTokens;
  choice?: FrontendComponentTokens;
  disclosure?: FrontendComponentTokens;
  dot?: FrontendComponentTokens;
  dropdown?: FrontendComponentTokens;
  input?: FrontendComponentTokens;
  loader?: FrontendComponentTokens;
  marquee?: FrontendComponentTokens;
  pill?: FrontendComponentTokens;
  progress?: FrontendComponentTokens;
  quote?: FrontendComponentTokens;
  steps?: FrontendComponentTokens;
  tabs?: FrontendComponentTokens;
  textLink?: FrontendComponentTokens;
  toggle?: FrontendComponentTokens;
  wizard?: FrontendComponentTokens;
  upload?: FrontendComponentTokens;
};

type FrontendSurfaceComponentsConfig = {
  brandCanvas?: FrontendComponentTokens;
  button?: FrontendComponentTokens;
  card?: FrontendComponentTokens;
  hairline?: FrontendComponentTokens;
  motif?: FrontendComponentTokens;
  logo?: FrontendComponentTokens;
  scrollbar?: FrontendComponentTokens;
  visibility?: FrontendComponentTokens;
};

type FrontendOverlayComponentsConfig = {
  modal?: FrontendComponentTokens;
  popover?: FrontendComponentTokens;
  tooltip?: FrontendComponentTokens;
};

type FrontendFeedbackComponentsConfig = {
  flash?: FrontendComponentTokens;
};

type FrontendMediaComponentsConfig = {
  carousel?: FrontendComponentTokens;
  embedFrame?: FrontendComponentTokens;
  expandableImage?: FrontendComponentTokens;
  lightbox?: FrontendComponentTokens;
};

type FrontendShellComponentsConfig = {
  bottomBar?: FrontendComponentTokens;
  category?: FrontendComponentTokens;
  error?: FrontendComponentTokens;
  header?: FrontendComponentTokens;
  language?: FrontendComponentTokens;
  sidebar?: FrontendComponentTokens;
  theme?: FrontendComponentTokens;
};

type FrontendDataComponentsConfig = {
  graph?: FrontendComponentTokens;
  log?: FrontendComponentTokens;
};

type FrontendComponentsConfig = {
  data?: FrontendDataComponentsConfig;
  feedback?: FrontendFeedbackComponentsConfig;
  media?: FrontendMediaComponentsConfig;
  overlays?: FrontendOverlayComponentsConfig;
  primitives?: FrontendPrimitiveComponentsConfig;
  shell?: FrontendShellComponentsConfig;
  surfaces?: FrontendSurfaceComponentsConfig;
  typography?: FrontendComponentTokens;
};

export type {
  FrontendComponentTokens,
  FrontendComponentsConfig,
  FrontendDataComponentsConfig,
  FrontendFeedbackComponentsConfig,
  FrontendMediaComponentsConfig,
  FrontendOverlayComponentsConfig,
  FrontendPrimitiveComponentsConfig,
  FrontendShellComponentsConfig,
  FrontendSurfaceComponentsConfig,
};
