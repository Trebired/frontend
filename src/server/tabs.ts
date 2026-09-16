import { toString } from "#dqy2d22qyujv";
import { splitUrl, tabRouteUrl, type TabRouteStep } from "#axubisqt0yil";
import { redirectResponse, type ServerRequestLike, type ServerResponseLike } from "./http.js";

type TabRedirectOptions = {
  status?: number;
  steps: readonly TabRouteStep[];
  target: string;
};

type TabSectionRequest = ServerRequestLike& {
  params?: Record<string, unknown>;
};

type TabSectionRedirectOptions = {
  param?: string;
  sections: Readonly<Record<string, readonly TabRouteStep[]>>;
  status?: number;
  target: (req: TabSectionRequest) => unknown;
};

function withRequestSearch(req: ServerRequestLike | null | undefined, target: string) {
  const search = splitUrl(req && (req.originalUrl || req.url)).search;
  if (!search) return target;
  const parts = splitUrl(target);
  const params = new URLSearchParams(search);
  new URLSearchParams(parts.search).forEach((value, key) => params.set(key, value));
  return `${parts.path}?${params.toString()}${parts.hash}`;
}

function redirectToTabs(
  req: ServerRequestLike | null | undefined,
  res: ServerResponseLike | null | undefined,
  options: TabRedirectOptions,
) {
  const target = withRequestSearch(req, toString(options.target) || "/");
  return redirectResponse(res, options.status || 302, tabRouteUrl(target, options.steps));
}

function sectionSteps(options: TabSectionRedirectOptions, section: string) {
  return Object.prototype.hasOwnProperty.call(options.sections, section)
  ? options.sections[section]
  : null;
}

function tabSectionRedirect(options: TabSectionRedirectOptions) {
  const param = toString(options.param) || "section";
  return (req: TabSectionRequest, res: ServerResponseLike, next?: () => unknown) => {
    const section = toString(req && req.params && req.params[param]).toLowerCase();
    const steps = section ? sectionSteps(options, section) : null;
    const target = steps ? toString(options.target(req)) : "";
    if (!steps || !target) return typeof next === "function" ? next() : undefined;
    return redirectToTabs(req, res, { status: options.status, steps, target });
  };
}

export { redirectToTabs, tabRouteUrl, tabSectionRedirect };
export type { TabRedirectOptions, TabRouteStep, TabSectionRedirectOptions };
