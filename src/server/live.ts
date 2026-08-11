import { requestHeader, type ServerRequestLike } from "./http.js";

const LIVE_NAVIGATION_REQUEST = "tbf-router";
const LIVE_REGION_REQUEST = "tbf-live";
const REQUESTED_WITH_HEADER = "x-requested-with";

function requestedWith(req: ServerRequestLike | null | undefined) {
  return requestHeader(req, REQUESTED_WITH_HEADER).trim().toLowerCase();
}

function isLiveNavigationRequest(req: ServerRequestLike | null | undefined) {
  return requestedWith(req) === LIVE_NAVIGATION_REQUEST;
}

function isLiveRegionRequest(req: ServerRequestLike | null | undefined) {
  return requestedWith(req) === LIVE_REGION_REQUEST;
}

function frontendRequestMode(req: ServerRequestLike | null | undefined) {
  if (isLiveNavigationRequest(req)) return "navigation";
  if (isLiveRegionRequest(req)) return "region";
  return "document";
}

export {
  LIVE_NAVIGATION_REQUEST,
  LIVE_REGION_REQUEST,
  REQUESTED_WITH_HEADER,
  frontendRequestMode,
  isLiveNavigationRequest,
  isLiveRegionRequest,
  requestedWith,
};
