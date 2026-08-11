import fs from "node:fs";
import path from "node:path";

import {
  iconSpec,
  normalizeIconName,
  text,
} from "#bu1nq95e3k0f";
import { resolveIconPackRoot } from "./options.js";
import type { IconServerOptions, MaterialFileIconOptions } from "./types.js";

const materialIconThemeCache = new Map<string, unknown>();

function readMaterialIconTheme(options: IconServerOptions = {}): any {
  const packRoot = resolveIconPackRoot("material-icon-theme", options);
  if (!packRoot) return null;
  if (materialIconThemeCache.has(packRoot)) return materialIconThemeCache.get(packRoot);
  const themePath = path.join(packRoot, "dist", "material-icons.json");
  let theme: unknown = null;
  try {
    theme = JSON.parse(fs.readFileSync(themePath, "utf8"));
  } catch {
    theme = null;
  }
  materialIconThemeCache.set(packRoot, theme);
  return theme;
}

function resolveMaterialThemeIconSpec(
  iconId: unknown,
  options: IconServerOptions = {},
): string {
  const theme = readMaterialIconTheme(options);
  const id = normalizeIconName(iconId);
  if (!theme || !id) return "";
  const definitions = theme && typeof theme === "object"
  ? (theme as Record<string, any>).iconDefinitions
  : null;
  const definition = definitions && typeof definitions === "object" ? definitions[id] : null;
  return definition && definition.iconPath ? iconSpec("material-icon-theme", id) : "";
}

function materialIconIdExists(
  iconId: unknown,
  options: IconServerOptions = {},
): boolean {
  return Boolean(resolveMaterialThemeIconSpec(iconId, options));
}

function resolveMappedMaterialIconId(
  map: unknown,
  key: unknown,
  options: IconServerOptions = {},
): string {
  const source = map && typeof map === "object" ? map as Record<string, unknown> : {};
  const id = text(source[text(key).toLowerCase()] || "");
  return id && materialIconIdExists(id, options) ? id : "";
}

function basename(value: unknown): string {
  return text(value).split(/[\\/]/u).pop() || "";
}

function extensionLower(value: unknown): string {
  const ext = path.extname(basename(value));
  return ext ? ext.slice(1).toLowerCase() : "";
}

