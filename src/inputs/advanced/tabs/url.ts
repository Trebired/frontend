import { toString } from "#dqy2d22qyujv";

type TabRouteStep = {
  familyKey: string;
  route: string;
};

const HASH_MARKER = String.fromCharCode(35);

function routeParamNameForFamily(familyKey: unknown) {
  const value = toString(familyKey);
  return value ? `tab-${value}` : "";
}

function splitUrl(url: unknown) {
  const raw = toString(url) || "/";
  const hashIndex = raw.indexOf(HASH_MARKER);
  const withoutHash = hashIndex >= 0 ? raw.slice(0, hashIndex) : raw;
  const queryIndex = withoutHash.indexOf("?");
  return {
    hash: hashIndex >= 0 ? raw.slice(hashIndex) : "",
    path: queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash,
    search: queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : "",
  };
}

function tabRouteUrl(url: unknown, steps: readonly TabRouteStep[]) {
  const parts = splitUrl(url);
  const params = new URLSearchParams(parts.search);
  for (const step of Array.isArray(steps) ? steps : []) {
    const key = routeParamNameForFamily(step && step.familyKey);
    const route = toString(step && step.route);
    if (key && route) params.set(key, route);
  }
  const search = params.toString();
  return `${parts.path}${search ? `?${search}` : ""}${parts.hash}`;
}

export { routeParamNameForFamily, splitUrl, tabRouteUrl };
export type { TabRouteStep };
