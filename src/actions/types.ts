import type { FlashType } from "#33o6e7mug9pg";
import type { ProgressHandle } from "#hmj29rrpgtsh";

type ActionJson = {
  data?: unknown;
  details?: string;
  message?: string;
  noop?: boolean;
  ok?: boolean;
  redirect?: string;
  reload?: boolean;
  status?: number;
  status_code?: string;
  tab?: unknown;
};

type ActionAdapters = {
  flash?: {
    error?: (message: unknown, description?: string) => unknown;
    info?: (message: unknown, description?: string) => unknown;
    success?: (message: unknown, description?: string) => unknown;
    warn?: (message: unknown, description?: string) => unknown;
    confirmElement?: (source: Element | null, fallback?: Element | null) => Promise<boolean>;
    computeFlashDurationMs?: (message: unknown, description?: unknown) => number;
  };
  i18n?: (key: string, fallback: string) => string;
  navigation?: {
    navigate?: (url: string) => Promise<unknown>|unknown;
    shouldFullReload?: (trigger: HTMLElement, url: string) => boolean;
  };
  progress?: ProgressHandle;
  reload?: {
    reload?: (options?: ReloadAdapterOptions) => Promise<unknown>|unknown;
  };
};

type ReloadAdapterOptions = {
  preserveState?: boolean;
  reason?: string;
};

type ActionRequestUi = {
  busyScope?: unknown;
  flashErrorOnly?: boolean;
  flash_error_only?: boolean;
  ignoreResponseAction?: boolean;
  onAbort?: (json: ActionJson) => unknown;
  onFail?: (json: ActionJson) => unknown;
  onNoop?: (json: ActionJson) => unknown;
  onOk?: (json: ActionJson) => unknown;
  onXhr?: (xhr: XMLHttpRequest) => void;
  on_abort?: (json: ActionJson) => unknown;
  on_fail?: (json: ActionJson) => unknown;
  on_noop?: (json: ActionJson) => unknown;
  on_ok?: (json: ActionJson) => unknown;
  on_xhr?: (xhr: XMLHttpRequest) => void;
  silent?: boolean;
  steps?: unknown;
};

type SubmitActionFormOptions = {
  adapters?: ActionAdapters;
  beforeSubmit?: (form: HTMLFormElement, submitter: HTMLElement | null) => void;
  closeModal?: boolean;
  confirm?: boolean;
  ignoreResponseAction?: boolean;
  lifecycle?: boolean;
  onComplete?: (ok: boolean, json: ActionJson) => void;
  request?: (
    form: HTMLFormElement,
    submitter: HTMLElement | null,
  ) => Promise<ActionJson>|ActionJson;
  success?: "soft-reload";
  successTab?: string;
  ui?: ActionRequestUi;
};

type SubmitActionButtonOptions = {
  adapters?: ActionAdapters;
  body?: BodyInit | Record<string, unknown>|null;
  closeModal?: boolean;
  confirm?: boolean;
  ignoreResponseAction?: boolean;
  keepDisabled?: (json: ActionJson | null) => boolean;
  method?: string;
  request?: () => Promise<ActionJson>|ActionJson;
  success?: "soft-reload";
  successConfetti?: boolean;
  successTab?: string;
  ui?: ActionRequestUi;
  url?: string;
};

type ActionFlashMeta = {
  description: string;
  message: string;
  type: FlashType | "noop";
};

export type {
  ActionAdapters,
  ActionFlashMeta,
  ActionJson,
  ActionRequestUi,
  ReloadAdapterOptions,
  SubmitActionButtonOptions,
  SubmitActionFormOptions,
};
