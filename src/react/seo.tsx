import type { ReactNode } from "react";
import { objectRecord, toText } from "#ndsvdqv80epr";

type SeoHeadTagsProps = {
  nonce?: string;
  seo?: Record<string, unknown> | null;
};

function seoArray(value: unknown) {
  if (Array.isArray(value)) return value;
  return value == null ? [] : [value];
}

function metaTag(kind: "name" | "property", name: string, content: unknown, key = name) {
  const value = toText(content);
  if (!value) return null;
  const attrs = kind === "property" ? { property: name } : { name };
  return <meta key={key} {...attrs} content={value} />;
}

function linkTag(rel: string, href: unknown, props: Record<string, unknown> = {}) {
  const value = toText(href);
  const { key, ...attrs } = props;
  return value ? <link key={String(key || rel)} rel={rel} href={value} {...attrs} /> : null;
}

function verificationTags(verification: unknown) {
  const source = objectRecord(verification);
  const out: ReactNode[] = [];
  if (source.google) {
    out.push(metaTag("name", "google-site-verification", source.google, "verify-google"));
  }
  if (source.bing) out.push(metaTag("name", "msvalidate.01", source.bing, "verify-bing"));
  if (source.yandex) {
    out.push(metaTag("name", "yandex-verification", source.yandex, "verify-yandex"));
  }
  const other = objectRecord(source.other);
  for (const [name, content] of Object.entries(other)) {
    out.push(metaTag("name", name, content, `verify-${name}`));
  }
  return out;
}

function alternateLinks(seo: Record<string, unknown>) {
  return seoArray(seo.alternates).map((entry, index) => {
      const item = objectRecord(entry);
      return linkTag("alternate", item.href, {
          hrefLang: toText(item.hreflang) || undefined,
          key: `alternate-${index}`,
          media: toText(item.media) || undefined,
          title: toText(item.title) || undefined,
          type: toText(item.type) || undefined,
      });
  });
}

function safeJsonLd(input: unknown) {
  if (typeof input === "string") return input.replace(/<\/script/giu, "<\\/script");
  return JSON.stringify(input).replace(/</gu, "\\u003c");
}

function structuredDataTags(seo: Record<string, unknown>, nonce?: string) {
  return seoArray(seo.structuredData || seo.jsonLd).map((entry, index) => (
      <script
      key={`jsonld-${index}`}
      type="application/ld+json"
      nonce={nonce || undefined}
      dangerouslySetInnerHTML={{ __html: safeJsonLd(entry) }}
      />
  ));
}

function SeoHeadTags(props: SeoHeadTagsProps) {
  const seo = objectRecord(props.seo);
  return (
    <>
    {metaTag("name", "description", seo.metaDescription)}
    {metaTag("name", "keywords", seo.metaKeywords)}
    {metaTag("name", "robots", seo.robotsContent)}
    {metaTag("name", "googlebot", seo.googlebotContent)}
    {metaTag("name", "bingbot", seo.bingbotContent)}
    {metaTag("name", "application-name", seo.applicationName)}
    {metaTag("name", "referrer", seo.referrer)}
    {metaTag("name", "theme-color", seo.themeColor)}
    {metaTag("name", "color-scheme", seo.colorScheme)}
    {linkTag("canonical", seo.canonicalUrl, { key: "canonical" })}
    {linkTag("manifest", seo.manifestHref, { key: "manifest" })}
    {alternateLinks(seo)}
    {metaTag("property", "og:title", seo.ogTitle)}
    {metaTag("property", "og:description", seo.ogDescription)}
    {metaTag("property", "og:type", seo.ogType)}
    {metaTag("property", "og:url", seo.ogUrl || seo.canonicalUrl)}
    {metaTag("property", "og:image", seo.ogImage)}
    {metaTag("property", "og:locale", seo.ogLocale)}
    {metaTag("property", "og:site_name", seo.ogSiteName || seo.siteName)}
    {metaTag("name", "twitter:card", seo.twitterCard)}
    {metaTag("name", "twitter:site", seo.twitterSite)}
    {metaTag("name", "twitter:creator", seo.twitterCreator)}
    {metaTag("name", "twitter:title", seo.twitterTitle || seo.ogTitle)}
    {metaTag("name", "twitter:description", seo.twitterDescription || seo.ogDescription)}
    {metaTag("name", "twitter:image", seo.twitterImage || seo.ogImage)}
    {verificationTags(seo.verification)}
    {structuredDataTags(seo, props.nonce)}
    </>
  );
}

export { SeoHeadTags };
export type { SeoHeadTagsProps };
