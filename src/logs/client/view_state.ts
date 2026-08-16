import { setTooltipText } from "#yf1o70q7eshd";
import { flushBufferedFrontendLogs } from "./bridge.js";
import { getLogsDom } from "./dom.js";
import { mergeLogEntries } from "./socket.js";
import { hasHiddenRenderedHistory } from "./filters.js";
import { entryMatchesConfig } from "./identity.js";
import { DEFAULT_LOGS_INSTANCE_ID } from "./types.js";
import { logsT, normalizeInstanceId, safeStr } from "./utils.js";
import type { LogsPage } from "./types.js";
import { frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";

function readJsonElement(element: Element | null, fallback: Record<string, unknown>) {
  if (!element) return fallback;
  try {
    const text =
    element instanceof HTMLTemplateElement
    ? element.content.textContent || ""
    : element.textContent || "";
    const parsed = text ? JSON.parse(text) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? parsed
    : fallback;
  } catch {
    return fallback;
  }
}

export function readLogsBootData(fallback: Record<string, unknown> = {}) {
  if (typeof document === "undefined") return fallback;
  const element =
  document.querySelector("[data-logs-boot]") ||
    document.getElementById("__DEPLOYMENT_VIEW_DATA__");
  return readJsonElement(element, fallback);
}

export function normalizeFrontendLogBatch(input: any) {
  const src =
  input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const entries = Array.isArray(src.entries) ? src.entries.filter(Boolean) : [];
  const config =
  src.config && typeof src.config === "object" ? src.config : null;
  const instanceId = normalizeInstanceId(
    src.instanceId ||
      (config && (config as any).instanceId) ||
      DEFAULT_LOGS_INSTANCE_ID,
  );

  return {
    entries,
    config,
    instanceId,
  };
}

export function buildFrontendScopedEntries(page: LogsPage, entries: any[]) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const config = page && page.config ? page.config : null;
  const configKey = safeStr(config && config.config_key);
  if (!configKey) return [];

  const ids = {
    ...(config && config.scopeIds && typeof config.scopeIds === "object"
      ? config.scopeIds
      : {}),
    ...(safeStr(config && config.deploymentId)
      ? { id: safeStr(config && config.deploymentId) }
      : {}),
  };

  return safeEntries.map(function(entry) {
      const src = entry && typeof entry === "object" ? entry : {};
      const origin =
      src.origin && typeof src.origin === "object" ? src.origin : {};
      return {
        ...src,
        config_key: configKey,
        ids,
        source: safeStr(src.source) || safeStr(origin.source) || "frontend",
        origin: {
          source: safeStr(origin.source) || "frontend",
          instance: Object.prototype.hasOwnProperty.call(origin, "instance")
          ? origin.instance
          : null,
        },
      };
  });
}

export function addLoadedLogs(page: LogsPage, entries: any[]) {
  const current = Array.isArray(page.state.loadedLogs)
  ? page.state.loadedLogs
  : [];
  page.state.loadedLogs = mergeLogEntries(
    current,
    Array.isArray(entries) ? entries : [],
  );
}

export function appendLogsToPage(
  page: LogsPage,
  entries: any[],
  handlers: {
    renderLogs: (page: LogsPage) => void;
    syncGroupSelect: (page: LogsPage) => void;
    syncLevelSelect: (page: LogsPage) => void;
  },
) {
  const incoming = buildFrontendScopedEntries(page, entries).filter(
    function(entry) {
      return entryMatchesConfig(entry, page.config);
    },
  );
  if (!incoming.length) return false;

  page.state.didBootstrap = true;
  page.state.socketMessage = "";
  page.state.totalStats = null;
  page.state.allLogs = mergeLogEntries(page.state.allLogs || [], incoming);
  addLoadedLogs(page, incoming);

  if (page.state.isFollowingBottom && !page.state.isHistoryExpanded) {
    page.state.forceBottomVersion =
    Number(page.state.forceBottomVersion || 0) + 1;
  }

  handlers.syncGroupSelect(page);
  handlers.syncLevelSelect(page);
  handlers.renderLogs(page);
  return true;
}

export function flushFrontendLogsBuffer(
  ingestFrontendLogs: (input: any) => boolean,
) {
  return flushBufferedFrontendLogs(ingestFrontendLogs);
}

export function refreshLogDom(page: LogsPage) {
  Object.assign(page.ui, getLogsDom(page.ui.root, page.instanceId));
  return page.ui;
}

export function syncSearchAffix(page: LogsPage) {
  refreshLogDom(page);
}

export function readBottomOffset(box: HTMLElement | null) {
  if (!box) return 0;
  return Math.max(0, box.scrollHeight - box.clientHeight - box.scrollTop);
}

export function isNearLogBottom(box: HTMLElement | null) {
  if (!box) return true;
  return readBottomOffset(box) <= 2;
}

export function forceViewportToBottom(page: LogsPage) {
  page.state.isFollowingBottom = true;
  page.state.isHistoryExpanded = false;
  page.state.showJumpToBottom = false;
  page.state.forceBottomVersion =
  Number(page.state.forceBottomVersion || 0) + 1;
  const ui = refreshLogDom(page);
  const box = ui.box;
  if (box) {
    box.scrollTop = Math.max(0, box.scrollHeight - box.clientHeight);
    window.requestAnimationFrame(function() {
        const nextBox = refreshLogDom(page).box;
        if (!nextBox) return;
        nextBox.scrollTop = Math.max(
          0,
          nextBox.scrollHeight - nextBox.clientHeight,
        );
    });
  }
}

