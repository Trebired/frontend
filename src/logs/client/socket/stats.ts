import { entryMatchesConfig } from "#7b8bn65jhw4r";
import type { LogEntry, LogsPage } from "#ej8ewfp5cb1i";
import { safeStr } from "#gu61mitj537f";

function incrementTotalStats(page: LogsPage, entry: LogEntry) {
  if (!page || !page.state || !entryMatchesConfig(entry, page.config)) return;
  const stats = page.state.totalStats && typeof page.state.totalStats === "object"
  ? page.state.totalStats
  : { total: 0, levelCounts: {}, groupCounts: {} };
  const origin = entry && typeof entry === "object" ? (entry as any) : {};
  const level = safeStr(origin.level).toLowerCase() || "info";
  const group = safeStr(origin.group) || "app.log";
  stats.total = Number(stats.total || 0) + 1;
  stats.levelCounts = stats.levelCounts && typeof stats.levelCounts === "object"
  ? stats.levelCounts
  : {};
  stats.groupCounts = stats.groupCounts && typeof stats.groupCounts === "object"
  ? stats.groupCounts
  : {};
  stats.levelCounts[level] = Number(stats.levelCounts[level] || 0) + 1;
  stats.groupCounts[group] = Number(stats.groupCounts[group] || 0) + 1;
  page.state.totalStats = stats;
}

export { incrementTotalStats };
