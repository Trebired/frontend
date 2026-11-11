import { assertPlainObject, invalidConfig } from "./shared.js";
import type { NormalizedFrontendCmsConfig } from "./types/cms.js";

const CMS_FIELDS = ["contentDir", "editorOrigins", "enabled", "mediaBase"];
const ORIGIN_PATTERN = /^https?:\/\/[^/]+$/u;

const DISABLED_CMS_CONFIG: NormalizedFrontendCmsConfig = Object.freeze({
    contentDir: "content",
    editorOrigins: [],
    enabled: false,
    mediaBase: "/content/",
}) as NormalizedFrontendCmsConfig;

function normalizeOrigins(value: unknown): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw invalidConfig("cms.editorOrigins must be an array of origins");
  return value.map((entry) => {
      const origin = String(entry || "").trim().replace(/\/+$/u, "");
      if (!ORIGIN_PATTERN.test(origin)) throw invalidConfig(`cms.editorOrigins has an invalid origin: ${String(entry)}`);
      return origin;
  });
}

function normalizeCmsConfig(value: unknown): NormalizedFrontendCmsConfig {
  if (value === undefined || value === false) return DISABLED_CMS_CONFIG;
  const source = assertPlainObject(value, "cms");
  const unknown = Object.keys(source).find((key) => !CMS_FIELDS.includes(key));
  if (unknown) throw invalidConfig(`cms.${unknown} is not supported`);
  const contentDir = String(source.contentDir ?? DISABLED_CMS_CONFIG.contentDir).replace(/^\/+|\/+$/gu, "");
  if (!contentDir || contentDir.includes("..")) throw invalidConfig("cms.contentDir must be a folder inside the app");
  return {
    contentDir,
    editorOrigins: normalizeOrigins(source.editorOrigins),
    enabled: source.enabled === true,
    mediaBase: String(source.mediaBase ?? `/${contentDir}/`),
  };
}

export { DISABLED_CMS_CONFIG, normalizeCmsConfig };
