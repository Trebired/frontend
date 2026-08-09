import { createLocalTranslator, toString } from "#aq4qe9opqpbm";

type view_props = {
  extendGroup?: string;
  exportOptions?: Array<{ href?: string; label?: string }>;
  allowPlatformToggle?: boolean;
  hidePlatformToggle?: boolean;
  hideStats?: boolean;
  instanceId?: string;
  lang?: string;
  masonry?: boolean;
  panelClassName?: string;
  platform_logs?: boolean;
  rootClassName?: string;
  title?: string;
  productName?: string;
};

function clean_instance_id(value: string) {
  let out = String(value || "")
  .trim()
  .replace(/[^A-Za-z0-9_-]+/g, "-")
  .replace(/-+/g, "-")
  .replace(/^[-_]+|[-_]+$/g, "");
  if (!out) out = "logs-view";
  if (!/^[A-Za-z]/.test(out)) out = `logs-${out}`;
  return out;
}

function snake_instance_id(value: string) {
  return (
    clean_instance_id(value)
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "") || "logs_view"
  );
}

function logIds(
  logId: (suffix: string) => string,
  logSnakeId: (suffix: string) => string,
  logsInstanceSnake: string,
  logsInstanceId: string,
) {
  return {
    box: logId("box"),
    detailGroup: logSnakeId("detail_group"),
    detailLevel: logSnakeId("detail_level"),
    detailMessage: logSnakeId("detail_message"),
    detailMeta: logSnakeId("detail_meta"),
    detailMetaWrap: logSnakeId("detail_meta_wrap"),
    detailModal: logSnakeId("detail_modal"),
    detailRaw: logSnakeId("detail_raw"),
    detailSource: logSnakeId("detail_source"),
    detailTimestamp: logSnakeId("detail_timestamp"),
    groupDropdown: logId("group-dropdown"),
    groupInput: logId("group"),
    groupInputName: `${logsInstanceSnake}_group`,
    groupList: logId("group-list"),
    groupStats: logId("group-stats"),
    groupTotal: logId("group-total"),
    jumpButton: logId("jump-button"),
    levelDropdown: logId("level-dropdown"),
    levelInput: logId("level"),
    levelInputName: `${logsInstanceSnake}_level`,
    levelList: logId("level-list"),
    levelStats: logId("level-stats"),
    loaded: logId("loaded"),
    metadataButton: logId("metadata-button"),
    platformToggle:
    logsInstanceId === "logs-view"
    ? "toggle-platform-logs"
    : logId("toggle-platform-logs"),
    rawModeButton: logId("raw-mode-button"),
    reactRoot: logId("react-root"),
    root: logId("partial"),
    searchButton: logId("search-button"),
    searchInput: logId("search"),
    statsCard: logId("stats-card"),
    statsCopy: logId("stats-copy"),
    total: logId("total"),
    totalTabGroupStats: logId("total-tab-group-stats"),
    totalTabGroupTotal: logId("total-tab-group-total"),
    totalTabLevelStats: logId("total-tab-level-stats"),
    totalTabTotal: logId("total-tab-total"),
    visible: logId("visible"),
  };
}

function exportOptionsFor(props: view_props) {
  return Array.isArray(props.exportOptions)
  ? props.exportOptions.filter(
    (item) =>
    item &&
      typeof item === "object" &&
      toString((item as any).href) &&
      toString((item as any).label),
  )
  : [];
}

function createLogsViewModel(props: view_props) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  const logsInstanceId = clean_instance_id(
    String(props.instanceId || "logs-view"),
  );
  const logsInstanceSnake = snake_instance_id(logsInstanceId);
  const logId = (suffix: string) => `${logsInstanceId}-${suffix}`;
  const logSnakeId = (suffix: string) => `${logsInstanceSnake}_${suffix}`;
  const rootClassName = String(props.rootClassName || "grid gap-sm");

  return {
    exportOptions: exportOptionsFor(props),
    exportPopoverId: logId("export-popover"),
    ids: logIds(logId, logSnakeId, logsInstanceSnake, logsInstanceId),
    logId,
    logsExtendGroup: toString(
      props.extendGroup,
      logsInstanceId === "logs-view" ? "logs-container" : logId("container"),
    ),
    logsInstanceId,
    panelClassName: toString(props.panelClassName, "height-xl"),
    productName: toString(
      props.productName,
      localT("productFallback"),
    ),
    resolvedRootClassName: rootClassName,
    showPlatformToggle:
    props.allowPlatformToggle !== false &&
      props.hidePlatformToggle !== true &&
      Boolean(props.platform_logs),
    showStats: props.hideStats !== true,
    t: localT,
    title: toString(props.title, localT("title")),
  };
}

export { createLogsViewModel };
export type { view_props };
