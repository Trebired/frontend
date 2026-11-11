import { frontendDataAttr } from "./../namespace/index.js";

type CmsRuntimeConfig = { editorOrigins: string[]; enabled: boolean; mediaBase: string };

const CMS_CONFIG_ATTR = frontendDataAttr("cms-config");
const DEFAULT_MEDIA_BASE = "/content/";
const DISABLED: CmsRuntimeConfig = { editorOrigins: [], enabled: false, mediaBase: DEFAULT_MEDIA_BASE };

function normalizeCmsRuntime(value: unknown): CmsRuntimeConfig {
  if (!value || typeof value !== "object") return DISABLED;
  const source = value as Record<string, unknown>;
  const origins = Array.isArray(source.editorOrigins) ? source.editorOrigins : [];
  return {
    editorOrigins: origins.map((origin) => String(origin || "").trim().replace(/\/+$/u, "")).filter(Boolean),
    enabled: source.enabled === true,
    mediaBase: String(source.mediaBase || DEFAULT_MEDIA_BASE),
  };
}

function readCmsRuntime(): CmsRuntimeConfig {
  if (typeof document === "undefined") return DISABLED;
  const raw = document.documentElement.getAttribute(CMS_CONFIG_ATTR);
  if (!raw) return DISABLED;
  try {
    return normalizeCmsRuntime(JSON.parse(raw));
  } catch {
    return DISABLED;
  }
}

function cmsDocumentAttrs(config: unknown): Record<string, string> {
  const runtime = normalizeCmsRuntime(config);
  return runtime.enabled ? {[CMS_CONFIG_ATTR]: JSON.stringify(runtime) } : {};
}

export { CMS_CONFIG_ATTR, cmsDocumentAttrs, DEFAULT_MEDIA_BASE, normalizeCmsRuntime, readCmsRuntime };
export type { CmsRuntimeConfig };
