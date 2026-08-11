import type { LinkHTMLAttributes, ScriptHTMLAttributes } from "react";

type ParsedHtmlTag = {
  attrs: Record<string, boolean | string>;
};

function attrValue(source: string, key: string) {
  const pattern = new RegExp(`\\b${key}\\s*=\\s*(["'])(.*?)\\1`, "iu");
  const match = pattern.exec(String(source || ""));
  return match && match[2] ? String(match[2]) : "";
}

function hasFlag(source: string, key: string) {
  return new RegExp(`\\b${key}(?:\\s|>|$)`, "iu").test(String(source || ""));
}

function parsedLinkTags(html: string): ParsedHtmlTag[] {
  const out: ParsedHtmlTag[] = [];
  const pattern = /<link\b([^>]*?)>/giu;
  let match: RegExpExecArray | null = null;
  while ((match = pattern.exec(String(html || "")))) {
    const attrs = String(match[1] || "");
    const href = attrValue(attrs, "href");
    if (!href) continue;
    out.push({
        attrs: {
          as: attrValue(attrs, "as"),
          crossorigin: hasFlag(attrs, "crossorigin"),
          href,
          rel: attrValue(attrs, "rel"),
          type: attrValue(attrs, "type"),
        },
    });
  }
  return out;
}

function parsedScriptTags(html: string): ParsedHtmlTag[] {
  const out: ParsedHtmlTag[] = [];
  const pattern = /<script\b([^>]*?)><\/script>/giu;
  let match: RegExpExecArray | null = null;
  while ((match = pattern.exec(String(html || "")))) {
    const attrs = String(match[1] || "");
    const src = attrValue(attrs, "src");
    if (!src) continue;
    out.push({
        attrs: {
          async: hasFlag(attrs, "async"),
          defer: hasFlag(attrs, "defer"),
          src,
          type: attrValue(attrs, "type"),
        },
    });
  }
  return out;
}

function renderCssAssetLinks(
  html: string,
  props: LinkHTMLAttributes<HTMLLinkElement> = {},
) {
  return parsedLinkTags(html).map((tag, index) => {
      const attrs = tag.attrs;
      return (
        <link
        {...props}
        href={String(attrs.href || "")}
        key={`css_asset_link_${index}`}
        rel={String(attrs.rel || "stylesheet")}
        type={attrs.type ? String(attrs.type) : undefined}
        />
      );
  });
}

function renderFontPreloadAssetLinks(
  html: string,
  props: LinkHTMLAttributes<HTMLLinkElement> = {},
) {
  return parsedLinkTags(html).map((tag, index) => {
      const attrs = tag.attrs;
      return (
        <link
        {...props}
        as={String(attrs.as || "font")}
        crossOrigin={attrs.crossorigin === true ? "" : props.crossOrigin}
        href={String(attrs.href || "")}
        key={`font_preload_asset_link_${index}`}
        rel="preload"
        type={attrs.type ? String(attrs.type) : undefined}
        />
      );
  });
}

function renderJsAssetScripts(
  html: string,
  props: ScriptHTMLAttributes<HTMLScriptElement> = {},
) {
  return parsedScriptTags(html).map((tag, index) => {
      const attrs = tag.attrs;
      return (
        <script
        {...props}
        async={attrs.async === true ? true : props.async}
        defer={attrs.defer === true ? true : props.defer}
        key={`js_asset_script_${index}`}
        src={String(attrs.src || "")}
        type={attrs.type ? String(attrs.type) : undefined}
        />
      );
  });
}

export {
  attrValue,
  hasFlag,
  parsedLinkTags,
  parsedScriptTags,
  renderCssAssetLinks,
  renderFontPreloadAssetLinks,
  renderJsAssetScripts,
};
export type { ParsedHtmlTag };
