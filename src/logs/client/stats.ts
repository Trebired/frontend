import React from "react";
import { createRoot } from "react-dom/client";
import {
  key_value,
  primitiveTextClassName,
} from "#hzrmwbvgt2ax";
import { entryMatchesConfig } from "./identity.js";
import {
  getFilteredLoadedLogs,
  getLogEntryGroupKey,
  getLogEntryLevelKey,
} from "./filters.js";
import { logsT } from "./utils.js";
import type { LogsStatsSummary } from "./types.js";
import type { FilteredLogItem, LogsPage } from "./types.js";

const statsRoots = new WeakMap();

function getStatsRoot(container: HTMLElement | null) {
  if (!(container instanceof HTMLElement)) return null;

  let root = statsRoots.get(container);
  if (!root) {
    root = createRoot(container);
    statsRoots.set(container, root);
  }

  return root;
}

function buildCountMap(
  items: FilteredLogItem[],
  keyGetter: (item: FilteredLogItem) => string,
) {
  const counts: Record<string, number> = {};

  for (const item of Array.isArray(items) ? items : []) {
    const key = keyGetter(item);
    counts[key] = (counts[key] || 0) + 1;
  }

  return counts;
}

function toCountRows(counts: Record<string, number>) {
  return Object.entries(counts)
  .sort(function (a, b) {
      return a[0].localeCompare(b[0]);
  })
  .map(function ([key, count]) {
      return {
        label: key,
        value: String(count),
      };
  });
}

function renderCountList(
  container: HTMLElement | null,
  counts: Record<string, number>,
  emptyLabel: string,
) {
  const root = getStatsRoot(container);
  if (!root) return;

  const rows = toCountRows(counts);

  if (!rows.length) {
    root.render(
      React.createElement("div", { className: primitiveTextClassName({ muted: true }) }, emptyLabel),
    );
    return;
  }

  root.render(React.createElement(key_value, { rows }));
}

function copyTextForSection(
  title: string,
  input: {
    total: number;
    visible?: number;
    groupTotal?: number;
    levelCounts: Record<string, number>;
    groupCounts: Record<string, number>;
  },
) {
  const src: typeof input =
  input && typeof input === "object" ? input : ({} as typeof input);
  const levelEntries = Object.entries(src.levelCounts || {}).sort(
    function (a, b) {
      return a[0].localeCompare(b[0]);
    },
  );
  const groupEntries = Object.entries(src.groupCounts || {}).sort(
    function (a, b) {
      return a[0].localeCompare(b[0]);
    },
  );

  const lines = [
    title,
    logsT("totalLabel") + ": " + String(Number(src.total || 0)),
  ];

  if (typeof src.visible === "number" && Number.isFinite(src.visible)) {
    lines.push(logsT("visibleLabel") + ": " + String(Number(src.visible || 0)));
  }

  if (typeof src.groupTotal === "number" && Number.isFinite(src.groupTotal)) {
    lines.push(
      logsT("groupsTotalLabel") + ": " + String(Number(src.groupTotal || 0)),
    );
  }

  lines.push("", logsT("levels"));

  if (levelEntries.length) {
    levelEntries.forEach(function ([key, count]) {
        lines.push(key + ": " + String(count));
    });
  } else {
    lines.push(logsT("nothingRecorded"));
  }

  lines.push("", logsT("groups"));
  if (groupEntries.length) {
    groupEntries.forEach(function ([key, count]) {
        lines.push(key + ": " + String(count));
    });
  } else {
    lines.push(logsT("nothingRecorded"));
  }

  return lines.join("\n");
}

function buildStatsSummaryFromItems(
  items: FilteredLogItem[],
): LogsStatsSummary {
  const levelCounts = buildCountMap(items, function (item) {
      return getLogEntryLevelKey(item && item.entry);
  });
  const groupCounts = buildCountMap(items, function (item) {
      return getLogEntryGroupKey(item && item.entry);
  });

  return {
    total: Array.isArray(items) ? items.length : 0,
    levelCounts,
    groupCounts,
  };
}

function hasUsableSummary(input: LogsStatsSummary | null | undefined) {
  if (!input || typeof input !== "object") return false;
  const total = Number(input.total || 0);
  const levelCountSize = Object.keys(input.levelCounts || {}).length;
  const groupCountSize = Object.keys(input.groupCounts || {}).length;
  return total > 0 || levelCountSize > 0 || groupCountSize > 0;
}

function loadedTotal(page: LogsPage, filtered: FilteredLogItem[]) {
  const { state, config } = page;
  let total = 0;

  for (const entry of Array.isArray(state.loadedLogs) && state.loadedLogs.length
    ? state.loadedLogs
    : state.allLogs) {
    if (!entryMatchesConfig(entry, config)) continue;
    total += 1;
  }

  if (!total && Array.isArray(filtered) && filtered.length) {
    return filtered.length;
  }

  return total;
}

