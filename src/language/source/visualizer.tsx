import {
  InlineRow,
  Stack,
  Text,
  button,
  card,
  primitiveInlineRowClassName,
  primitiveTextClassName,
} from "#hzrmwbvgt2ax";
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
import { frontendDataAttr, frontendDataAttrs } from "#5vbaqj4pirp3";

function headerCard(model: SourceLanguageScanModel) {
  return card({
      className: primitiveInlineRowClassName({ gap: "sm" }),
      layout: "none",
      children: (
        <>
        <h3>{translate(model.lang, "languages")}</h3>
        {button({
              type: "button",
              [frontendDataAttr("source-language-reset")]: "",
              hidden: true,
              className: primitiveTextClassName({ muted: true, right: true, size: "sm" }),
              children: <>{translate(model.lang, "resetFilter")}</>,
        })}
        <Text
        className="no-shrink"
        muted
        size="sm"
        {...frontendDataAttrs({ "source-language-detected-count": "" })}
        >
        {translate(model.lang, "detected", {
              count: formatCount(
                model.scan.language_count || model.visualLanguages.length,
                model.locale,
              ),
        })}
        </Text>
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
    <Stack
    id="repository_scan_pending_content"
    center={!model.hasReadySnapshot}
    className={model.hasReadySnapshot ? "" : "min-height-md"}
    gap="sm"
    hidden={!model.scanPending && !model.scanFailed}
    verticalCenter={!model.hasReadySnapshot}
    >
    <Stack center gap="xs">
    <Text id="repository_scan_message" muted size="sm">
    {model.scanProgressMessage}
    </Text>
    <Text
    id="repository_scan_progress_label"
    data-progress-label=""
    muted
    size="xs"
    >
    {model.scanProgressLabel}
    </Text>
    </Stack>
    <div id="repository_scan_progress" className="progress progress-scan width-max" data-progress="">
    <div data-progress-mount="">
    <span data-progress-fill="" style={progressFillStyle(model)} />
    </div>
    </div>
    </Stack>
  );
}

function sourceLanguageVisualizerRows(model: SourceLanguageScanModel) {
  const scan = model.scan;
  return (
    <>
    <InlineRow className="lh-xs" gap="xs">
    <Text as="strong" className="lh-xs" muted>{translate(model.lang, "totalSizeLabel")}</Text>
    <Text
    breakWord
    className="lh-xs"
    {...frontendDataAttrs({ "source-language-summary-total-bytes": String(safeNumber(scan.total_bytes)) })}
    >
    {formatCompactBytes(scan.total_bytes, model.locale)}
    </Text>
    </InlineRow>
    <InlineRow className="lh-xs" gap="xs">
    <Text as="strong" className="lh-xs" muted>{translate(model.lang, "files")}:</Text>
    <Text breakWord className="lh-xs">{formatCount(scan.file_count, model.locale)}</Text>
    </InlineRow>
    <InlineRow className="lh-xs" gap="xs">
    <Text as="strong" className="lh-xs" muted>{translate(model.lang, "codeLines")}</Text>
    <Text
    breakWord
    className="lh-xs"
    {...frontendDataAttrs({
          "source-language-summary-total-lines": String(safeNumber(scan.total_lines && scan.total_lines.code)),
    })}
    >
    {formatCount(scan.total_lines && scan.total_lines.code, model.locale)}
    </Text>
    </InlineRow>
    </>
  );
}

function scannedAtRow(model: SourceLanguageScanModel) {
  if (!model.scannedAt) return null;
  return (
    <InlineRow className="lh-xs" gap="xs">
    <Text as="strong" className="lh-xs" muted>{translate(model.lang, "scanned")}</Text>
    <Text breakWord className="lh-xs">
    {formatDateTime(model.scannedAt, model.locale)}
    </Text>
    </InlineRow>
  );
}

function summaryCard(model: SourceLanguageScanModel) {
  return card({
      gap: "xs",
      children: (
        <>
        {sourceLanguageVisualizerRows(model)}
        {scannedAtRow(model)}
        </>
      ),
  });
}

function readyContent(model: SourceLanguageScanModel) {
  return (
    <Stack
    id="repository_scan_ready_content"
    gap="sm"
    {...frontendDataAttrs({ "source-language-ready-state": model.hasReadySnapshot ? "available" : "empty" })}
    hidden={model.scanFailed || model.scanPending}
    >
    {!model.scanPending && !model.scanFailed ? (
        <>
        {summaryCard(model)}
        {source_language_tabs_content(model)}
        </>
      ) : null}
    </Stack>
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
      [frontendDataAttr("source-language-root")]: "",
      gap: "sm",
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
