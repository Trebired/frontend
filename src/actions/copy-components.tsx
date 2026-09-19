import { type ReactNode } from "react";
import { code_block } from "#c55llzkpl4ob";
import {
  primitiveCardClassName,
  primitiveInlineRowClassName,
  primitiveTextClassName,
} from "#0rl8rpgzssot";
import { key_value } from "#kkjo6xogukzx";
import type { key_value_row } from "#xb7hv37sq5h5";
import { frontendDataAttrs } from "#5vbaqj4pirp3";
import { copy_button } from "./standard-buttons.js";

type CopyCardTitleLevel = "h2" | "h3" | "h4" | "h5" | "h6";

type CopyCardProps = {
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  description?: ReactNode;
  emptyText?: ReactNode;
  id?: string;
  intro?: ReactNode;
  lang?: string;
  rows?: key_value_row[];
  target?: string;
  title: ReactNode;
  titleAs?: CopyCardTitleLevel;
  tooltip?: string;
  value?: string;
};

type CopyValueProps = {
  children?: ReactNode;
  className?: string;
  copyValue?: string;
  id?: string;
  lang?: string;
  tooltip?: string;
  value: string;
};

type CopyCodeCardProps = {
  className?: string;
  description?: ReactNode;
  id: string;
  label: ReactNode;
  lang?: string;
  titleAs?: CopyCardTitleLevel;
  value: string;
};

function stableId(prefix: string, seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return `${prefix}_${hash.toString(36)}`;
}

function hasRows(props: CopyCardProps) {
  return Array.isArray(props.rows) && props.rows.length > 0;
}

function copyCardRowsId(props: CopyCardProps) {
  if (!hasRows(props)) return "";
  const explicit = String(props.id || "").trim();
  if (explicit) return `${explicit}_rows`;
  return stableId("copy_card", (props.rows || []).map((row) => String((row && row.label) || "")).join("|"));
}

const COPY_CARD_TITLE_LEVELS: CopyCardTitleLevel[] = ["h2", "h3", "h4", "h5", "h6"];

function copyCardTitle(props: CopyCardProps) {
  const Heading = COPY_CARD_TITLE_LEVELS.includes(props.titleAs as CopyCardTitleLevel)
  ? props.titleAs as CopyCardTitleLevel
  : "h3";
  return <Heading>{props.title}</Heading>;
}

function copyCardHeader(props: CopyCardProps, target: string) {
  const canCopy = Boolean(target || typeof props.value === "string");
  return (
    <div className={primitiveInlineRowClassName({ between: true, gap: "sm", verticalCenter: true })}>
    {copyCardTitle(props)}
    <div className="right">
    <div className={primitiveInlineRowClassName({ fit: true, gap: "xs", verticalCenter: true })}>
    {props.actions}
    {canCopy
      ? copy_button({
          lang: props.lang,
          size: "sm",
          target,
          title: props.tooltip,
          tooltip: props.tooltip,
          value: props.value,
      })
      : null}
    </div>
    </div>
    </div>
  );
}

function copyCardRows(props: CopyCardProps, rowsId: string) {
  if (hasRows(props)) {
    return (
      <div id={rowsId} {...frontendDataAttrs({ "copy-mode": "rows" })}>
      {key_value({ rows: props.rows || [], separated: true })}
      </div>
    );
  }
  if (Array.isArray(props.rows) && props.emptyText) {
    return <p className={primitiveTextClassName({ muted: true, size: "sm" })}>{props.emptyText}</p>;
  }
  return null;
}

function copy_card(props: CopyCardProps) {
  const rowsId = copyCardRowsId(props);
  const target = String(props.target || "").trim() || (rowsId ? `#${rowsId}` : "");
  return (
    <div
    className={primitiveCardClassName({ className: props.className, gap: "sm" })}
    {...(props.id ? { id: props.id } : {})}
    >
    {copyCardHeader(props, target)}
    {props.description ? <p className={primitiveTextClassName({ muted: true })}>{props.description}</p> : null}
    {props.intro}
    {copyCardRows(props, rowsId)}
    {props.children}
    </div>
  );
}

function copyValueShown(props: CopyValueProps, id: string, value: string) {
  if (props.children) {
    return <span className="text-break" id={id}>{props.children}</span>;
  }
  return <code className="text-break" id={id}>{value}</code>;
}

function copy_value(props: CopyValueProps) {
  const value = String(props.value || "");
  const id = String(props.id || "").trim() || stableId("copy_value", value);
  const literal = typeof props.copyValue === "string" ? { value: props.copyValue } : {};
  return (
    <span className={primitiveInlineRowClassName({ className: props.className, fit: true, gap: "xs", verticalCenter: true })}>
    {copyValueShown(props, id, value)}
    {copy_button({
          className: "no-shrink",
          lang: props.lang,
          size: "sm",
          target: `#${id}`,
          title: props.tooltip,
          tooltip: props.tooltip,
          ...literal,
    })}
    </span>
  );
}

function copy_code_card(props: CopyCodeCardProps) {
  return copy_card({
      children: code_block({ id: props.id, value: props.value, wrap: true }),
      className: props.className,
      description: props.description,
      lang: props.lang,
      target: `#${props.id}`,
      title: props.label,
      titleAs: props.titleAs,
      value: props.value,
  });
}

export { copy_card, copy_code_card, copy_value };
export type { CopyCardProps, CopyCardTitleLevel, CopyCodeCardProps, CopyValueProps };
