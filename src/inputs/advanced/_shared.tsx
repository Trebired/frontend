import { type ReactNode } from "react";

import { requestJson as packageRequestJson } from "#v1p6uw62hhsf";
import { Icon, type IconProps } from "#lbkpzw8nphru";
import {
  appendClassName,
  createTranslatorFactory,
  defineValue,
  joinClassNames,
  jsonScript as stringifyJsonForHtml,
  toText as toString,
} from "#ndsvdqv80epr";
import {
  closestElement,
  dispatchInputChange,
  firstNonScriptHTMLElementChild,
  documentLanguageTag as documentLang,
  isInteractiveTarget,
  isInUnhydratedIsland,
  readElementJson as readHostJsonConfig,
  resolveDocumentTarget,
} from "#er0dlx1gtbzh";
import {
  button as primitiveButton,
  type PrimitiveButtonClassOptions,
} from "#hzrmwbvgt2ax";
import { useRenderCurrentUrl } from "#pwuc6i9ku53k";

type TranslatorVars = Record<string, unknown>;
type Translator = (key: string, vars?: TranslatorVars) => string;
type ButtonProps = Record<string, unknown> & PrimitiveButtonClassOptions & {
  children?: ReactNode;
};

const messages: Record<string, string> = {
  "actions.add": "Add",
  "actions.cancel": "Cancel",
  "actions.chooseFile": "Choose file",
  "actions.chooseFolder": "Choose folder",
  "actions.clear": "Clear",
  "actions.remove": "Remove",
  "actions.search": "Search",
  "actions.select": "Select",
  "actions.toggle": "Toggle",
  "actions.unselect": "Unselect",
  "actions.unselectAll": "Unselect all",
  "display.exitFullscreen": "Exit fullscreen",
  "display.fullscreen": "Fullscreen",
  "empty.noFileSelected": "No file selected",
  "empty.noMatchesFound": "No matches found",
  "empty.nothingHere": "Nothing here",
  "feedback.chooseAcceptedFileFormat": "Choose an accepted file format.",
  "feedback.fileFormatNotAllowed": "File format not allowed",
  "feedback.onlyImageFilesCanBeCropped": "Only image files can be cropped.",
  "files.cropBeforeSaving": "Crop before saving.",
  "files.cropImage": "Crop image",
  "files.dropFilesHere": "Drop files here",
  "files.dropFilesOrFoldersHere": "Drop files or folders here",
  "files.selectedUploadPreview": "Selected upload preview",
  "files.upload": "Upload",
  "files.uploadOnlyFormats": "Only {formats}",
  "files.uploadPreview": "Upload preview",
  "selection.all": "All",
  "state.unavailable": "Unavailable",
};

const defineMessages = defineValue as <T extends Record<string, unknown>>(messagesMap: T) => T;
const createLocalTranslator = createTranslatorFactory((key) => messages[key] || key) as (
  _url?: string,
  _lang?: string,
) => Translator;

function noop(..._args: unknown[]) {
  return undefined;
}

const defineFirstChildElement = noop as (
  _tagName: string,
  _bind: (child: HTMLElement, host: HTMLElement) => unknown,
) => void;

const defineBoundElement = noop as (
  _tagName: string,
  _bind: (host: HTMLElement) => unknown,
) => void;

const icon = Icon as (props: IconProps & { [key: string]: unknown; spec: string }) => ReturnType<typeof Icon>;

const button = primitiveButton as (props: ButtonProps) => ReturnType<typeof primitiveButton>;

export {
  appendClassName,
  button,
  closestElement,
  createLocalTranslator,
  defineBoundElement,
  defineFirstChildElement,
  defineMessages,
  dispatchInputChange,
  documentLang,
  firstNonScriptHTMLElementChild,
  icon,
  isInteractiveTarget,
  isInUnhydratedIsland,
  joinClassNames,
  noop,
  toString as onlyString,
  readHostJsonConfig,
  packageRequestJson as requestJson,
  resolveDocumentTarget,
  stringifyJsonForHtml,
  toString,
  useRenderCurrentUrl,
};
export type { Translator };
