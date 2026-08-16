import { queryAll } from "#er0dlx1gtbzh";
import { formatCompactBytes, formatCount } from "#k0q2s2kidqtq";
import { text, translate } from "#kv9urtb9dbq5";
import { animateNumber, setAnimatedText } from "./animation.js";
import {
  SOURCE_DETECTED_SELECTOR,
  SOURCE_EMPTY_SELECTOR,
  SOURCE_RESET_SELECTOR,
  SOURCE_SUMMARY_BYTES_SELECTOR,
  SOURCE_SUMMARY_LINES_SELECTOR,
} from "./selectors.js";
import type { SourceLanguageItem, SourceLanguageRuntimeOptions } from "./types.js";
import { frontendDataAttr } from "#5vbaqj4pirp3";

function panelStats(items: SourceLanguageItem[], excluded: Set<string>) {
  const includedItems = items.filter((item) => !excluded.has(item.id));
  return {
    activeDetected: includedItems.length,
    includedBytes: includedItems.reduce((total, item) => total + item.bytes, 0),
    includedLines: includedItems.reduce((total, item) => total + item.lines, 0),
    totalDetected: items.length,
  };
}

function renderStatsByPanel(items: SourceLanguageItem[], excluded: Set<string>, activeBucket: string) {
  const byPanel = {
    everything: panelStats(items.filter((item) => item.panelBucket === "everything"), excluded),
    repository: panelStats(items.filter((item) => item.panelBucket === "repository"), excluded),
    supporting: panelStats(items.filter((item) => item.panelBucket === "supporting"), excluded),
  };
  return {
    active: byPanel[activeBucket as keyof typeof byPanel] || byPanel.everything,
    byPanel,
  };
}

function applySourceLanguageColor(item: SourceLanguageItem) {
  if (!item.color) return;
  if (item.progressEl) item.progressEl.style.background = item.color;
  if (item.overviewSegmentEl) item.overviewSegmentEl.style.background = item.color;
}

function setOverviewSegmentState(item: SourceLanguageItem, isIncluded: boolean, nextPercent: number) {
  if (!item.overviewSegmentEl) return;
  applySourceLanguageColor(item);
  item.overviewSegmentEl.style.width = isIncluded
  ? `${Math.max(0, Math.min(100, nextPercent))}%`
  : "0%";
  item.overviewSegmentEl.hidden = !isIncluded || nextPercent <= 0;
}

function renderSourceLanguageItem(
  item: SourceLanguageItem,
  stats: ReturnType<typeof panelStats>,
  excluded: Set<string>,
  options: SourceLanguageRuntimeOptions,
) {
  const isIncluded = !excluded.has(item.id);
  const nextPercent =
  isIncluded && stats.includedBytes > 0
  ? Number(((item.bytes / stats.includedBytes) * 100).toFixed(1))
  : 0;
  item.row.hidden = false;
  if (item.listItemEl !== item.row) item.listItemEl.hidden = false;
  item.row.setAttribute("aria-pressed", isIncluded ? "true" : "false");
  item.row.setAttribute(frontendDataAttr("source-language-included"), isIncluded ? "true" : "false");
  item.row.setAttribute("title", rowTitle(isIncluded, options.lang));
  if (isIncluded) item.row.removeAttribute("data-card-excluded");
  else item.row.setAttribute("data-card-excluded", "true");
  animateNumber(item.percentEl, nextPercent, (value) => Number(value || 0).toFixed(1), 1, options.prefersReducedMotion);
  if (item.progressEl) {
    applySourceLanguageColor(item);
    item.progressEl.style.width = `${Math.max(0, Math.min(100, nextPercent))}%`;
  }
  setOverviewSegmentState(item, isIncluded, nextPercent);
}

function rowTitle(isIncluded: boolean, lang?: string) {
  return isIncluded
  ? translate(lang, "languageExcludeTooltip")
  : translate(lang, "languageIncludeTooltip");
}

