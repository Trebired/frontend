import { button, card } from "#6hfutrhvm6x6";
import {
  formatCompactBytes,
  formatCount,
  formatDateTime,
  safeNumber,
} from "#k0q2s2kidqtq";
import { text, translate } from "#kv9urtb9dbq5";
import {
  buildSourceLanguageScanModel,
  type SourceLanguageScanModel,
} from "./model.js";
import { source_language_tabs_content } from "./tabs.js";
import type { SourceLanguageVisualizerProps } from "#2w72xmq6rvza";

function headerCard(model: SourceLanguageScanModel) {
  return card({
    className: "inline-row gap-sm",
    children: (
      <>
        <h3>{translate(model.lang, "languages")}</h3>
        {button({
          type: "button",
          "data-tbf-source-language-reset": "",
          hidden: true,
          className: "text-muted text-sm right",
          children: <>{translate(model.lang, "resetFilter")}</>,
        })}
        <span
          className="text-muted text-sm no-shrink"
          data-tbf-source-language-detected-count=""
        >
          {translate(model.lang, "detected", {
            count: formatCount(
              model.scan.language_count || model.visualLanguages.length,
              model.locale,
            ),
          })}
        </span>
      </>
    ),
  });
}

function sourceLanguageProgressStateJson(model: SourceLanguageScanModel) {
  return JSON.stringify({
    counted_files: model.scanCountedFiles,
    message: model.scanProgressMessage,
    progress_percent: Number.isFinite(model.scanProgressPercent)
      ? model.scanProgressPercent
      : null,
    status: model.scanStatus,
    total_files: model.scanTotalFiles,
  }).replace(/</g, "\\u003c");
}

function progressFillStyle(model: SourceLanguageScanModel) {
  return Number.isFinite(model.scanProgressPercent)
    ? { width: `${model.scanProgressPercent}%` }
    : undefined;
}

function source_language_scan_progress_card(model: SourceLanguageScanModel) {
  return (
    <div
      id="repository_scan_pending_content"
      className={
        model.hasReadySnapshot
          ? "column gap-sm"
          : "column center ver-center gap-sm min-height-md"
      }
      hidden={!model.scanPending && !model.scanFailed}
    >
      <div className="column center gap-xs">
        <span id="repository_scan_message" className="text-sm text-muted">
          {model.scanProgressMessage}
        </span>
        <span
          id="repository_scan_progress_label"
          className="text-xs text-muted"
          data-progress-label=""
        >
          {model.scanProgressLabel}
        </span>
      </div>
      <div id="repository_scan_progress" className="progress progress-scan width-max" data-progress="">
        <div data-progress-mount="">
          <span data-progress-fill="" style={progressFillStyle(model)} />
        </div>
      </div>
    </div>
  );
}

function summaryRows(model: SourceLanguageScanModel) {
  const scan = model.scan;
  return (
    <>
      <div className="inline-row gap-xs lh-xs">
        <strong className="text-muted lh-xs">{translate(model.lang, "totalSizeLabel")}</strong>
        <span
          className="text-break lh-xs"
          data-tbf-source-language-summary-total-bytes={String(safeNumber(scan.total_bytes))}
        >
          {formatCompactBytes(scan.total_bytes, model.locale)}
        </span>
      </div>
      <div className="inline-row gap-xs lh-xs">
        <strong className="text-muted lh-xs">{translate(model.lang, "files")}:</strong>
        <span className="text-break lh-xs">{formatCount(scan.file_count, model.locale)}</span>
      </div>
      <div className="inline-row gap-xs lh-xs">
        <strong className="text-muted lh-xs">{translate(model.lang, "codeLines")}</strong>
        <span
          className="text-break lh-xs"
          data-tbf-source-language-summary-total-lines={String(
            safeNumber(scan.total_lines && scan.total_lines.code),
          )}
        >
          {formatCount(scan.total_lines && scan.total_lines.code, model.locale)}
        </span>
      </div>
    </>
  );
}

function scannedAtRow(model: SourceLanguageScanModel) {
  if (!model.scannedAt) return null;
  return (
    <div className="inline-row gap-xs lh-xs">
      <strong className="text-muted lh-xs">{translate(model.lang, "scanned")}</strong>
      <span className="text-break lh-xs">
        {formatDateTime(model.scannedAt, model.locale)}
      </span>
    </div>
  );
}

function summaryCard(model: SourceLanguageScanModel) {
  return card({
    className: "column gap-xs",
    children: (
      <>
        {summaryRows(model)}
        {scannedAtRow(model)}
      </>
    ),
  });
}

function readyContent(model: SourceLanguageScanModel) {
  return (
    <div
      id="repository_scan_ready_content"
      className="column gap-sm"
      data-tbf-source-language-ready-state={model.hasReadySnapshot ? "available" : "empty"}
      hidden={model.scanFailed || model.scanPending}
    >
      {!model.scanPending && !model.scanFailed ? (
        <>
          {summaryCard(model)}
          {source_language_tabs_content(model)}
        </>
      ) : null}
    </div>
  );
}

function source_language_visualizer(props: SourceLanguageVisualizerProps) {
  const model = buildSourceLanguageScanModel(props);
  const repositoryBase = text(model.repository.url);
  const repositoryScanVisualizerUrl = repositoryBase
    ? `${repositoryBase}/scan/visualizer`
    : "";
  return card({
    id: "repository_visualizer_card",
    "data-repository-scan-visualizer-url": repositoryScanVisualizerUrl,
    "data-repository-visualizer-card": "",
    "data-tbf-source-language-root": "",
    className: "column gap-sm",
    children: (
      <>
        {headerCard(model)}
        {readyContent(model)}
      </>
    ),
  });
}

const SourceLanguageVisualizer = source_language_visualizer;

export {
  SourceLanguageVisualizer,
  sourceLanguageProgressStateJson,
  source_language_scan_progress_card,
  source_language_visualizer,
};
export type { SourceLanguageVisualizerProps };
