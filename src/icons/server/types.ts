import type { IconPack } from "#bu1nq95e3k0f";

type IconSvgSuccess = {
  file?: string;
  icon: string;
  ok: true;
  pack: IconPack;
  spec: string;
  statusCode: "success";
  svg: string;
};

type IconSvgFailure = {
  icon?: string;
  ok: false;
  pack?: string;
  spec: string;
  status: number;
  statusCode: "duplicate-icon-name" | "icon-not-found" | "invalid-spec" | "invalid-svg" | "pack-not-found";
};

type IconSvgResult = IconSvgSuccess | IconSvgFailure;

type IconServerOptions = {
  packageRoots?: Record<string, string>;
  packageRoot?: string;
  packs?: readonly string[];
  preserveSourceColors?: boolean | readonly string[];
  rootDir?: string;
};

type RenderIconHtmlAttrs = Record<string, unknown> & {
  class?: string;
  className?: string;
  color?: string;
  label?: string;
  preserveSourceColors?: boolean;
  tag?: "i" | "span" | "div";
  title?: string;
};

type IconPackIndex = {
  byName: Map<string, string>;
  duplicates: Map<string, string[]>;
  packRoot: string;
};

type MaterialFileIconOptions = IconServerOptions & {
  canonicalExtensionForLanguage?: (language: unknown, id?: unknown) => string;
  normalizeLanguageId?: (language: unknown) => string;
};

export type {
  IconPackIndex,
  IconServerOptions,
  IconSvgFailure,
  IconSvgResult,
  IconSvgSuccess,
  MaterialFileIconOptions,
  RenderIconHtmlAttrs,
};
