import type { ReactNode } from "react";

type LocaleOption = {
  code: string;
  icon?: ReactNode;
  label?: string;
  shortLabel?: string;
};

type LocaleSwitcherProps = {
  className?: string;
  endpoint?: string;
  id?: string;
  lang?: string;
  locales?: LocaleOption[];
};

type SourceLanguageBucket = "everything" | "repository" | "supporting";

type SourceLanguageCardProps = {
  details?: any;
  item?: any;
  lang?: string;
  language?: any;
  locale?: string;
  modalId?: string;
  repository?: any;
};

type SourceLanguageModalProps = {
  details?: any;
  lang?: string;
  language?: any;
  locale?: string;
  modalId?: string;
  repository?: any;
};

type SourceLanguageTabsContentProps = {
  lang?: string;
  locale?: string;
  repository?: any;
  visualLanguages?: any[];
};

type SourceLanguageVisualizerProps = {
  lang?: string;
  locale?: string;
  repository?: any;
};

export type {
  LocaleOption,
  LocaleSwitcherProps,
  SourceLanguageBucket,
  SourceLanguageCardProps,
  SourceLanguageModalProps,
  SourceLanguageTabsContentProps,
  SourceLanguageVisualizerProps,
};
