type FrontendLink = {
  external?: boolean;
  href: string;
  site?: string;
};

type FrontendLinkGroup = {
  group: string;
  links?: string[];
  search?: boolean;
  sitemap?: boolean;
};

type FrontendLinkFooter = {
  columns?: string[][];
  note?: string[];
  site?: string[];
};

type FrontendLinkSet = {
  footer?: FrontendLinkFooter;
  header?: (FrontendLinkGroup | string)[];
  site?: string;
  sitemap?: string[];
};

type FrontendLinkMessages = {
  categories?: Record<string, string>;
  descriptions?: Record<string, string>;
  groups?: Record<string, string>;
  links: Record<string, string>;
};

type FrontendLinksConfig = {
  categories?: Record<string, string[]>;
  icon?: string;
  links: Record<string, FrontendLink>;
  messages: Record<string, FrontendLinkMessages>;
  sets: Record<string, FrontendLinkSet>;
};

type NormalizedFrontendLink = {
  external: boolean;
  href: string;
  site: string;
};

type NormalizedFrontendLinkGroup = {
  group: string;
  links: string[];
  search: boolean;
  sitemap: boolean;
};

type NormalizedFrontendLinkSet = {
  footer: { columns: string[][]; note: string[]; site: string[] };
  header: (NormalizedFrontendLinkGroup | string)[];
  site: string;
  sitemap: string[];
};

type NormalizedFrontendLinkMessages = {
  categories: Record<string, string>;
  descriptions: Record<string, string>;
  groups: Record<string, string>;
  links: Record<string, string>;
};

type NormalizedFrontendLinksConfig = {
  categories: Record<string, string[]>;
  icon: string;
  links: Record<string, NormalizedFrontendLink>;
  messages: Record<string, NormalizedFrontendLinkMessages>;
  sets: Record<string, NormalizedFrontendLinkSet>;
};

export type {
  FrontendLink,
  FrontendLinkFooter,
  FrontendLinkGroup,
  FrontendLinkMessages,
  FrontendLinksConfig,
  FrontendLinkSet,
  NormalizedFrontendLink,
  NormalizedFrontendLinkGroup,
  NormalizedFrontendLinkMessages,
  NormalizedFrontendLinksConfig,
  NormalizedFrontendLinkSet,
};
