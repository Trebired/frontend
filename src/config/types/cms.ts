type FrontendCmsConfig = {
  contentDir?: string;
  editorOrigins?: readonly string[];
  enabled?: boolean;
  mediaBase?: string;
};

type NormalizedFrontendCmsConfig = {
  contentDir: string;
  editorOrigins: string[];
  enabled: boolean;
  mediaBase: string;
};

export type { FrontendCmsConfig, NormalizedFrontendCmsConfig };
