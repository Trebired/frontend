import { normalizeSpace } from "#bu1nq95e3k0f";
import { createIconSvgResponse } from "#wwj1o2wv6dor";
import type { IconServerOptions } from "#wwj1o2wv6dor";
import { sendExpressResponse } from "./response.js";
import type { ExpressLikeResponse } from "./response.js";

type ExpressLikeRequest = {
  query?: Record<string, unknown>;
  url?: string;
};

type ExpressNext = (error?: unknown) => void;

function readRequestSpec(req: ExpressLikeRequest): string {
  const querySpec = normalizeSpace(req?.query?.spec);
  if (querySpec) return querySpec;
  try {
    const url = new URL(req.url || "", "http://localhost");
    return normalizeSpace(url.searchParams.get("spec"));
  } catch {
    return "";
  }
}

function createIconMiddleware(options: IconServerOptions = {}) {
  return function iconMiddleware(req: ExpressLikeRequest, res: ExpressLikeResponse, next?: ExpressNext): unknown {
    try {
      return sendExpressResponse(res, createIconSvgResponse(readRequestSpec(req), options));
    } catch (error) {
      if (next) return next(error);
      throw error;
    }
  };
}

const createExpressIconMiddleware = createIconMiddleware;

export { createExpressIconMiddleware, createIconMiddleware };
export type { ExpressLikeRequest, ExpressLikeResponse };
