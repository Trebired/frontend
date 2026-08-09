import { resolveNamedDropdownInput } from "#z2c0jqmjqds4";
import { DEFAULT_LOGS_INSTANCE_ID } from "./types.js";
import { instanceIdToSnake, normalizeInstanceId } from "./utils.js";
import type { LogsDomIds, LogsUi } from "./types.js";

type DropdownInput = HTMLInputElement | HTMLSelectElement;

export function getLogsDomIds(
  instanceId: unknown = DEFAULT_LOGS_INSTANCE_ID,
): LogsDomIds {
  const id = normalizeInstanceId(instanceId);
  const snake = instanceIdToSnake(id);
  const withId = (suffix: string) => id + "-" + suffix;
  const withSnake = (suffix: string) => snake + "_" + suffix;

  return {
    root: withId("partial"),
    box: withId("box"),
    reactRoot: withId("react-root"),
    loaded: withId("loaded"),
    jumpButton: withId("jump-button"),
    metadataButton: withId("metadata-button"),
    rawModeButton: withId("raw-mode-button"),
    searchButton: withId("search-button"),
    searchInput: withId("search"),
    platformToggle:
    id === DEFAULT_LOGS_INSTANCE_ID
    ? "toggle-platform-logs"
    : withId("toggle-platform-logs"),
    groupDropdown: withId("group-dropdown"),
    groupInput: withId("group"),
    groupList: withId("group-list"),
    groupInputName: withSnake("group"),
    levelDropdown: withId("level-dropdown"),
    levelInput: withId("level"),
    levelList: withId("level-list"),
    levelInputName: withSnake("level"),
    total: withId("total"),
    visible: withId("visible"),
    groupTotal: withId("group-total"),
    statsCard: withId("stats-card"),
    statsCopy: withId("stats-copy"),
    levelStats: withId("level-stats"),
    groupStats: withId("group-stats"),
    totalTabTotal: withId("total-tab-total"),
    totalTabGroupTotal: withId("total-tab-group-total"),
    totalTabLevelStats: withId("total-tab-level-stats"),
    totalTabGroupStats: withId("total-tab-group-stats"),
    detailModal: withSnake("detail_modal"),
    detailTimestamp: withSnake("detail_timestamp"),
    detailLevel: withSnake("detail_level"),
    detailGroup: withSnake("detail_group"),
    detailSource: withSnake("detail_source"),
    detailMessage: withSnake("detail_message"),
    detailMetaWrap: withSnake("detail_meta_wrap"),
    detailMeta: withSnake("detail_meta"),
    detailRaw: withSnake("detail_raw"),
  };
}

function queryById<T extends Element = HTMLElement>(
  root: HTMLElement | null,
  id: string,
): T | null {
  if (!id) return null;

  const local =
  root && root.querySelector ? root.querySelector<T>("#" + id) : null;
  if (local) return local;

  const global = document.getElementById(id);
  return global instanceof HTMLElement ? (global as unknown as T) : null;
}

function resolveLogsDropdowns(
  resolvedRoot: HTMLElement | null,
  ids: LogsDomIds,
) {
  return {
    groupSelect: resolveNamedDropdownInput({
        root: resolvedRoot,
        inputId: ids.groupInput,
        rootId: ids.groupDropdown,
        marker: "group",
        name: ids.groupInputName,
    }) as DropdownInput | null,
    levelSelect: resolveNamedDropdownInput({
        root: resolvedRoot,
        inputId: ids.levelInput,
        rootId: ids.levelDropdown,
        marker: "level",
        name: ids.levelInputName,
    }) as DropdownInput | null,
  };
}

