type UploadEntry = {
  file: File;
  path: string;
};

type UploadEmptyToggle = {
  checked?: boolean;
  name?: string;
  value?: string;
};

type UploadRemoteAction = {
  ariaLabel?: string;
  hiddenWhenSelected?: boolean;
  iconSpec?: string;
  id?: string;
  label?: string;
  name?: string;
  value?: string;
};

type UploadRemoteSelection = {
  cropData?: Record<string, number>|null;
  label?: string;
  previewUrl?: string;
};

type UploadFieldOptions = {
  accept?: string;
  aspect?: string;
  crop?: boolean;
  cropFailedMessage?: string;
  cropImageOnlyDescription?: string;
  cropImageOnlyMessage?: string;
  clearIconSpec?: string;
  directory?: boolean;
  directoryOptionIconSpec?: string;
  directoryOptionLabel?: string;
  drop?: boolean;
  dropDirectory?: boolean;
  emptyLabel?: string;
  emptyToggle?: UploadEmptyToggle;
  fileOptionIconSpec?: string;
  fileOptionLabel?: string;
  formatNotAllowedDescription?: string;
  formatNotAllowedMessage?: string;
  formats?: string;
  helperText?: string;
  id?: string;
  lang?: string;
  mixedPicker?: boolean;
  modalDescription?: string;
  modalTitle?: string;
  multiple?: boolean;
  name: string;
  preview?: boolean;
  previewAlt?: string;
  previewShape?: "circle" | "square" | string;
  previewUrl?: string;
  remoteAction?: UploadRemoteAction;
  skipDirs?: string;
  triggerIconSpec?: string;
  triggerLabel?: string;
  useImageLabel?: string;
};

type UploadRootConfig = {
  allowDirectory?: boolean;
  allowDrop?: boolean;
  allowDropDirectory?: boolean;
  allowMixedPicker?: boolean;
  allowMultiple?: boolean;
  aspect?: string;
  canClearCurrentPreview?: boolean;
  crop?: boolean;
  cropFailedMessage?: string;
  cropImageOnlyDescription?: string;
  cropImageOnlyMessage?: string;
  currentPreviewUrl?: string;
  emptyLabel?: string;
  emptyToggleValue?: string;
  formatNotAllowedDescription?: string;
  formatNotAllowedMessage?: string;
  formats?: string;
  modalDescription?: string;
  modalTitle?: string;
  noPreview?: boolean;
  skipDirs?: string;
  useImageLabel?: string;
};

type UploadState = {
  cropData: Record<string, number>|null;
  currentPreviewClearable: boolean;
  currentPreviewUrl: string;
  emptySelected: boolean;
  entries: UploadEntry[];
  file: File | null;
  previewObjectUrl: string;
  previewUrl: string;
  remoteLabel: string;
  remoteSelected: boolean;
};

type UploadFlashApi = {
  error?: (message: unknown, description?: string) => unknown;
  warn?: (message: unknown, description?: string) => unknown;
};

type UploadRuntimeOptions = {
  flash?: UploadFlashApi;
  logging?: Record<string, unknown>;
};

export type {
  UploadEmptyToggle,
  UploadEntry,
  UploadFieldOptions,
  UploadFlashApi,
  UploadRemoteAction,
  UploadRemoteSelection,
  UploadRootConfig,
  UploadRuntimeOptions,
  UploadState,
};
