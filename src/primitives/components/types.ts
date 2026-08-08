import type {
  ButtonHTMLAttributes,
  CSSProperties,
  FormHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import type { BindActionTriggerOptions } from "#2qlqsnwrvrgx";
import type { SubmitActionButtonOptions } from "#7yo06l20dfgo";

type attr_map = Record<string, unknown>;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  actionButton?: SubmitActionButtonOptions;
  actionTrigger?: BindActionTriggerOptions;
  variant?: "solid";
};

type CardProps = HTMLAttributes<HTMLDivElement> & {
  actionTrigger?: BindActionTriggerOptions;
};

type ActionFormProps = Omit<
  FormHTMLAttributes<HTMLFormElement>,
  "action" | "children" | "method"
> & {
  action: string;
  body?: "json";
  children?: ReactNode;
  ignoreResponseAction?: boolean;
  lifecycle?: boolean;
  method?: string;
  success?: "soft-reload";
  successTab?: string;
};

type CsrfInputProps = {
  optional?: boolean;
  token: unknown;
};

type AvatarProps = {
  alt?: string;
  className?: string;
  height?: string | number;
  size?: string;
  src?: string;
  style?: CSSProperties;
  width?: string | number;
};

type PillProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
};

type SeparatorProps = {
  className?: string;
  orientation?: "horizontal" | "vertical";
  visible?: boolean;
};

type list_props<T = unknown> = {
  className?: string;
  getItemProps?: (item: T, index: number) => Record<string, unknown>;
  getKey?: (item: T, index: number) => string | number;
  itemClassName?: string;
  items?: T[];
  renderItem: (item: T, index: number) => ReactNode;
  style?: CSSProperties;
};

type key_value_row = {
  attributes?: string;
  format?: "time";
  id?: string;
  label?: string;
  label_attributes?: string;
  value?: unknown;
  value_attributes?: string;
  value_html?: string;
  value_node?: ReactNode;
};

type key_value_group = {
  rows?: key_value_row[];
  title?: string;
};

type key_value_props = {
  card?: boolean;
  className?: string;
  groups?: key_value_group[];
  layout?: "column" | "inline";
  rowClassName?: string;
  rows?: key_value_row[];
  rowsClassName?: string;
  separated?: boolean;
};

type masonry_props = HTMLAttributes<HTMLDivElement> & {
  columns?: ReactNode[];
};

type bar_props = {
  card?: boolean;
  hidden?: boolean;
  label?: string;
  meta?: string;
  percent?: number;
  wrapperAttributes?: string;
};

type circle_props = {
  size?: string;
};

type StatusDotTone =
  | "blue"
  | "cyan"
  | "error"
  | "gray"
  | "green"
  | "info"
  | "muted"
  | "purple"
  | "red"
  | "success"
  | "warning"
  | "yellow";

type StatusDotSize = "xs" | "sm" | "md" | "lg";

type StatusDotProps = {
  ariaHidden?: boolean;
  className?: string;
  size?: StatusDotSize;
  title?: string;
  tone?: StatusDotTone;
};

type TimeCounterProps = {
  alwaysRender?: boolean;
  bare?: boolean;
  className?: string;
  count?: number | string;
  end?: string;
  id?: string;
  live?: boolean;
  mode?: "count";
  reloadOnZero?: boolean;
  remaining?: boolean;
  start?: string;
  unstyled?: boolean;
};

type CardSegment = {
  className?: string;
  kind?: string;
  value?: ReactNode;
};

type CardSegmentRow = {
  className?: string;
  dataAttrs?: Record<string, string>;
  segments?: CardSegment[];
};

type CardSegmentsProps = {
  rows?: CardSegmentRow[];
};

type BodyProps = {
  actionTrigger?: BindActionTriggerOptions;
  actions?: ReactNode;
  actionsClassName?: string;
  bodyClassName?: string;
  className?: string;
  dataAttrs?: Record<string, unknown>;
  extra?: ReactNode;
  icon?: ReactNode;
  live?: { id: string; kind: string };
  meta?: ReactNode;
  search?: Record<string, unknown>;
  segments?: ReactNode;
  select?: {
    buttonType?: "button" | "reset" | "submit";
    disabled?: boolean;
    selected?: boolean;
    value?: string;
  };
  showDivider?: boolean;
  subtitle?: ReactNode;
  subtitleClassName?: string;
  title: ReactNode;
  titleAttrs?: Record<string, string>;
  titleClassName?: string;
  titleWidthFit?: boolean;
  type?: {
    actions?: boolean;
    divider?: boolean;
    icon?: boolean;
    segments?: boolean;
    titleMeta?: boolean;
  };
  width?: "fit" | "full";
};

type SelectCardItem = {
  attrs?: Record<string, unknown>;
  buttonType?: "button" | "reset" | "submit";
  className?: string;
  content?: ReactNode;
  description?: ReactNode;
  details?: ReactNode;
  disabled?: boolean;
  iconSpec?: string;
  id?: string;
  selected?: boolean;
  title?: ReactNode;
  titleMeta?: ReactNode;
  value?: string;
};

type SelectCardsProps = {
  attrs?: Record<string, unknown>;
  className?: string;
  icon?: boolean;
  items: SelectCardItem[];
  layout?: "column" | "grid";
};

type CardItemProps = {
  actionTrigger?: BindActionTriggerOptions;
  className?: string;
  dataAttrs?: Record<string, string>;
  extraHtml?: string;
  search?: Record<string, unknown>;
  segmentRows?: CardSegmentRow[];
  statusHtml?: string;
  title?: ReactNode;
  titleMetaHtml?: string;
};

type primitive_action_form_props = ActionFormProps;
type primitive_button_props = ButtonProps;
type primitive_card_props = CardProps;

export type {
  ActionFormProps,
  AvatarProps,
  BodyProps,
  ButtonProps,
  CardItemProps,
  CardProps,
  CardSegment,
  CardSegmentRow,
  CardSegmentsProps,
  CsrfInputProps,
  PillProps,
  SelectCardItem,
  SelectCardsProps,
  SeparatorProps,
  StatusDotProps,
  StatusDotSize,
  StatusDotTone,
  TimeCounterProps,
  attr_map,
  bar_props,
  circle_props,
  key_value_group,
  key_value_props,
  key_value_row,
  list_props,
  masonry_props,
  primitive_action_form_props,
  primitive_button_props,
  primitive_card_props,
};
