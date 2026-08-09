type SourceLanguageRuntimeOptions = {
  force?: boolean;
  lang?: string;
  locale?: string;
  openFile?: (relPath: string) => unknown;
  prefersReducedMotion?: boolean;
  repositoryBase?: string;
  tree?: any[];
};

type SourceLanguageItem = {
  bucket: string;
  bytes: number;
  color: string;
  id: string;
  lines: number;
  listItemEl: HTMLElement;
  overviewSegmentEl: HTMLElement | null;
  panelBucket: string;
  percentEl: HTMLElement | null;
  progressEl: HTMLElement | null;
  row: HTMLElement;
};

type SourceLanguageController = {
  destroy: () => void;
  render: () => void;
  root: HTMLElement;
};

export type {
  SourceLanguageController,
  SourceLanguageItem,
  SourceLanguageRuntimeOptions,
};