export function resolveLogsDomRoot(
  input?: Element | string | null,
  instanceId: unknown = DEFAULT_LOGS_INSTANCE_ID,
): HTMLElement | null {
  if (input instanceof HTMLElement) return input;

  if (typeof input === "string" && input.trim()) {
    const value = input.trim();
    const byId = document.getElementById(
      value.startsWith("#") ? value.slice(1) : value,
    );
    if (byId instanceof HTMLElement) return byId;
    if (value.startsWith("[data-") && !/[\s,>+~]/.test(value)) {
      try {
        const byDataAttr = document.querySelector(value);
        if (byDataAttr instanceof HTMLElement) return byDataAttr;
      } catch {}
    }
  }

  const id = normalizeInstanceId(instanceId);
  const ids = getLogsDomIds(id);
  const byId = document.getElementById(ids.root);
  if (byId instanceof HTMLElement) return byId;

  const byMarker = document.querySelector(
    `[data-tbf-logs-partial][data-logs-instance-id="${id}"]`,
  );
  return byMarker instanceof HTMLElement ? byMarker : null;
}

export function getLogsDom(
  root: HTMLElement | null,
  instanceId: unknown = DEFAULT_LOGS_INSTANCE_ID,
): LogsUi {
  const ids = getLogsDomIds(instanceId);
  const resolvedRoot = root || resolveLogsDomRoot(null, instanceId);
  const logBox = queryById(resolvedRoot, ids.box);
  const dropdowns = resolveLogsDropdowns(resolvedRoot, ids);

  return {
    root: resolvedRoot,
    scrollBox: logBox,
    box: logBox,
    reactRoot: queryById(resolvedRoot, ids.reactRoot),
    loadedEl: queryById(resolvedRoot, ids.loaded),
    jumpToBottomButton: queryById(
      resolvedRoot,
      ids.jumpButton,
    ) as HTMLButtonElement | null,
    metadataButton: queryById(
      resolvedRoot,
      ids.metadataButton,
    ) as HTMLButtonElement | null,
    rawModeButton: queryById(
      resolvedRoot,
      ids.rawModeButton,
    ) as HTMLButtonElement | null,
    searchButton: queryById(
      resolvedRoot,
      ids.searchButton,
    ) as HTMLButtonElement | null,
    searchInput: queryById(
      resolvedRoot,
      ids.searchInput,
    ) as HTMLInputElement | null,
    togglePlatform: queryById(
      resolvedRoot,
      ids.platformToggle,
    ) as HTMLInputElement | null,
    groupSelect: dropdowns.groupSelect,
    levelSelect: dropdowns.levelSelect,
    totalEl: queryById(resolvedRoot, ids.total),
    visibleEl: queryById(resolvedRoot, ids.visible),
    groupTotalEl: queryById(resolvedRoot, ids.groupTotal),
    statsCopyEl: queryById(
      resolvedRoot,
      ids.statsCopy,
    ) as HTMLTextAreaElement | null,
    levelStatsEl: queryById(resolvedRoot, ids.levelStats),
    groupStatsEl: queryById(resolvedRoot, ids.groupStats),
    totalTabTotalEl: queryById(resolvedRoot, ids.totalTabTotal),
    totalTabGroupTotalEl: queryById(resolvedRoot, ids.totalTabGroupTotal),
    totalTabLevelStatsEl: queryById(resolvedRoot, ids.totalTabLevelStats),
    totalTabGroupStatsEl: queryById(resolvedRoot, ids.totalTabGroupStats),
    detailModal: queryById(resolvedRoot, ids.detailModal),
    detailTimestampEl: queryById(resolvedRoot, ids.detailTimestamp),
    detailLevelEl: queryById(resolvedRoot, ids.detailLevel),
    detailGroupEl: queryById(resolvedRoot, ids.detailGroup),
    detailSourceEl: queryById(resolvedRoot, ids.detailSource),
    detailMessageEl: queryById(resolvedRoot, ids.detailMessage),
    detailMetaWrapEl: queryById(resolvedRoot, ids.detailMetaWrap),
    detailMetaEl: queryById(resolvedRoot, ids.detailMeta),
    detailRawEl: queryById(resolvedRoot, ids.detailRaw),
  };
}