function renderSourceLanguageTotals(
  root: HTMLElement,
  stats: ReturnType<typeof panelStats>,
  options: SourceLanguageRuntimeOptions,
) {
  const locale = options.locale || options.lang;
  const detectedEl = root.querySelector<HTMLElement>(SOURCE_DETECTED_SELECTOR);
  const bytesEl = root.querySelector<HTMLElement>(SOURCE_SUMMARY_BYTES_SELECTOR);
  const linesEl = root.querySelector<HTMLElement>(SOURCE_SUMMARY_LINES_SELECTOR);
  if (detectedEl) {
    setAnimatedText(detectedEl, detectedText(stats, options.lang, locale), options.prefersReducedMotion);
  }
  animateNumber(bytesEl, stats.includedBytes, (value) => formatCompactBytes(value, locale), 0, options.prefersReducedMotion);
  animateNumber(linesEl, stats.includedLines, (value) => formatCount(value, locale), 0, options.prefersReducedMotion);
}

function detectedText(stats: ReturnType<typeof panelStats>, lang?: string, locale?: string) {
  if (stats.activeDetected === stats.totalDetected) {
    return translate(lang, "detected", { count: formatCount(stats.totalDetected, locale) });
  }
  return translate(lang, "detectedSubset", {
      active: formatCount(stats.activeDetected, locale),
      total: formatCount(stats.totalDetected, locale),
  });
}

function renderSourceLanguageControls(
  root: HTMLElement,
  stats: ReturnType<typeof panelStats>,
  excluded: Set<string>,
  activeBucket: string,
  options: SourceLanguageRuntimeOptions,
) {
  const resetButton = root.querySelector<HTMLButtonElement>(SOURCE_RESET_SELECTOR);
  if (resetButton) {
    resetButton.hidden = excluded.size === 0;
    resetButton.disabled = excluded.size === 0;
  }
  queryAll<HTMLElement>(root, SOURCE_EMPTY_SELECTOR).forEach((emptyEl) => {
      const bucket = text(emptyEl.getAttribute(frontendDataAttr("source-language-panel-bucket")), "everything");
      const visible = bucket === activeBucket && stats.totalDetected === 0;
      emptyEl.hidden = !visible;
      if (visible) emptyEl.textContent = emptyStateText(activeBucket, options.lang);
  });
}

function emptyStateText(activeBucket: string, lang?: string) {
  if (activeBucket === "repository") return translate(lang, "noCodeFilesInTab");
  if (activeBucket === "supporting") return translate(lang, "noSupportingFilesInTab");
  return translate(lang, "noLanguagesInTab");
}

function seedSourceLanguageTotals(root: HTMLElement) {
  const bytesEl = root.querySelector<HTMLElement>(SOURCE_SUMMARY_BYTES_SELECTOR);
  const linesEl = root.querySelector<HTMLElement>(SOURCE_SUMMARY_LINES_SELECTOR);
  if (bytesEl) bytesEl.dataset.value = String(Number(bytesEl.getAttribute(frontendDataAttr("source-language-summary-total-bytes"))) || 0);
  if (linesEl) linesEl.dataset.value = String(Number(linesEl.getAttribute(frontendDataAttr("source-language-summary-total-lines"))) || 0);
}

function renderSourceLanguageState(
  root: HTMLElement,
  items: SourceLanguageItem[],
  excluded: Set<string>,
  activeBucket: string,
  options: SourceLanguageRuntimeOptions,
) {
  const stats = renderStatsByPanel(items, excluded, activeBucket);
  items.forEach((item) => {
      renderSourceLanguageItem(item, stats.byPanel[item.panelBucket as keyof typeof stats.byPanel] || stats.active, excluded, options);
  });
  renderSourceLanguageTotals(root, stats.active, options);
  renderSourceLanguageControls(root, stats.active, excluded, activeBucket, options);
}

export { renderSourceLanguageState, seedSourceLanguageTotals };
