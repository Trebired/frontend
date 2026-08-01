type FlashType = "error" | "info" | "success" | "warn";
type FlashOptions = {
  description?: string;
  id?: string;
  stackPriority?: "high" | "low" | "normal";
  sticky?: boolean;
  update?: boolean;
};
type FlashHandle = {
  dismiss: () => boolean;
  element: HTMLElement;
  id: string;
};
type ConfirmOptions = {
  cancelText?: string;
  confirmText?: string;
  confirmationText?: string;
  mode?: "classic" | "text";
  placeholder?: string;
  type?: FlashType;
};
type PromptOptions = {
  cancelText?: string;
  placeholder?: string;
  submitText?: string;
  value?: string;
};

export type {
  ConfirmOptions,
  FlashHandle,
  FlashOptions,
  FlashType,
  PromptOptions,
};
