import zlib from "node:zlib";

import {
  requestHeader,
  setResponseHeader,
  type ServerRequestLike,
  type ServerResponseLike,
} from "./http.js";

type FrontendAsset = {
  body?: Buffer | string;
  contentType?: string;
  etag?: string;
};

type FrontendAssetOptions = {
  brotliQuality?: number;
  contentType?: string;
  gzipLevel?: number;
  immutable?: boolean;
  isImmutablePath?: (path: string) => boolean;
  minCompressBytes?: number;
  precompress?: boolean;
  record?: (durationMs: number) => unknown;
};

const encodedCache = new WeakMap<object, Record<string, Buffer>>();
const preparedAssets = new WeakSet<object>();

function assetBodyBuffer(asset: FrontendAsset | null | undefined) {
  const body = asset && asset.body != null ? asset.body : "";
  return Buffer.isBuffer(body) ? body : Buffer.from(String(body), "utf8");
}

function assetContentType(asset: FrontendAsset | null | undefined, fallback = "") {
  return String(asset && asset.contentType ? asset.contentType : fallback);
}

function assetIsCompressible(asset: FrontendAsset | null | undefined, fallback = "") {
  const type = assetContentType(asset, fallback).toLowerCase();
  return (
    type.includes("text/css") ||
      type.includes("javascript") ||
      type.includes("application/json") ||
      type.includes("text/plain")
  );
}

function cacheEncodedAsset(
  asset: FrontendAsset,
  encoding: string,
  encoded: Buffer | null,
  rawLength: number,
) {
  if (!encoding || !encoded || encoded.length >= rawLength) return;
  const cache = encodedCache.get(asset) || {};
  cache[encoding] = encoded;
  encodedCache.set(asset, cache);
}

function boundedInteger(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Math.floor(Number(value));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function prepareBrotliAsset(asset: FrontendAsset, raw: Buffer, options: FrontendAssetOptions) {
  try {
    cacheEncodedAsset(
      asset,
      "br",
      zlib.brotliCompressSync(raw, {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: boundedInteger(
              options.brotliQuality,
              5,
              0,
              11,
            ),
            [zlib.constants.BROTLI_PARAM_SIZE_HINT]: raw.length,
          },
      }),
      raw.length,
    );
  } catch {}
}

function prepareGzipAsset(asset: FrontendAsset, raw: Buffer, options: FrontendAssetOptions) {
  try {
    cacheEncodedAsset(
      asset,
      "gzip",
      zlib.gzipSync(raw, {
          level: boundedInteger(options.gzipLevel, 6, 1, 9),
      }),
      raw.length,
    );
  } catch {}
}

function prepareAsset(asset: FrontendAsset, options: FrontendAssetOptions = {}) {
  if (!asset || typeof asset !== "object") return asset;
  if (preparedAssets.has(asset)) return asset;
  preparedAssets.add(asset);

  if (options.precompress === false || !assetIsCompressible(asset, options.contentType)) {
    return asset;
  }

  const raw = assetBodyBuffer(asset);
  if (raw.length < Math.max(0, Number(options.minCompressBytes) || 1024)) {
    return asset;
  }

  prepareBrotliAsset(asset, raw, options);
  prepareGzipAsset(asset, raw, options);
  return asset;
}

function requestAssetPath(req: ServerRequestLike | null | undefined) {
  return String((req && (req.path || req.originalUrl || req.url)) || "")
  .split("?")[0];
}

function isHashedAssetPath(path: string) {
  return /^\/(?:css|js)\/.+-[a-f0-9]{8,64}\.(?:css|js)$/i.test(path);
}

function shouldUseImmutableCache(
  req: ServerRequestLike | null | undefined,
  options: FrontendAssetOptions,
) {
  if (options.immutable === false) return false;
  const path = requestAssetPath(req);
  return options.isImmutablePath ? options.isImmutablePath(path) : isHashedAssetPath(path);
}

function applyAssetCacheHeaders(
  req: ServerRequestLike | null | undefined,
  res: ServerResponseLike,
  options: FrontendAssetOptions,
) {
  if (shouldUseImmutableCache(req, options)) {
    setResponseHeader(res, "Cache-Control", "public, max-age=31536000, immutable");
    return;
  }
  setResponseHeader(res, "Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  setResponseHeader(res, "Pragma", "no-cache");
  setResponseHeader(res, "Expires", "0");
}

function preferredAssetEncoding(req: ServerRequestLike | null | undefined) {
  const accept = requestHeader(req, "accept-encoding").toLowerCase();
  if (accept.includes("br")) return "br";
  if (accept.includes("gzip")) return "gzip";
  return "";
}

function encodedAssetBody(asset: FrontendAsset, encoding: string) {
  if (!encoding || !assetIsCompressible(asset)) return null;
  return encodedCache.get(asset)?.[encoding] || null;
}

function sendPreparedAssetBody(
  req: ServerRequestLike,
  res: ServerResponseLike,
  asset: FrontendAsset,
) {
  const encoding = preferredAssetEncoding(req);
  const encoded = encodedAssetBody(asset, encoding);
  const body = encoded || assetBodyBuffer(asset);
  if (encoded) {
    setResponseHeader(res, "Content-Encoding", encoding);
    setResponseHeader(res, "Vary", "Accept-Encoding");
  }
  setResponseHeader(res, "Content-Length", String(body.length));
  if (typeof res.send === "function") return res.send(body);
  return res.end?.(body);
}

function sendAsset(
  req: ServerRequestLike,
  res: ServerResponseLike,
  asset: FrontendAsset,
  options: FrontendAssetOptions = {},
) {
  const startedAt = performance.now();
  try {
    const etag = asset && typeof asset.etag === "string" ? asset.etag : "";
    if (etag) setResponseHeader(res, "ETag", etag);
    if (etag && requestHeader(req, "if-none-match") === etag) {
      if (typeof res.status === "function") res.status(304);
      res.end?.();
      return true;
    }
    const type = assetContentType(asset, options.contentType);
    if (type) setResponseHeader(res, "Content-Type", type);
    applyAssetCacheHeaders(req, res, options);
    sendPreparedAssetBody(req, res, prepareAsset(asset, options));
    return true;
  } finally {
    options.record?.(Math.max(0, performance.now() - startedAt));
  }
}

function cacheControlForPercent(percent: unknown) {
  const parsed = Number(percent);
  const value = Math.max(0, Math.min(100, Math.floor(Number.isFinite(parsed) ? parsed : 100)));
  if (value === 0) return { immutable: false, value: "no-store, must-revalidate" };
  if (value <= 10) return { immutable: false, value: "public, max-age=0, must-revalidate" };
  if (value <= 40) return { immutable: false, value: "public, max-age=600" };
  if (value <= 70) return { immutable: false, value: "public, max-age=3600" };
  if (value <= 90) return { immutable: false, value: "public, max-age=86400" };
  if (value < 100) return { immutable: false, value: "public, max-age=31536000" };
  return { immutable: true, value: "public, max-age=31536000, immutable" };
}

export {
  assetBodyBuffer,
  assetContentType,
  assetIsCompressible,
  cacheControlForPercent,
  prepareAsset,
  sendAsset,
};
export type { FrontendAsset, FrontendAssetOptions };