export function canForceViewportToBottom(page: LogsPage) {
  return Boolean(page.state.isFollowingBottom && !page.state.isHistoryExpanded);
}

export function escapeBottomFollow(
  page: LogsPage,
  renderLogs: (page: LogsPage) => void,
) {
  const hiddenHistory = hasHiddenRenderedHistory(page);

  if (
    !page.state.isFollowingBottom &&
      page.state.showJumpToBottom &&
      (!hiddenHistory || page.state.isHistoryExpanded)
  ) {
    return;
  }

  page.state.isFollowingBottom = false;
  page.state.showJumpToBottom = true;
  renderLogs(page);
}

export function syncMetadataButton(page: LogsPage) {
  const ui = refreshLogDom(page);
  const button = ui.metadataButton;
  if (!button) return;

  const showing = Boolean(page && page.state && page.state.showMetadata);
  button.setAttribute("aria-pressed", showing ? "true" : "false");
  button.setAttribute(
    "aria-label",
    showing ? logsT("hideMetadata") : logsT("showMetadata"),
  );
  setTooltipText(
    button,
    showing ? logsT("hideMetadata") : logsT("showMetadata"),
  );
}

export function focusSearchInput(page: LogsPage, attempt = 0) {
  const input = refreshLogDom(page).searchInput;
  if (!input) return;

  const isVisible = input.getClientRects().length > 0;
  if (!isVisible && attempt < 5) {
    window.requestAnimationFrame(function() {
        focusSearchInput(page, attempt + 1);
    });
    return;
  }

  input.focus();
  input.select();
}

export function tryFocusSearchInput(page: LogsPage) {
  const input = refreshLogDom(page).searchInput;
  if (!input) return false;

  try {
    input.focus();
    input.select();
  } catch {}

  return document.activeElement === input;
}

export function focusSearchInputAfterFullscreenRequest(
  page: LogsPage,
  attempt = 0,
) {
  const root = refreshLogDom(page).root;
  const input = refreshLogDom(page).searchInput;
  const isFullscreen = Boolean(
    root &&
      root.getAttribute &&
      root.getAttribute(frontendDataAttr("fullscreen-active")) === "true",
  );
  const isVisible = Boolean(input && input.getClientRects().length > 0);

  if (isFullscreen && isVisible) {
    syncSearchAffix(page);
    if (tryFocusSearchInput(page)) return;
    focusSearchInput(page);
    return;
  }

  if (attempt >= 30) return;
  window.requestAnimationFrame(function() {
      focusSearchInputAfterFullscreenRequest(page, attempt + 1);
  });
}

export function focusSearchInputAfterFullscreenOpen(page: LogsPage) {
  const delays = [0, 16, 40, 90, 160, 260, 400];

  delays.forEach(function(delay) {
      window.setTimeout(function() {
          syncSearchAffix(page);
          if (tryFocusSearchInput(page)) return;
          focusSearchInput(page);
        }, delay);
  });
}

export function focusSearchInputWhenAvailable(page: LogsPage, attempt = 0) {
  const root = refreshLogDom(page).root;
  const input = refreshLogDom(page).searchInput;
  const isFullscreen = Boolean(
    root &&
      root.querySelector &&
      root.querySelector(frontendDataSelector("fullscreen-active", "true")),
  );
  const isVisible = Boolean(input && input.getClientRects().length > 0);

  if (isFullscreen && isVisible) {
    focusSearchInput(page);
    return;
  }

  if (attempt >= 12) return;
  window.requestAnimationFrame(function() {
      focusSearchInputWhenAvailable(page, attempt + 1);
  });
}

export function syncViewportFromScroll(
  page: LogsPage,
  handlers: {
    loadOlderLogs: (page: LogsPage) => void;
    renderLogs: (page: LogsPage) => void;
  },
) {
  const ui = refreshLogDom(page);
  const { state } = page;
  const box = ui.box;
  if (!box) return;

  const atBottom = isNearLogBottom(box);

  if (state.isFollowingBottom) {
    if (!atBottom) escapeBottomFollow(page, handlers.renderLogs);
    return;
  }

  const hiddenHistory = hasHiddenRenderedHistory(page);
  const shouldExpandHistory =
  box.scrollTop <= 24 && (hiddenHistory || state.hasMoreHistory === true);
  const nextExpanded = Boolean(state.isHistoryExpanded) || shouldExpandHistory;
  const nextShowJumpToBottom = true;

  if (
    Boolean(state.isHistoryExpanded) === nextExpanded &&
      Boolean(state.showJumpToBottom) === nextShowJumpToBottom
  ) {
    return;
  }

  state.isFollowingBottom = false;
  state.isHistoryExpanded = nextExpanded;
  state.showJumpToBottom = nextShowJumpToBottom;
  if (shouldExpandHistory) {
    if (hiddenHistory) {
      handlers.renderLogs(page);
    }
    handlers.loadOlderLogs(page);
    return;
  }
  handlers.renderLogs(page);
}
