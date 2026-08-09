import { queryAll } from "#er0dlx1gtbzh";
import { text } from "#kv9urtb9dbq5";
import { deriveColorFromIcon, normalizeColor } from "./color.js";
import {
  SOURCE_BUCKET_TAB_SELECTOR,
  SOURCE_BUCKET_TABS_ROOT_SELECTOR,
  SOURCE_LIST_ITEM_SELECTOR,
  SOURCE_OVERVIEW_SEGMENT_SELECTOR,
  SOURCE_PANEL_SELECTOR,
  SOURCE_PERCENT_SELECTOR,
  SOURCE_PROGRESS_SELECTOR,
  SOURCE_ROW_SELECTOR,
} from "./selectors.js";
import type { SourceLanguageItem } from "./types.js";

function overviewSegmentKey(panelBucket: string, languageId: string) {
  return `${text(panelBucket, "everything")}:${text(languageId)}`;
}

function parseOverviewSegments(root: HTMLElement) {
  const segments = new Map<string, HTMLElement>();
  queryAll<HTMLElement>(root, SOURCE_OVERVIEW_SEGMENT_SELECTOR).forEach((segment) => {
    const languageId = text(segment.getAttribute("data-tbf-source-language-id"));
    const panelBucket = text(
      segment
        .closest(SOURCE_PANEL_SELECTOR)
        ?.getAttribute("data-tbf-source-language-panel-bucket"),
      "everything",
    );
    if (languageId) segments.set(overviewSegmentKey(panelBucket, languageId), segment);
  });
  return segments;
}

function parseSourceLanguageRow(
  row: HTMLElement,
  index: number,
  overviewSegments: Map<string, HTMLElement>,
): SourceLanguageItem {
  const listItemEl = row.closest<HTMLElement>(SOURCE_LIST_ITEM_SELECTOR) || row;
  const panelEl = row.closest<HTMLElement>(SOURCE_PANEL_SELECTOR);
  const percentEl = row.querySelector<HTMLElement>(SOURCE_PERCENT_SELECTOR);
  const id = text(row.getAttribute("data-tbf-source-language-id"), `language-${index}`);
  const panelBucket = text(
    panelEl?.getAttribute("data-tbf-source-language-panel-bucket"),
    "everything",
  );
  if (percentEl) percentEl.dataset.value = String(Number(percentEl.textContent) || 0);
  return {
    row,
    listItemEl,
    panelBucket,
    id,
    bucket: text(row.getAttribute("data-tbf-source-language-bucket"), "supporting"),
    color: deriveColorFromIcon(row) ||
      normalizeColor(row.getAttribute("data-tbf-source-language-color")),
    bytes: Number(row.getAttribute("data-tbf-source-language-bytes")) || 0,
    lines: Number(row.getAttribute("data-tbf-source-language-lines")) || 0,
    percentEl,
    progressEl: row.querySelector<HTMLElement>(SOURCE_PROGRESS_SELECTOR),
    overviewSegmentEl:
      overviewSegments.get(overviewSegmentKey(panelBucket, id)) || null,
  };
}

function parseSourceLanguageItems(root: HTMLElement) {
  const overviewSegments = parseOverviewSegments(root);
  return queryAll<HTMLElement>(root, SOURCE_ROW_SELECTOR).map((row, index) =>
    parseSourceLanguageRow(row, index, overviewSegments),
  );
}

function getActiveSourceLanguageBucket(root: HTMLElement) {
  const tabsRoot = root.querySelector<HTMLElement>(SOURCE_BUCKET_TABS_ROOT_SELECTOR);
  const activeTab = tabsRoot?.querySelector<HTMLElement>(
    `[data-tab-button][aria-selected="true"]${SOURCE_BUCKET_TAB_SELECTOR}`,
  );
  const fallbackTab = root.querySelector<HTMLElement>(SOURCE_BUCKET_TAB_SELECTOR);
  return text(
    (activeTab || fallbackTab)?.getAttribute("data-tbf-source-language-bucket-tab"),
    "everything",
  );
}

export { getActiveSourceLanguageBucket, parseSourceLanguageItems };
