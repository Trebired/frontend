import { type ReactNode } from "react";

import { Icon, type IconProps } from "#lbkpzw8nphru";
import { Card } from "#4woymc9xhupl";
import {
  button as primitiveButton,
  pill as primitivePill,
  type PrimitiveButtonClassOptions,
} from "#hzrmwbvgt2ax";
import {
  appendClassName,
  createTranslatorFactory,
  defineValue,
  joinClassNames,
  jsonScript as stringifyJsonForHtml,
  toText as toString,
} from "#ndsvdqv80epr";

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
  "feedback.graphUnavailable": "Graph unavailable.",
  "fields.unit": "Unit",
  "metrics.cpuUsage": "CPU usage",
  "metrics.downloadSpeed": "Download speed",
  "metrics.gpuUsage": "GPU usage",
  "metrics.memoryUsage": "Memory usage",
  "metrics.uploadSpeed": "Upload speed",
};

const defineMessages = defineValue as <T extends Record<string, unknown>>(messagesMap: T) => T;
const createLocalTranslator = createTranslatorFactory((key) => messages[key] || key) as (
  _url?: string,
  _lang?: string,
) => Translator;

function truthyArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value.filter(Boolean) as T[]) : [];
}

const icon = Icon as (props: IconProps & { spec: string }) => ReturnType<typeof Icon>;

const pill = primitivePill as (props: { children?: ReactNode }) => ReturnType<typeof primitivePill>;

const button = primitiveButton as (
  props: Record<string, unknown> & PrimitiveButtonClassOptions & { children?: ReactNode },
) => ReturnType<typeof primitiveButton>;

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function graphTime(value: string, _format?: string, options: { fallback?: string } = {}) {
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
  graphTime as time,
  toString,
  truthyArray,
};
export type { Translator };
