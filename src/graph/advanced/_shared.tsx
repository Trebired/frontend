import { createElement, type ReactNode } from "react";

import { Icon, type IconProps } from "#lbkpzw8nphru";
import { Button, Card } from "#4woymc9xhupl";

type TranslatorVars = Record<string, unknown>;
type Translator = (key: string, vars?: TranslatorVars) => string;

const messages: Record<string, string> = {
  "contributionActiveDayCount": "{count} active day",
  "contributionActiveDaysCount": "{count} active days",
  "contributionCommitCount": "{count} contribution",
  "contributionCommitOnDate": "{count} contribution on {date}",
  "contributionCommitsCount": "{count} contributions",
  "contributionCommitsOnDate": "{count} contributions on {date}",
  "contributionRepoCount": "{count} repository",
  "contributionReposCount": "{count} repositories",
  "display.exitFullscreen": "Exit fullscreen",
  "display.fullscreen": "Fullscreen",
  "empty.noContributions": "No contributions yet.",
  "fields.unit": "Unit",
};

function toString(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function joinClassNames(values: unknown[]) {
  return values.map((value) => toString(value)).filter(Boolean).join(" ");
}

function appendClassName(base: unknown, next: unknown) {
  return joinClassNames([base, next]);
}

function stringifyJsonForHtml(value: unknown) {
  return JSON.stringify(value ?? {}).replace(/</g, "\\u003c");
}

function truthyArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value.filter(Boolean) as T[]) : [];
}

function createLocalTranslator(_url?: string, _lang?: string): Translator {
  return (key, vars = {}) => {
    let text = messages[key] || key;
    Object.entries(vars).forEach(([name, value]) => {
      text = text.split(`{${name}}`).join(String(value ?? ""));
    });
    return text;
  };
}

function defineMessages<T extends Record<string, unknown>>(messagesMap: T) {
  return messagesMap;
}

function icon(props: IconProps & { spec: string }) {
  return createElement(Icon, props);
}

function pill(props: { children?: ReactNode }) {
  return <span className="tbf-pill pill">{props.children}</span>;
}

function button(props: Record<string, unknown> & { children?: ReactNode }) {
  const { children, className, ...rest } = props;
  return (
    <Button className={joinClassNames(["btn", className])} {...(rest as any)}>
      {children}
    </Button>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function time(value: string, _format?: string, options: { fallback?: string } = {}) {
  return formatDate(value) || options.fallback || value;
}

export {
  Card,
  appendClassName,
  button,
  createLocalTranslator,
  defineMessages,
  formatDate,
  icon,
  joinClassNames,
  pill,
  stringifyJsonForHtml,
  time,
  toString,
  truthyArray,
};
export type { Translator };
