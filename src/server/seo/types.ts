import type { SeoRouteOptions } from "./routes.js";

type SeoRobotsConfig = {
  archive?: boolean;
  follow?: boolean;
  imageIndex?: boolean;
  imagePreview?: "none" | "standard" | "large";
  index?: boolean;
  maxImagePreview?: "none" | "standard" | "large";
  maxSnippet?: number;
  maxVideoPreview?: number;
  nocache?: boolean;
  snippet?: boolean;
  translate?: boolean;
  unavailableAfter?: string;
};

type SeoAlternateLink = {
  href: string;
  hreflang?: string;
  media?: string;
  title?: string;
  type?: string;
};

type SeoImage =
string |
{
  alt?: string;
  height?: number;
  type?: string;
  url?: string;
  width?: number;
};

type SeoSocialConfig = {
  card?: string;
  creator?: string;
  description?: string;
  image?: SeoImage | readonly SeoImage[];
  imageAlt?: string;
  locale?: string;
  site?: string;
  siteName?: string;
  title?: string;
  type?: string;
  url?: string;
};

type SeoVerificationConfig = {
  bing?: string;
  google?: string;
  other?: Record<string, string>;
  yandex?: string;
};

type SeoStructuredData = Record<string, unknown>|readonly unknown[] | string;

type SeoConfig = {
  alternates?: readonly SeoAlternateLink[];
  applicationName?: string;
  bingbot?: SeoRobotsConfig | readonly string[] | string;
  bingbotContent?: string;
  canonicalUrl?: string;
  colorScheme?: string;
  contentLanguage?: string;
  googlebot?: SeoRobotsConfig | readonly string[] | string;
  googlebotContent?: string;
  htmlLang?: string;
  index?: boolean;
  jsonLd?: SeoStructuredData | readonly SeoStructuredData[];
  manifestHref?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogDescription?: string;
  ogImage?: string;
  ogLocale?: string;
  ogSiteName?: string;
  ogTitle?: string;
  ogType?: string;
  ogUrl?: string;
  openGraph?: SeoSocialConfig;
  referrer?: string;
  robots?: SeoRobotsConfig | readonly string[] | string;
  robotsContent?: string;
  siteName?: string;
  structuredData?: SeoStructuredData | readonly SeoStructuredData[];
  themeColor?: string;
  title?: string;
  titleSuffix?: string;
  twitter?: SeoSocialConfig;
  twitterCard?: string;
  twitterCreator?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;
  twitterTitle?: string;
  verification?: SeoVerificationConfig;
};

type SeoMiddlewareOptions = {
  defaults?: SeoConfig;
  getSeo?: () => SeoConfig;
  routes?: false | SeoRouteOptions;
};

type SeoStoreOptions = {
  defaults?: SeoConfig;
  logger?: {
    info?: (
      scope: string,
      message: string,
      metadata?: Record<string, unknown>,
    ) => unknown;
  };
};

export type {
  SeoAlternateLink,
  SeoConfig,
  SeoImage,
  SeoMiddlewareOptions,
  SeoRobotsConfig,
  SeoSocialConfig,
  SeoStoreOptions,
  SeoStructuredData,
  SeoVerificationConfig,
};
