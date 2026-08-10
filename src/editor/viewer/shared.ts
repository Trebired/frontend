import { createRoot } from "react-dom/client";

import { activateLanguage } from "#xf0nky7w9fvx";
import {
  extensionFromName,
  findFirstFilePath,
  findTreeNodeByPath,
  isImagePath,
  normalizePath,
  text,
} from "#zgttxcjd88sc";

const roots = new WeakMap<HTMLElement, ReturnType<typeof createRoot>>();
let editorViewerModelInstanceId = 0;

function languageMatchesRequest(entry: any, requested: string) {
  const id = text(entry?.id).toLowerCase();
  if (requested && id === requested) return true;
  const aliases = Array.isArray(entry?.aliases) ? entry.aliases : [];
  return requested
  ? aliases.some((alias: unknown) => text(alias).toLowerCase() === requested)
  : false;
}

function languageMatchesExtension(entry: any, ext: string) {
  const extensions = Array.isArray(entry?.extensions) ? entry.extensions : [];
  return ext
  ? extensions.some((extension: unknown) => text(extension).toLowerCase() === `.${ext}`)
  : false;
}

function fallbackLanguage(ext: string, requested: string) {
  const fallbackByExt: Record<string, string> = {
    cjs: "javascript",
    css: "css",
    html: "html",
    js: "javascript",
    json: "json",
    jsx: "javascript",
    less: "less",
    md: "markdown",
    mjs: "javascript",
    scss: "scss",
    ts: "typescript",
    tsx: "typescript",
    txt: "plaintext",
    yaml: "yaml",
    yml: "yaml",
  };
  if (ext && fallbackByExt[ext]) return fallbackByExt[ext];
  if (requested) return requested;
  return "plaintext";
}

function editorFileLanguage(monacoRef: any, pathInput: unknown, languageNameInput: unknown) {
  const requested = text(languageNameInput).toLowerCase();
  const ext = extensionFromName(normalizePath(pathInput));
  const catalog =
  monacoRef?.languages && typeof monacoRef.languages.getLanguages === "function"
  ? monacoRef.languages.getLanguages()
  : [];
  const byName = catalog.find((entry: any) => languageMatchesRequest(entry, requested));
  if (byName && text(byName.id)) return text(byName.id);
  const byExtension = catalog.find((entry: any) => languageMatchesExtension(entry, ext));
  if (byExtension && text(byExtension.id)) return text(byExtension.id);
  return fallbackLanguage(ext, requested);
}

function getEditorViewerRoot(container: HTMLElement | null) {
  if (!(container instanceof HTMLElement)) return null;
  let root = roots.get(container);
  if (!root) {
    root = createRoot(container);
    roots.set(container, root);
  }
  return root;
}

function deleteRoot(container: HTMLElement | null) {
  if (container instanceof HTMLElement) roots.delete(container);
}

function buildFileApiUrl(baseUrlInput: unknown, pathInput: unknown) {
  const baseUrl = text(baseUrlInput);
  const relPath = normalizePath(pathInput);
  if (!baseUrl || !relPath || typeof window === "undefined") return "";
  try {
    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.set("path", relPath);
    return url.toString();
  } catch {
    return "";
  }
}

function syncViewerPathInUrl(pathInput: unknown) {
  const relPath = normalizePath(pathInput);
  if (typeof window === "undefined") return;
  try {
    const nextUrl = new URL(window.location.href);
    if (relPath) nextUrl.searchParams.set("path", relPath);
    else nextUrl.searchParams.delete("path");
    const nextHref = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
    const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextHref !== currentHref) {
      window.history.replaceState(window.history.state, "", nextHref);
    }
  } catch {}
}

function readViewerPathFromUrl() {
  if (typeof window === "undefined") return "";
  try {
    return normalizePath(new URL(window.location.href).searchParams.get("path") || "");
  } catch {
    return "";
  }
}

function readFullscreenState(rootInput: HTMLDivElement | null) {
  return Boolean(rootInput?.closest('[data-tbf-fullscreen-active="true"]'));
}

function resolveViewerTreeHeight(isFullscreen: boolean, viewportHeight: number) {
  if (!isFullscreen) return 520;
  return Math.max(640, viewportHeight - 240);
}

function nextEditorViewerModelInstanceId() {
  editorViewerModelInstanceId += 1;
  return editorViewerModelInstanceId;
}

function setModelLanguage(monacoRef: any, model: any, languageId: string) {
  if (!monacoRef || !model || !languageId) return;
  if (typeof monacoRef.editor.setModelLanguage === "function") {
    monacoRef.editor.setModelLanguage(model, languageId);
  }
}

function upsertReadonlyModel(
  monacoRef: any,
  currentModel: any,
  uriText: string,
  languageId: string,
  content: string,
) {
  if (!monacoRef?.editor || !monacoRef.Uri) return null;
  const uri = monacoRef.Uri.parse(uriText);
  const existingModel =
  typeof monacoRef.editor.getModel === "function"
  ? monacoRef.editor.getModel(uri)
  : null;
  const model = existingModel || monacoRef.editor.createModel("", languageId, uri);
  if (currentModel && currentModel !== model && typeof currentModel.dispose === "function") {
    currentModel.dispose();
  }
  setModelLanguage(monacoRef, model, languageId);
  if (typeof model.getValue === "function" && model.getValue() !== content) {
    model.setValue(content);
  }
  return model;
}

async function activateEditorLanguage(monacoRef: any, path: unknown, languageName: unknown) {
  const languageId = editorFileLanguage(monacoRef, path, languageName);
  await activateLanguage(monacoRef, languageId);
  return languageId;
}

export {
  activateEditorLanguage,
  buildFileApiUrl,
  deleteRoot,
  findFirstFilePath,
  findTreeNodeByPath,
  getEditorViewerRoot,
  isImagePath,
  normalizePath,
  readFullscreenState,
  readViewerPathFromUrl,
  resolveViewerTreeHeight,
  syncViewerPathInUrl,
  nextEditorViewerModelInstanceId,
  text,
  upsertReadonlyModel,
};
