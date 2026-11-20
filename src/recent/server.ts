import type { FrontendDocumentContext } from "#phikqix8e831";
import { frontendRequestMode } from "#m2m352h4xbcb";
import type { ServerResponseLike } from "#hf241ii8z71i";
import { normalizeRecentPage, normalizeRecentPages, RECENT_PAGES_LIMIT, withRecentVisit, type RecentPage } from "./model.js";

type RecentPagesOptions = {
  limit?: number;
  onChange?: (viewerId: string, pages: RecentPage[]) => unknown;
  onError?: (error: unknown, viewerId: string) => unknown;
  read: (viewerId: string) => unknown | Promise<unknown>;
  viewerId?: (context: FrontendDocumentContext, res: ServerResponseLike) => unknown;
  write: (viewerId: string, pages: RecentPage[]) => unknown | Promise<unknown>;
};

type RecentPages = {
  read: (viewerId: unknown) => Promise<RecentPage[]>;
  record: (res: ServerResponseLike, context: FrontendDocumentContext) => Promise<RecentPage[]|null>;
};

function defaultViewerId(context: FrontendDocumentContext) {
  const viewer = context.shell.viewer as Record<string, unknown>|null | undefined;
  return viewer && typeof viewer === "object" ? viewer.id : "";
}

function isRecordedVisit(res: ServerResponseLike) {
  const request = (res as any)?.req || null;
  const method = String(request?.method || "GET").toUpperCase();
  const status = Number((res as any)?.statusCode || 200);
  return method === "GET" && status < 400 && frontendRequestMode(request) !== "region";
}

function createRecentPages(options: RecentPagesOptions): RecentPages {
  const limit = Math.max(1, Number(options.limit) || RECENT_PAGES_LIMIT);
  const read = async(viewerIdInput: unknown) => {
    const viewerId = String(viewerIdInput ?? "").trim();
    return viewerId ? normalizeRecentPages(await options.read(viewerId), limit) : [];
  };
  const record = async(res: ServerResponseLike, context: FrontendDocumentContext) => {
    const viewerId = String((options.viewerId || defaultViewerId)(context, res) ?? "").trim();
    const visit = normalizeRecentPage({ href: context.currentUrl, title: context.pageTitle, visitedAt: new Date().toISOString() });
    if (!viewerId || !visit || !isRecordedVisit(res)) return null;
    try {
      const current = await read(viewerId);
      const next = withRecentVisit(current, visit, limit);
      await options.write(viewerId, next);
      if (current[0]?.href !== visit.href) await options.onChange?.(viewerId, next);
      return next;
    } catch (error) {
      options.onError?.(error, viewerId);
      return null;
    }
  };
  return { read, record };
}

export { createRecentPages };
export type { RecentPages, RecentPagesOptions };
