import {
  formatCount,
  safeNumber,
} from "#k0q2s2kidqtq";
import { normalizedLang, text, translate } from "#kv9urtb9dbq5";
import type { SourceLanguageBucket, SourceLanguageVisualizerProps } from "#2w72xmq6rvza";

const REPOSITORY_LANGUAGE_IDS = new Set([
    "javascript",
    "typescript",
    "jsx",
    "tsx",
    "vue",
    "svelte",
    "ejs",
    "pug",
    "handlebars",
    "html",
    "css",
    "scss",
    "sass",
    "less",
    "stylus",
    "php",
    "python",
    "ruby",
    "go",
    "java",
    "kotlin",
    "swift",
    "c",
    "cpp",
    "csharp",
    "rust",
    "dart",
    "shell",
    "sql",
    "graphql",
]);

const SUPPORTING_LANGUAGE_IDS = new Set([
    "json",
    "jsonc",
    "yaml",
    "toml",
    "ini",
    "xml",
    "svg",
    "markdown",
    "text",
    "dotenv",
    "robots-txt",
    "sitemap",
    "sitemap-xml",
    "csv",
    "tsv",
    "dockerfile",
    "gitignore",
    "git-ignore",
    "gitattributes",
    "git-attributes",
    "editorconfig",
    "ignore-list",
    "properties",
]);

function formatScanProgressLabel(
  percent: unknown,
  countedFiles: unknown,
  totalFiles: unknown,
  lang?: string,
  locale?: string,
) {
  const rawPercent = Number(percent);
  const counted = Math.max(0, safeNumber(countedFiles));
  const total = Math.max(0, safeNumber(totalFiles));
  if (Number.isFinite(rawPercent)) return `${Math.round(rawPercent)}%`;
  if (total > 0) {
    return `${formatCount(counted, locale || lang)} / ${formatCount(total, locale || lang)} ${translate(lang, "files").toLowerCase()}`;
  }
  if (counted > 0) {
    return `${formatCount(counted, locale || lang)} ${translate(lang, "files").toLowerCase()}`;
  }
  return "";
}

function classifySourceLanguageBucket(language: any): SourceLanguageBucket {
  const item = language && typeof language === "object" ? language : {};
  const id = text(item.id).toLowerCase();
  const type = text(item.type).toLowerCase();
  if (REPOSITORY_LANGUAGE_IDS.has(id)) return "repository";
  if (SUPPORTING_LANGUAGE_IDS.has(id)) return "supporting";
  if (type === "programming") return "repository";
  if (type === "markup" && !SUPPORTING_LANGUAGE_IDS.has(id)) return "repository";
  if (type === "data" || type === "prose") return "supporting";
  return "supporting";
}

function translatedScanMessage(input: unknown, lang?: string) {
  const key = text(input);
  if (!key) return "";
  const normalized = key
  .replace(/^repository-content-scan-failed$/u, "repositoryContentScanFailed")
  .replace(/^repository-language-scan-complete$/u, "repositoryLanguageScanComplete")
  .replace(/^repository-language-scan-counting$/u, "repositoryLanguageScanCounting")
  .replace(/^repository-language-scan-failed$/u, "repositoryLanguageScanFailed")
  .replace(/^repository-language-scan-queued$/u, "repositoryLanguageScanQueued")
  .replace(/^repository-language-scan-saving$/u, "repositoryLanguageScanSaving");
  const translated = translate(lang, normalized);
  return translated === normalized ? "" : translated;
}

function scanMessage(scan: any, scanStatus: string, scanFailed: boolean, lang?: string) {
  const keyedMessage = translatedScanMessage(scan.message, lang);
  if (keyedMessage) return keyedMessage;
  if (scanStatus === "queued") return translate(lang, "scanQueued");
  if (scanStatus === "counting") return translate(lang, "scanCounting");
  if (scanStatus === "scanning") return translate(lang, "scanAnalyzing");
  if (scanStatus === "saving") return translate(lang, "scanSaving");
  if (scanFailed) {
    return translatedScanMessage(scan.error && scan.error.message, lang) ||
      translate(lang, "scanFailed");
  }
  return translate(lang, "scanComplete");
}

function normalizeVisualLanguages(scannedLanguages: any[]) {
  return scannedLanguages.map((language: any, index: number) => {
      const rawId = text(language && (language.id || language.name), `language-${index}`);
      return {
        ...(language && typeof language === "object" ? language : {}),
        viz_id: rawId || `language-${index}`,
        viz_bucket: classifySourceLanguageBucket(language),
      };
  });
}

function readScanSource(props: SourceLanguageVisualizerProps) {
  const repository =
  props.repository && typeof props.repository === "object" ? props.repository : {};
  const content =
  repository.content && typeof repository.content === "object" ? repository.content : {};
  const scan = content.scan && typeof content.scan === "object" ? content.scan : {};
  return { repository, scan };
}

function readScanProgress(scan: any, scannedLanguages: any[]) {
  const scanStatus = text(scan.status, scannedLanguages.length ? "ready" : "");
  const rawPercent =
  scan.progress_percent == null ? NaN : Number(scan.progress_percent);
  return {
    scanStatus,
    scanPending: ["queued", "counting", "scanning", "saving"].includes(scanStatus),
    scanFailed: scanStatus === "failed",
    scanProgressPercent: Number.isFinite(rawPercent)
    ? Math.max(0, Math.min(100, rawPercent))
    : NaN,
    scanCountedFiles: safeNumber(scan.counted_files),
    scanTotalFiles: safeNumber(scan.total_files),
  };
}

function hasReadyLanguageSnapshot(scan: any, scannedLanguages: any[], scannedAt: string) {
  return Boolean(
    scannedLanguages.length ||
      safeNumber(scan.file_count) ||
      safeNumber(scan.total_bytes) ||
      safeNumber(scan.total_lines && scan.total_lines.code) ||
      scannedAt,
  );
}

function buildSourceLanguageScanModel(props: SourceLanguageVisualizerProps) {
  const lang = normalizedLang(props.lang);
  const locale = text(props.locale, lang);
  const { repository, scan } = readScanSource(props);
  const scannedLanguages = Array.isArray(scan.languages) ? scan.languages : [];
  const progress = readScanProgress(scan, scannedLanguages);
  const scannedAt = text(scan.scanned_at);
  const visualLanguages = normalizeVisualLanguages(scannedLanguages);
  return {
    hasReadySnapshot: hasReadyLanguageSnapshot(scan, scannedLanguages, scannedAt),
    lang,
    locale,
    repository,
    scan,
    scanProgressLabel: formatScanProgressLabel(
      progress.scanProgressPercent,
      progress.scanCountedFiles,
      progress.scanTotalFiles,
      lang,
      locale,
    ),
    scanProgressMessage: scanMessage(scan, progress.scanStatus, progress.scanFailed, lang),
    scannedAt,
    visualLanguages,
    ...progress,
  };
}

type SourceLanguageScanModel = ReturnType<typeof buildSourceLanguageScanModel>;

export { buildSourceLanguageScanModel, classifySourceLanguageBucket };
export type { SourceLanguageScanModel };
