export const LOGS_PAGE_SIZE = 200;
export const DEPLOYMENT_LOGS_PAGE_SIZE = LOGS_PAGE_SIZE;
export const DEFAULT_LOGS_INSTANCE_ID = "logs-view";

export interface LogsStatsSummary {
  total: number;
  levelCounts: Record<string, number>;
  groupCounts: Record<string, number>;
}

export interface LogEntry {
  config_key?: unknown;
  recorded_at?: unknown;
  origin?: {
    source?: unknown;
    instance?: unknown;
  } | null;
  source?: unknown;
  level?: unknown;
  group?: unknown;
  message?: unknown;
  metadata?: Record<string, unknown> | null;
}

export interface LogStyle {
  colors?: Record<string, unknown>;
  levels?: Record<
  string,
  { label?: unknown; color?: unknown; bold?: unknown; showStack?: unknown }
  >;
}

export interface FilteredLogItem {
  entry: LogEntry;
  sourceIndex: number;
}

export interface LogsUi {
  root: HTMLElement | null;
  scrollBox: HTMLElement | null;
  box: HTMLElement | null;
  reactRoot: HTMLElement | null;
  loadedEl: HTMLElement | null;
  jumpToBottomButton: HTMLButtonElement | null;
  metadataButton: HTMLButtonElement | null;
  rawModeButton: HTMLButtonElement | null;
  searchButton: HTMLButtonElement | null;
  searchInput: HTMLInputElement | null;
  togglePlatform: HTMLInputElement | null;
  groupSelect: HTMLInputElement | HTMLSelectElement | null;
  levelSelect: HTMLInputElement | HTMLSelectElement | null;
  totalEl: HTMLElement | null;
  visibleEl: HTMLElement | null;
  groupTotalEl: HTMLElement | null;
  statsCopyEl: HTMLTextAreaElement | null;
  levelStatsEl: HTMLElement | null;
  groupStatsEl: HTMLElement | null;
  totalTabTotalEl: HTMLElement | null;
  totalTabGroupTotalEl: HTMLElement | null;
  totalTabLevelStatsEl: HTMLElement | null;
  totalTabGroupStatsEl: HTMLElement | null;
  detailModal: HTMLElement | null;
  detailTimestampEl: HTMLElement | null;
  detailLevelEl: HTMLElement | null;
  detailGroupEl: HTMLElement | null;
  detailSourceEl: HTMLElement | null;
  detailMessageEl: HTMLElement | null;
  detailMetaWrapEl: HTMLElement | null;
  detailMetaEl: HTMLElement | null;
  detailRawEl: HTMLElement | null;
}

export interface LogsDomIds {
  root: string;
  box: string;
  reactRoot: string;
  loaded: string;
  jumpButton: string;
  metadataButton: string;
  rawModeButton: string;
  searchButton: string;
  searchInput: string;
  platformToggle: string;
  groupDropdown: string;
  groupInput: string;
  groupList: string;
  groupInputName: string;
  levelDropdown: string;
  levelInput: string;
  levelList: string;
  levelInputName: string;
  total: string;
  visible: string;
  groupTotal: string;
  statsCard: string;
  statsCopy: string;
  levelStats: string;
  groupStats: string;
  totalTabTotal: string;
  totalTabGroupTotal: string;
  totalTabLevelStats: string;
  totalTabGroupStats: string;
  detailModal: string;
  detailTimestamp: string;
  detailLevel: string;
  detailGroup: string;
  detailSource: string;
  detailMessage: string;
  detailMetaWrap: string;
  detailMeta: string;
  detailRaw: string;
}

export interface LogsConfig {
  raw?: unknown;
  debugLogs?: boolean;
  debugLabel?: unknown;
  config_key?: unknown;
  appId?: unknown;
  scopeIds?: Record<string, unknown>;
  deploymentId?: unknown;
  status?: unknown;
  isRunning?: boolean;
  isLive?: boolean;
  logs?: LogEntry[];
  deploymentLogs?: LogEntry[];
  logStyle?: LogStyle | null;
  totalStats?: LogsStatsSummary | null;
  socketNamespace?: unknown;
  socketOptions?: Record<string, unknown> | null;
  subscribeEvent?: unknown;
  platformLogs?: boolean;
  platformLogsDefaultOff?: boolean;
  allowFrontendLogs?: boolean;
  logsDataUrl?: unknown;
  initialLogsPage?: {
    logs?: LogEntry[];
    offset?: unknown;
    nextOffset?: unknown;
    hasMore?: boolean;
    total?: unknown;
    limit?: unknown;
  } | null;
  allowEmptyScopeIds?: boolean;
  loadingMessage?: unknown;
  waitingMessage?: unknown;
  emptyMessage?: unknown;
  fullscreenGroup?: unknown;
  fullscreenId?: unknown;
  subscribePayload?: (
    page: LogsPage,
    options?: unknown,
  ) => Record<string, unknown> | null;
}

export interface NormalizedLogsConfig {
  raw?: unknown;
  debugLogs: boolean;
  debugLabel: string;
  config_key: string;
  appId: string;
  scopeIds: Record<string, unknown>;
  deploymentId: string;
  status: string;
  isRunning: boolean;
  deploymentLogs: LogEntry[];
  logStyle: LogStyle | null;
  totalStats: LogsStatsSummary | null;
  socketNamespace: string;
  socketOptions?: Record<string, unknown> | null;
  subscribeEvent: string;
  platformLogs: boolean;
  platformLogsDefaultOff: boolean;
  allowFrontendLogs: boolean;
  logsDataUrl: string;
  initialLogsPage: NonNullable<LogsConfig["initialLogsPage"]>;
  allowEmptyScopeIds: boolean;
  loadingMessage: string;
  waitingMessage: string;
  emptyMessage: string;
  fullscreenGroup: string;
  fullscreenId: string;
  subscribePayload?: (
    page: LogsPage,
    options?: unknown,
  ) => Record<string, unknown> | null;
}

export interface LogsPage {
  instanceId: string;
  domIds: LogsDomIds;
  config: NormalizedLogsConfig;
  ui: LogsUi;
  state: {
    allLogs: LogEntry[];
    loadedLogs?: LogEntry[];
    logStyle: LogStyle | null;
    totalStats?: LogsStatsSummary | null;
    socket: any;
    pagedLiveSocket?: any;
    didBootstrap: boolean;
    didPagedBootstrap?: boolean;
    liveRenderCap?: number;
    focusSearchOnFullscreen?: boolean;
    isFollowingBottom?: boolean;
    isHistoryExpanded?: boolean;
    showJumpToBottom?: boolean;
    showMetadata?: boolean;
    rawMode?: boolean;
    forceBottomVersion?: number;
    nextHistoryOffset?: number;
    hasMoreHistory?: boolean;
    historyPageSize?: number;
    isLoadingOlderLogs?: boolean;
    isLoadingInitialLogs?: boolean;
    socketMessage?: string;
    highlightedLogKey: string;
    markedLogKeys?: Record<string, true>;
    logDetailsByKey?: Record<string, FilteredLogItem>;
  };
}

export interface LogsHandlers {
  renderPage?: (page: LogsPage) => void;
  syncGroupSelect?: (page: LogsPage) => void;
  syncLevelSelect?: (page: LogsPage) => void;
}