function fallbackTotalSummary(page: LogsPage) {
  const { state, config } = page;

  return buildStatsSummaryFromItems(
    (Array.isArray(state.allLogs) ? state.allLogs : [])
    .filter(function (entry) {
        return entryMatchesConfig(entry, config);
    })
    .map(function (entry, index) {
        return { entry, sourceIndex: index };
    }),
  );
}

export function buildStatsCopyText(input: {
    loaded: {
      total: number;
      visible: number;
      groupTotal?: number;
      levelCounts: Record<string, number>;
      groupCounts: Record<string, number>;
    };
    total: {
      total: number;
      groupTotal?: number;
      levelCounts: Record<string, number>;
      groupCounts: Record<string, number>;
    };
}) {
  const src: typeof input =
  input && typeof input === "object" ? input : ({} as typeof input);
  return [
    copyTextForSection(
      logsT("loadedTab"),
      src.loaded || { total: 0, visible: 0, levelCounts: {}, groupCounts: {} },
    ),
    "",
    copyTextForSection(
      logsT("totalTab"),
      src.total || { total: 0, levelCounts: {}, groupCounts: {} },
    ),
  ].join("\n");
}

function updateLoadedStats(
  page: LogsPage,
  filtered: FilteredLogItem[],
  loadedSummary: LogsStatsSummary,
  loadedTotalValue: number,
) {
  const { ui } = page;
  if (ui.totalEl) {
    ui.totalEl.textContent = String(loadedTotalValue);
  }

  if (ui.loadedEl) {
    ui.loadedEl.textContent = String(
      Array.isArray(filtered) ? filtered.length : 0,
    );
  }

  if (ui.visibleEl) {
    ui.visibleEl.textContent = String(
      Array.isArray(filtered) ? filtered.length : 0,
    );
  }

  if (ui.groupTotalEl) {
    ui.groupTotalEl.textContent = String(
      Object.keys(loadedSummary.groupCounts).length,
    );
  }

  renderCountList(
    ui.levelStatsEl,
    loadedSummary.levelCounts,
    logsT("nothingRecorded"),
  );
  renderCountList(
    ui.groupStatsEl,
    loadedSummary.groupCounts,
    logsT("nothingRecorded"),
  );
}

function updateTotalStats(page: LogsPage, totalSummary: LogsStatsSummary) {
  const { ui } = page;
  if (ui.totalTabTotalEl) {
    ui.totalTabTotalEl.textContent = String(Number(totalSummary.total || 0));
  }

  if (ui.totalTabGroupTotalEl) {
    ui.totalTabGroupTotalEl.textContent = String(
      Object.keys(totalSummary.groupCounts || {}).length,
    );
  }

  renderCountList(
    ui.totalTabLevelStatsEl,
    totalSummary.levelCounts || {},
    logsT("nothingRecorded"),
  );
  renderCountList(
    ui.totalTabGroupStatsEl,
    totalSummary.groupCounts || {},
    logsT("nothingRecorded"),
  );
}

function updateStatsCopy(
  page: LogsPage,
  filtered: FilteredLogItem[],
  loadedSummary: LogsStatsSummary,
  totalSummary: LogsStatsSummary,
  loadedTotalValue: number,
) {
  const { ui } = page;
  if (ui.statsCopyEl) {
    ui.statsCopyEl.value = buildStatsCopyText({
        loaded: {
          total: loadedTotalValue,
          visible: Array.isArray(filtered) ? filtered.length : 0,
          groupTotal: Object.keys(loadedSummary.groupCounts).length,
          levelCounts: loadedSummary.levelCounts,
          groupCounts: loadedSummary.groupCounts,
        },
        total: {
          total: Number(totalSummary.total || 0),
          groupTotal: Object.keys(totalSummary.groupCounts || {}).length,
          levelCounts: totalSummary.levelCounts || {},
          groupCounts: totalSummary.groupCounts || {},
        },
    });
  }
}

export function updateLogStats(page: LogsPage, filtered: FilteredLogItem[]) {
  const loadedSummary = buildStatsSummaryFromItems(getFilteredLoadedLogs(page));
  const totalSummary = hasUsableSummary(page.state.totalStats)
  ? page.state.totalStats
  : fallbackTotalSummary(page);
  const loadedTotalValue = loadedTotal(page, filtered);

  updateLoadedStats(page, filtered, loadedSummary, loadedTotalValue);
  updateTotalStats(page, totalSummary);
  updateStatsCopy(
    page,
    filtered,
    loadedSummary,
    totalSummary,
    loadedTotalValue,
  );
}
