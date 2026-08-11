import {
  requestHeader,
  serverObject,
  serverString,
  type ServerRequestLike,
  type ServerResponseLike,
} from "./http.js";

type AcceptedMediaRange = {
  media: string;
  q: number;
};

type DocumentFallbackOptions = {
  mediaTypes?: readonly string[];
  methods?: readonly string[];
};

type CurrentRenderModePathOptions = {
  exclude?: readonly string[];
};

type FrontendFallbackMode = "document" | "json";

type FrontendFallbackModeContext = {
  mode: FrontendFallbackMode;
  next?: (error?: unknown) => unknown;
  req: ServerRequestLike;
  res: ServerResponseLike;
};

type FrontendFallbackModeOptions = DocumentFallbackOptions& {
  applyRenderMode?: (
    mode: string,
  ) => (req: ServerRequestLike, res: ServerResponseLike, next: (error?: unknown) => unknown) => unknown;
  documentRenderMode?: string;
  respond: (context: FrontendFallbackModeContext) => unknown;
};

const DOCUMENT_FALLBACK_METHODS = Object.freeze(["GET", "HEAD"]);
const HTML_DOCUMENT_MEDIA_TYPES = Object.freeze(["application/xhtml+xml", "text/html"]);
const RENDER_MODE_PATH_EXCLUDES = Object.freeze([
    "default",
    "partial",
    "success",
    "noop",
]);

function parseAcceptedMediaRange(input: unknown): AcceptedMediaRange | null {
  const parts = serverString(input).split(";").map((part) => part.trim());
  const media = serverString(parts.shift()).toLowerCase();
  if (!media) return null;
  let q = 1;
  for (const part of parts) {
    const separator = part.indexOf("=");
    const key = separator >= 0 ? part.slice(0, separator).trim().toLowerCase() : "";
    if (key !== "q") continue;
    const parsed = Number(part.slice(separator + 1).trim());
    if (Number.isFinite(parsed)) q = Math.max(0, Math.min(1, parsed));
  }
  return { media, q };
}

function acceptedMediaRanges(req: ServerRequestLike | null | undefined) {
  return requestHeader(req, "accept")
  .split(",")
  .map((entry) => parseAcceptedMediaRange(entry))
  .filter((entry): entry is AcceptedMediaRange => Boolean(entry && entry.q > 0));
}

function acceptsHtmlDocument(
  req: ServerRequestLike | null | undefined,
  options: DocumentFallbackOptions = {},
) {
  const mediaTypes = new Set(options.mediaTypes || HTML_DOCUMENT_MEDIA_TYPES);
  return acceptedMediaRanges(req).some((range) => mediaTypes.has(range.media));
}

function shouldRenderDocumentFallback(
  req: ServerRequestLike | null | undefined,
  options: DocumentFallbackOptions = {},
) {
  const method = serverString((req as { method?: unknown } | null | undefined)?.method)
  .trim()
  .toUpperCase();
  const methods = new Set(options.methods || DOCUMENT_FALLBACK_METHODS);
  return methods.has(method) && acceptsHtmlDocument(req, options);
}

function currentRenderModePath(
  res: ServerResponseLike | null | undefined,
  options: CurrentRenderModePathOptions = {},
) {
  const flags = serverObject(res?.locals?.renderMode);
  const exclude = new Set(options.exclude || RENDER_MODE_PATH_EXCLUDES);
  const names = Object.keys(flags)
  .filter((name) => flags[name] === true && !exclude.has(name))
  .sort((left, right) => {
      const depth = right.split(".").length - left.split(".").length;
      return depth !== 0 ? depth : right.length - left.length;
  });
  return names[0] || "";
}

function respondWithFrontendFallbackMode(
  req: ServerRequestLike,
  res: ServerResponseLike,
  next: ((error?: unknown) => unknown) | undefined,
  options: FrontendFallbackModeOptions,
) {
  if (!shouldRenderDocumentFallback(req, options)) {
    return options.respond({ mode: "json", next, req, res });
  }
  if (!options.applyRenderMode) {
    return options.respond({ mode: "document", next, req, res });
  }
  const middleware = options.applyRenderMode(options.documentRenderMode || "error");
  return middleware(req, res, (error?: unknown) => {
      if (error) return typeof next === "function" ? next(error) : undefined;
      return options.respond({ mode: "document", next, req, res });
  });
}

export {
  acceptedMediaRanges,
  acceptsHtmlDocument,
  currentRenderModePath,
  DOCUMENT_FALLBACK_METHODS,
  HTML_DOCUMENT_MEDIA_TYPES,
  parseAcceptedMediaRange,
  RENDER_MODE_PATH_EXCLUDES,
  respondWithFrontendFallbackMode,
  shouldRenderDocumentFallback,
};
export type {
  AcceptedMediaRange,
  CurrentRenderModePathOptions,
  DocumentFallbackOptions,
  FrontendFallbackMode,
  FrontendFallbackModeContext,
  FrontendFallbackModeOptions,
};
