import { LOGS_PAGE_SIZE } from "./types.js";
import type { LogsPage } from "./types.js";

export function logsLiveRenderCap(page: LogsPage) {
  const raw = Number(page && page.state ? page.state.liveRenderCap : 0);
  return Number.isFinite(raw) && raw > 0 ? raw : LOGS_PAGE_SIZE;
}
