import { renderCodeWithin } from "#gi2c2fgone4i";
import { openModal } from "#8rm3pzkj3gge";
import { setTextContent } from "#aq4qe9opqpbm";
import { formatTimestamp, safeStr } from "./utils.js";
import type { LogsPage } from "./types.js";
import { refreshLogDom } from "./view_state.js";
import { frontendDataAttr } from "#5vbaqj4pirp3";

export { bindLogEvents } from "./detail/events.js";
export { loadInitialLogs, loadOlderLogs } from "./detail/load.js";

function prettyJson(value: unknown) {
  if (!value || typeof value !== "object") return "";

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function refreshDetailCodeBlocks(modal: HTMLElement) {
  for (const target of [
      modal.querySelector("[data-log-detail-meta]"),
      modal.querySelector("[data-log-detail-raw]"),
  ]) {
    const host = target ? target.closest("code-block") : null;
    if (host) {
      host.removeAttribute("data-code-rendered");
      host.removeAttribute(frontendDataAttr("code-rendered"));
    }
  }

  void renderCodeWithin(modal).catch (() => {});
}

export function openLogDetail(
  page: LogsPage,
  logKey: string,
  trigger: Element | null,
) {
  const ui = refreshLogDom(page);
  const item = page.state.logDetailsByKey
  ? page.state.logDetailsByKey[logKey]
  : null;
  const entry =
  item && item.entry && typeof item.entry === "object" ? item.entry : null;
  const modal = ui.detailModal;
  if (!entry || !modal) return;

  const metadata =
  entry.metadata &&
    typeof entry.metadata === "object" &&
    !Array.isArray(entry.metadata)
  ? entry.metadata
  : null;
  const metaText = prettyJson(metadata);
  const metaWrap = ui.detailMetaWrapEl;

  setTextContent(ui.detailTimestampEl, formatTimestamp(entry.recorded_at));
  setTextContent(ui.detailLevelEl, safeStr(entry.level).toUpperCase());
  setTextContent(ui.detailGroupEl, safeStr(entry.group) || "app.log");
  setTextContent(
    ui.detailSourceEl,
    safeStr(entry.origin && entry.origin.source) ||
      safeStr(entry.source) ||
      "process",
  );
  setTextContent(
    ui.detailMessageEl,
    entry.message == null ? "" : String(entry.message),
  );
  setTextContent(ui.detailMetaEl, metaText);
  setTextContent(ui.detailRawEl, prettyJson(entry));

  if (metaWrap) metaWrap.hidden = !metaText;
  refreshDetailCodeBlocks(modal);

  openModal(modal, trigger instanceof HTMLElement ? trigger : null);
}

export function toggleMarkedLog(
  page: LogsPage,
  logKey: string,
  renderLogs: (page: LogsPage) => void,
) {
  const key = safeStr(logKey);
  if (!key) return;

  const marked =
  page.state.markedLogKeys && typeof page.state.markedLogKeys === "object"
  ? { ...page.state.markedLogKeys }
  : {};

  if (marked[key] === true) {
    delete marked[key];
  } else {
    marked[key] = true;
  }

  page.state.markedLogKeys = marked;
  renderLogs(page);
}
