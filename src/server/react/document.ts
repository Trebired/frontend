import { escapeHtml, toText } from "#ndsvdqv80epr";
import {
  serverObject,
  type ServerResponseLike,
} from "#hf241ii8z71i";
import { buildReactRenderShell } from "#hrmhyqyjhxa3";
import type {
  FrontendDocumentContext,
  FrontendReactRendererOptions,
  FrontendRenderShell,
} from "#phikqix8e831";

function defaultNormalizePageId(pageId: unknown) {
  const normalized = toText(pageId)
  .replace(/\\/g, "/")
  .replace(/^\/+|\/+$/g, "");
  if (!normalized) return "";
  const parts = normalized.split("/").filter(Boolean);
  for (const part of parts) {
    if (!part || part === "." || part === "..") {
      throw new Error(`Invalid React page id: ${toText(pageId)}`);
    }
  }
  return parts.join("/");
}

function applyScriptNonce(html: string, nonce: unknown) {
  const nextNonce = toText(nonce);
  if (!nextNonce) return String(html || "");
  const escaped = escapeHtml(nextNonce);
  return String(html || "").replace(
    /<script\b(?![^>]*\bnonce\s*=)([^>]*)>/gi,
    (_match, attrs) => `<script nonce="${escaped}"${String(attrs || "")}>`,
  );
}

function countHtmlTags(html: string, tagName: string) {
  const normalizedTag = toText(tagName).toLowerCase();
  if (!normalizedTag) return 0;
  return String(html || "").match(new RegExp(`<${normalizedTag}\\b`, "gi"))?.length || 0;
}

function readResponseRequestRoute(res: ServerResponseLike | null | undefined) {
  const request = (res as any)?.req || null;
  return toText(request?.originalUrl || request?.url || request?.path, "/");
}

function documentEntries(
  pageId: string,
  componentId: string,
  normalizePageId: (pageId: unknown) => string,
) {
  const normalizedPageId = normalizePageId(pageId);
  const normalizedComponentId = normalizePageId(componentId);
  return {
    componentId: normalizedComponentId,
    entryIds:
    normalizedComponentId !== normalizedPageId
    ? [normalizedPageId, normalizedComponentId]
    : [normalizedPageId],
    pageId: normalizedPageId,
  };
}

function fallbackPageTitle(pageId: string) {
  return (
    pageId
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace(/[-_]+/g, " ") || "Page"
  );
}

function pageTitleForContext(
  context: FrontendDocumentContext,
  options: FrontendReactRendererOptions,
) {
  return (
    toText(context.seo.title) ||
      toText(options.resolvePageTitle?.(context)) ||
      fallbackPageTitle(context.pageId)
  );
}

function buildDocumentContext(
  res: ServerResponseLike,
  pageId: string,
  componentId: string,
  props: Record<string, unknown>,
  options: FrontendReactRendererOptions,
  shellInput?: FrontendRenderShell,
): FrontendDocumentContext {
  const normalize = options.normalizePageId || defaultNormalizePageId;
  const entries = documentEntries(pageId, componentId, normalize);
  const shell = buildReactRenderShell(res, props, options, shellInput);
  const links = options.buildAssetLinks(entries.entryIds);
  const context = {
    ...entries,
    currentUrl: readResponseRequestRoute(res),
    cssLinks: toText(links.cssLinks),
    fontPreloadLinks: toText(links.fontPreloadLinks),
    jsLinks: toText(links.jsLinks),
    locale: serverObject(shell.locale),
    pageTitle: "",
    security: serverObject(shell.security),
    seo: serverObject(shell.seo),
    shell,
    ui: serverObject(shell.ui),
  };
  context.pageTitle = pageTitleForContext(context, options);
  return context;
}

function documentTitleForContext(
  context: FrontendDocumentContext,
  options: FrontendReactRendererOptions,
) {
  return toText(options.resolveTitle?.(context), context.pageTitle);
}

function faviconHrefForContext(
  context: FrontendDocumentContext,
  options: FrontendReactRendererOptions,
) {
  return typeof options.faviconHref === "function"
  ? options.faviconHref(context)
  : toText(options.faviconHref, "/favicon.svg");
}

function rootDocumentProps(
  body: unknown,
  context: FrontendDocumentContext,
  options: FrontendReactRendererOptions,
) {
  return {
    body,
    cssLinks: context.cssLinks,
    csrfToken: toText(context.security.csrfToken),
    currentUrl: context.currentUrl,
    faviconHref: faviconHrefForContext(context, options),
    fontPreloadLinks: context.fontPreloadLinks,
    jsLinks: context.jsLinks,
    lang: toText(context.shell.lang || context.locale.effective, options.defaultLang || "en"),
    nonce: toText(context.shell.nonce),
    pageId: context.pageId,
    pageTitle: context.pageTitle,
    seo: context.seo,
    shell: context.shell,
    theme: toText(context.shell.theme),
    themeKey: toText(context.shell.theme || context.ui.theme, options.defaultTheme || "dark"),
    title: documentTitleForContext(context, options),
    viewerId: toText((context.shell.viewer as any)?.id),
  };
}

function logDocumentStart(
  context: FrontendDocumentContext,
  res: ServerResponseLike,
  options: FrontendReactRendererOptions,
) {
  options.log?.info?.("rendering react document", {
      component_id: context.componentId,
      css_link_count: countHtmlTags(context.cssLinks, "link"),
      js_link_count: countHtmlTags(context.jsLinks, "script"),
      locale: toText(context.locale.effective),
      method: toText((res as any)?.req?.method),
      page_id: context.pageId,
      route: context.currentUrl,
      status: Number((res as any)?.statusCode) || 200,
      theme: toText(context.shell.theme || context.ui.theme),
      viewer_id: toText((context.shell.viewer as any)?.id),
  });
}

export {
  applyScriptNonce,
  buildDocumentContext,
  countHtmlTags,
  defaultNormalizePageId,
  logDocumentStart,
  readResponseRequestRoute,
  rootDocumentProps,
};
