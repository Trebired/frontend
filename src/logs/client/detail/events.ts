import { subscribe } from "#tso422aj56zf";
import type { LogsPage, LogsUi } from "#ej8ewfp5cb1i";
import { safeStr } from "#gu61mitj537f";

type EventHandlers = {
  forceViewportToBottom: (page: LogsPage) => void;
  focusSearchInputAfterFullscreenOpen: (page: LogsPage) => void;
  focusSearchInputAfterFullscreenRequest: (page: LogsPage) => void;
  refreshLogDom: (page: LogsPage) => LogsUi;
  renderLogs: (page: LogsPage) => void;
  syncMetadataButton: (page: LogsPage) => void;
  syncViewportFromScroll: (page: LogsPage) => void;
};

function forceBottomOnFilterChange(page: LogsPage) {
  const { state } = page;
  if (state.isFollowingBottom && !state.isHistoryExpanded) {
    state.forceBottomVersion = Number(state.forceBottomVersion || 0) + 1;
  }
}

function isLogFilterTarget(page: LogsPage, target: Element) {
  return (
    target.matches(
      "#" +
        page.domIds.groupInput +
        ', [data-log-filter-input="group"]' +
        ', input[name="' +
        page.domIds.groupInputName +
        '"]' +
        ', select[name="' +
        page.domIds.groupInputName +
        '"]',
    ) ||
      target.matches(
      "#" +
        page.domIds.levelInput +
        ', [data-log-filter-input="level"]' +
        ', input[name="' +
        page.domIds.levelInputName +
        '"]' +
        ', select[name="' +
        page.domIds.levelInputName +
        '"]',
    )
  );
}

function bindFilterEvents(page: LogsPage, handlers: EventHandlers) {
  const { ui, state } = page;
  ui.root.addEventListener("change", function(event) {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      if (!isLogFilterTarget(page, target)) return;

      handlers.refreshLogDom(page);
      forceBottomOnFilterChange(page);
      handlers.renderLogs(page);
  });

  if (ui.togglePlatform) {
    ui.togglePlatform.addEventListener("change", function() {
        forceBottomOnFilterChange(page);
        if (state.socket && state.socket.connected) {
          subscribe(page, { bootstrap: false });
        }
        handlers.renderLogs(page);
    });
  }
}

function bindLogsSearchEvents(page: LogsPage, handlers: EventHandlers) {
  const { ui, state } = page;
  if (ui.searchInput) {
    ui.searchInput.addEventListener("input", function() {
        forceBottomOnFilterChange(page);
        handlers.renderLogs(page);
    });
  }

  if (ui.searchButton) {
    ui.searchButton.addEventListener("click", function() {
        state.focusSearchOnFullscreen = true;
        handlers.focusSearchInputAfterFullscreenRequest(page);
    });
  }
}

function bindLogsDetailModeButtons(page: LogsPage, handlers: EventHandlers) {
  const { ui, state } = page;
  if (ui.metadataButton) {
    ui.metadataButton.addEventListener("click", function() {
        state.showMetadata = !state.showMetadata;
        forceBottomOnFilterChange(page);
        handlers.syncMetadataButton(page);
        handlers.renderLogs(page);
    });
  }

  if (ui.rawModeButton) {
    ui.rawModeButton.addEventListener("click", function() {
        state.rawMode = !state.rawMode;
        forceBottomOnFilterChange(page);
        handlers.renderLogs(page);
    });
  }
}

function bindViewportButtons(page: LogsPage, handlers: EventHandlers) {
  const { ui } = page;
  if (ui.jumpToBottomButton) {
    ui.jumpToBottomButton.addEventListener("click", function() {
        handlers.forceViewportToBottom(page);
        handlers.renderLogs(page);
    });
  }
}

function bindExtendEvents(page: LogsPage, handlers: EventHandlers) {
  const { config, state, ui } = page;
  const fullscreenId = safeStr(config.fullscreenId);
  const fullscreenGroup = safeStr(config.fullscreenGroup);
  if (!fullscreenId || !fullscreenGroup) return;

  function handleFullscreenEvent(event: Event) {
    const detail =
    event instanceof CustomEvent &&
      event.detail &&
      typeof event.detail === "object"
    ? event.detail
    : null;
    if (!detail) return;
    if (safeStr(detail.id) !== fullscreenId) return;
    if (safeStr(detail.group) !== fullscreenGroup) return;

    if (
      event.type === "tbf:fullscreen-open" &&
        state.focusSearchOnFullscreen
    ) {
      state.focusSearchOnFullscreen = false;
      handlers.focusSearchInputAfterFullscreenOpen(page);
      return;
    }

    if (event.type === "tbf:fullscreen-close") {
      state.focusSearchOnFullscreen = false;
      if (ui.searchInput && ui.searchInput.value) {
        ui.searchInput.value = "";
        handlers.renderLogs(page);
      }
    }
  }

  document.addEventListener("tbf:fullscreen-open", handleFullscreenEvent);
  document.addEventListener("tbf:fullscreen-close", handleFullscreenEvent);
}

export function bindLogEvents(page: LogsPage, handlers: EventHandlers) {
  const { ui } = page;
  if (!ui.root) return;

  bindFilterEvents(page, handlers);
  bindLogsSearchEvents(page, handlers);
  bindViewportButtons(page, handlers);
  bindLogsDetailModeButtons(page, handlers);
  bindExtendEvents(page, handlers);
}
