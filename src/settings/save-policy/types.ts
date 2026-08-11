type SavePolicyLabels = {
  blockedFormDescription?: string;
  blockedFormMessage?: string;
  unsavedDescription?: string;
  unsavedMessage?: string;
};

type SavePolicyLogger = {
  info?: (scope: string, message: string, meta?: Record<string, unknown>) => void;
  warn?: (scope: string, message: string, meta?: Record<string, unknown>) => void;
};

type SavePolicyFlash = {
  error?: (message: unknown, description?: string) => unknown;
  stickyWarn?: (
    message: unknown,
    description?: string,
    options?: Record<string, unknown>,
  ) => { hide?: () => void } | null;
};

type SavePolicyController = {
  beginSave: () => void;
  completeSave: (saved?: boolean) => void;
  destroy: () => void;
  hasUnsavedChanges: () => boolean;
  markSaved: () => void;
  refresh: () => void;
  root: HTMLElement | null;
};

type SavePolicyInput = {
  actionCompleteEvent?: string;
  channel?: string;
  flash?: SavePolicyFlash;
  labels?: SavePolicyLabels;
  logger?: SavePolicyLogger;
  primaryFormIds: string[];
  root: Element | null;
  specialActionPatterns?: RegExp[];
  uploadChangeEvents?: string[];
};

type SavePolicyState = {
  baseline: Map<Element, string>;
  channel: string;
  destroyed: boolean;
  dirty: boolean;
  flash: SavePolicyFlash;
  labels: Required<SavePolicyLabels>;
  logger?: SavePolicyLogger;
  primaryFormIds: string[];
  root: HTMLElement;
  saving: boolean;
  specialActionPatterns: RegExp[];
  unsavedFlashHandle: { hide?: () => void } | null;
  uploadChangeEvents: string[];
};

export type {
  SavePolicyController,
  SavePolicyFlash,
  SavePolicyInput,
  SavePolicyLabels,
  SavePolicyLogger,
  SavePolicyState,
};
