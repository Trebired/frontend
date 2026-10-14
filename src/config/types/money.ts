type FrontendMoneyConfig = {
  base?: string;
  locales?: Record<string, string>;
  rates?: Record<string, number>;
  steps?: Record<string, number>;
};

type NormalizedFrontendMoneyConfig = {
  base: string;
  locales: Record<string, string>;
  rates: Record<string, number>;
  steps: Record<string, number>;
};

export type { FrontendMoneyConfig, NormalizedFrontendMoneyConfig };
