import fs from "node:fs/promises";
import path from "node:path";
import { normalizeCmsDocument, type CmsDocument } from "./../cms/document.js";
import { CMS_SCHEMA_PATH, cmsManifestJson } from "./../cms/manifest.js";
import type { CmsSchema } from "./../cms/schema.js";

const CMS_CONTENT_FILE = "content.json";
const CMS_MEDIA_DIR = "media";

async function readCmsDocument(contentDir: string): Promise<CmsDocument> {
  try {
    return normalizeCmsDocument(JSON.parse(await fs.readFile(path.join(contentDir, CMS_CONTENT_FILE), "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return normalizeCmsDocument({});
    throw error;
  }
}

async function writeCmsManifest(outDir: string, schema: CmsSchema, locales: string[]): Promise<string> {
  const target = path.join(outDir, CMS_SCHEMA_PATH);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, cmsManifestJson(schema, locales), "utf8");
  return target;
}

async function copyCmsMedia(contentDir: string, outDir: string, publicDir: string): Promise<number> {
  const source = path.join(contentDir, CMS_MEDIA_DIR);
  const files = await fs.readdir(source).catch (() => [] as string[]);
  if (!files.length) return 0;
  const target = path.join(outDir, publicDir.replace(/^\/+|\/+$/gu, ""), CMS_MEDIA_DIR);
  await fs.mkdir(target, { recursive: true });
  for (const file of files) await fs.copyFile(path.join(source, file), path.join(target, file));
  return files.length;
}

export { CMS_CONTENT_FILE, CMS_MEDIA_DIR, copyCmsMedia, readCmsDocument, writeCmsManifest };