function defaultMaterialLanguageId(value: unknown): string {
  return text(value)
  .toLowerCase()
  .replace(/\+/gu, "p")
  .replace(/#/gu, "sharp")
  .replace(/[^a-z0-9]+/gu, "");
}

function materialLanguageKeys(
  languageInput: unknown,
  fallbackInput: unknown = "",
  options: MaterialFileIconOptions = {},
): string[] {
  const raw = text(languageInput).toLowerCase();
  const normalizeLanguageId = options.normalizeLanguageId || defaultMaterialLanguageId;
  const normalized = normalizeLanguageId(raw);
  const fallback = text(fallbackInput).toLowerCase().replace(/^\./u, "");
  const keys = [
    raw,
    normalized,
    raw === "tsx" || normalized === "tsx" ? "typescriptreact" : "",
    raw === "jsx" || normalized === "jsx" ? "javascriptreact" : "",
    raw === "shell" || raw === "bash" || normalized === "shell" || normalized === "bash"
    ? "shellscript"
    : "",
    raw === "c++" || normalized === "cpp" ? "cpp" : "",
    raw === "c#" || normalized === "csharp" ? "csharp" : "",
    fallback,
  ];
  return Array.from(new Set(keys.filter(Boolean)));
}

function readMaterialFileIconRequest(
  nameInput: unknown,
  languageIdInput: unknown = "",
) {
  const input = nameInput && typeof nameInput === "object"
  ? nameInput as Record<string, unknown>
  : {};
  const pathValue = text(input.path || input.rel_path || input.relPath || nameInput);
  const name = basename(input.name || pathValue);
  const languageName = text(
    input.language_name || input.languageName || input.language || languageIdInput,
  );
  const languageId = text(input.language_id || input.languageId || languageIdInput);
  return { languageId, languageName, name, path: pathValue };
}

function resolveMaterialFolderIconId(
  name: unknown,
  options: IconServerOptions = {},
): string {
  const theme = readMaterialIconTheme(options);
  if (!theme || typeof theme !== "object") return "";
  const key = text(name).toLowerCase();
  return resolveMappedMaterialIconId((theme as any).folderNames, key, options) ||
    text((theme as any).folder || "");
}

function resolveMaterialFileIconId(
  nameInput: unknown,
  languageIdInput: unknown = "",
  options: MaterialFileIconOptions = {},
): string {
  const theme = readMaterialIconTheme(options);
  if (!theme || typeof theme !== "object") return "";
  const request = readMaterialFileIconRequest(nameInput, languageIdInput);
  const lower = request.name.toLowerCase();
  const nameIcon = resolveMappedMaterialIconId((theme as any).fileNames, lower, options);
  if (nameIcon) return nameIcon;
  const ext = extensionLower(request.path || request.name);
  const extIcon = resolveMappedMaterialIconId((theme as any).fileExtensions, ext, options);
  if (extIcon) return extIcon;
  for (const langKey of materialLanguageKeys(request.languageId || request.languageName, ext, options)) {
    const langIcon = resolveMappedMaterialIconId((theme as any).languageIds, langKey, options);
    if (langIcon) return langIcon;
  }
  return text((theme as any).file || "");
}

function resolveMaterialLanguageIconId(
  languageId: unknown,
  fallbackExt: unknown = "",
  options: MaterialFileIconOptions = {},
): string {
  const theme = readMaterialIconTheme(options);
  if (!theme || typeof theme !== "object") return "";
  const normalizeLanguageId = options.normalizeLanguageId || defaultMaterialLanguageId;
  const normalizedId = normalizeLanguageId(languageId);
  const canonicalExtension = options.canonicalExtensionForLanguage
  ? text(options.canonicalExtensionForLanguage(languageId, normalizedId)).replace(/^\./u, "")
  : "";
  for (const langKey of materialLanguageKeys(languageId, fallbackExt || canonicalExtension, options)) {
    const langIcon = resolveMappedMaterialIconId((theme as any).languageIds, langKey, options);
    if (langIcon) return langIcon;
  }
  const ext = text(fallbackExt || canonicalExtension).toLowerCase().replace(/^\./u, "");
  const extIcon = resolveMappedMaterialIconId((theme as any).fileExtensions, ext, options);
  if (extIcon) return extIcon;
  const canonicalIcon = resolveMappedMaterialIconId(
    (theme as any).fileExtensions,
    canonicalExtension,
    options,
  );
  if (canonicalIcon) return canonicalIcon;
  return text((theme as any).file || "");
}

function resolveMaterialFileIconSpec(
  nameInput: unknown,
  languageIdInput: unknown = "",
  options: MaterialFileIconOptions = {},
): string {
  return resolveMaterialThemeIconSpec(
    resolveMaterialFileIconId(nameInput, languageIdInput, options),
    options,
  );
}

function resolveMaterialFolderIconSpec(
  name: unknown,
  options: IconServerOptions = {},
): string {
  return resolveMaterialThemeIconSpec(resolveMaterialFolderIconId(name, options), options);
}

function resolveMaterialLanguageIconSpec(
  languageId: unknown,
  fallbackExt: unknown = "",
  options: MaterialFileIconOptions = {},
): string {
  return resolveMaterialThemeIconSpec(
    resolveMaterialLanguageIconId(languageId, fallbackExt, options),
    options,
  );
}

function resolveMaterialFileEntryIconSpec(
  entryInput: unknown,
  options: MaterialFileIconOptions = {},
): string {
  const entry = entryInput && typeof entryInput === "object"
  ? entryInput as Record<string, unknown>
  : {};
  const kind = text(entry.kind || entry.type).toLowerCase() === "dir" ? "dir" : "file";
  if (kind === "dir") {
    return resolveMaterialFolderIconSpec(
      entry.name || entry.path || entry.rel_path,
      options,
    );
  }
  return resolveMaterialFileIconSpec(entry, "", options);
}

export {
  materialLanguageKeys,
  readMaterialFileIconRequest,
  readMaterialIconTheme,
  resolveMaterialFileEntryIconSpec,
  resolveMaterialFileIconId,
  resolveMaterialFileIconSpec,
  resolveMaterialFolderIconId,
  resolveMaterialFolderIconSpec,
  resolveMaterialLanguageIconId,
  resolveMaterialLanguageIconSpec,
  resolveMaterialThemeIconSpec,
};
