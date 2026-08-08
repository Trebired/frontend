type FlashType = "error" | "info" | "success" | "warn";
type FlashStackPriority = "high" | "low" | "normal";
type FlashProgressTone =
  | "blue"
  | "cyan"
  | "gray"
  | "green"
  | "indigo"
  | "orange"
  | "red"
  | "ruby"
  | "yellow"
  | (string & {});
type FlashOptions = {
  description?: string;
  id?: string;
  progressTone?: FlashProgressTone;
  progressType?: FlashProgressTone;
  stackPriority?: FlashStackPriority;
  sticky?: boolean;
  update?: boolean;
};
type FlashHandle = {
  dismiss: () => boolean;
  el: HTMLElement;
  element: HTMLElement;
  hide: () => boolean;
  id: string;
};
type ConfirmVariant = "archive" | "delete" | "drop";
type ConfirmationAttrsInput = {
  confirmationText?: unknown;
  mode?: unknown;
  subject?: unknown;
  target?: unknown;
  variant?: unknown;
};
type ConfirmOptions = {
  cancelText?: string;
  confirmButtonText?: string;
  confirmMode?: "classic" | "text";
  confirmText?: string;
  confirmType?: "classic" | "text";
  confirmationText?: string;
  mode?: "classic" | "text";
  placeholder?: string;
  progressTone?: FlashProgressTone;
  progressType?: FlashProgressTone;
  subject?: string;
  target?: string;
  type?: FlashType;
  variant?: ConfirmVariant | (string & {});
};
type ConfirmModel = {
  cancelText: string;
  confirmButtonText: string;
  confirmMode: "classic" | "text";
  confirmationText: string;
  description: string;
  isTextConfirm: boolean;
  placeholder: string;
  progressTone: string;
  title: string;
  type: FlashType;
};
type PromptOptions = {
  cancelText?: string;
  placeholder?: string;
  progressTone?: FlashProgressTone;
  progressType?: FlashProgressTone;
  submitText?: string;
  value?: string;
};

export type {
  ConfirmationAttrsInput,
  ConfirmModel,
  ConfirmOptions,
  ConfirmVariant,
  FlashHandle,
  FlashOptions,
  FlashProgressTone,
  FlashStackPriority,
  FlashType,
  PromptOptions,
};
