import { frontendToken } from "./../namespace/index.js";
import type { CmsSchema } from "./schema.js";

const CMS_SCHEMA_PATH = `.well-known/${frontendToken("cms")}/schema.json`;
const CMS_MANIFEST_VERSION = 1;

type CmsManifest = { locales: string[]; schema: CmsSchema; version: typeof CMS_MANIFEST_VERSION };

function cmsManifest(schema: CmsSchema, locales: string[]): CmsManifest {
  return { locales: [...locales], schema, version: CMS_MANIFEST_VERSION };
}

function cmsManifestJson(schema: CmsSchema, locales: string[]): string {
  return `${JSON.stringify(cmsManifest(schema, locales), null, 2)}\n`;
}

export { CMS_MANIFEST_VERSION, CMS_SCHEMA_PATH, cmsManifest, cmsManifestJson };
export type { CmsManifest };
