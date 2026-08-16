import { frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";

const SOURCE_ROOT_SELECTOR = frontendDataSelector("source-language-root");
const SOURCE_ROW_SELECTOR = frontendDataSelector("source-language-row");
const SOURCE_LIST_ITEM_SELECTOR = frontendDataSelector("source-language-list-item");
const SOURCE_PANEL_SELECTOR = frontendDataSelector("source-language-panel-bucket");
const SOURCE_PERCENT_SELECTOR = frontendDataSelector("source-language-percent");
const SOURCE_PROGRESS_SELECTOR = frontendDataSelector("source-language-progress");
const SOURCE_OVERVIEW_SEGMENT_SELECTOR =
frontendDataSelector("source-language-overview-segment");
const SOURCE_BUCKET_TAB_SELECTOR = frontendDataSelector("source-language-bucket-tab");
const SOURCE_BUCKET_TABS_ROOT_SELECTOR =
frontendDataSelector("source-language-bucket-tabs-root");
const SOURCE_RESET_SELECTOR = frontendDataSelector("source-language-reset");
const SOURCE_DETECTED_SELECTOR = frontendDataSelector("source-language-detected-count");
const SOURCE_SUMMARY_BYTES_SELECTOR =
frontendDataSelector("source-language-summary-total-bytes");
const SOURCE_SUMMARY_LINES_SELECTOR =
frontendDataSelector("source-language-summary-total-lines");
const SOURCE_EMPTY_SELECTOR = frontendDataSelector("source-language-empty-state");
const SOURCE_FILE_TREE_ROOT_SELECTOR =
frontendDataSelector("source-language-file-tree-root");
const SOURCE_FILE_TREE_CONFIG_ATTR =
frontendDataAttr("source-language-file-tree-config");

export {
  SOURCE_BUCKET_TAB_SELECTOR,
  SOURCE_BUCKET_TABS_ROOT_SELECTOR,
  SOURCE_DETECTED_SELECTOR,
  SOURCE_EMPTY_SELECTOR,
  SOURCE_FILE_TREE_CONFIG_ATTR,
  SOURCE_FILE_TREE_ROOT_SELECTOR,
  SOURCE_LIST_ITEM_SELECTOR,
  SOURCE_OVERVIEW_SEGMENT_SELECTOR,
  SOURCE_PANEL_SELECTOR,
  SOURCE_PERCENT_SELECTOR,
  SOURCE_PROGRESS_SELECTOR,
  SOURCE_RESET_SELECTOR,
  SOURCE_ROOT_SELECTOR,
  SOURCE_ROW_SELECTOR,
  SOURCE_SUMMARY_BYTES_SELECTOR,
  SOURCE_SUMMARY_LINES_SELECTOR,
};
