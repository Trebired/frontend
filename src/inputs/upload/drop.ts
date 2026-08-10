import { isUploadDropRoot, uploadRootConfig } from "./config.js";
import { toText } from "./text.js";
import type { UploadEntry } from "./types.js";

type FileSystemEntryLike = {
  createReader?: () => { readEntries: (callback: (entries: FileSystemEntryLike[]) => void) => void };
  file?: (callback: (file: File) => void) => void;
  fullPath?: string;
  isDirectory?: boolean;
  isFile?: boolean;
  name?: string;
};

function dataTransferHasFiles(dataTransfer: DataTransfer | null) {
  return Array.from(dataTransfer?.types || []).includes("Files");
}

function preventFileDragDefault(event: DragEvent, effect: DataTransfer["dropEffect"] = "copy") {
  if (!dataTransferHasFiles(event.dataTransfer)) return false;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = effect;
  return true;
}

function closestDropRoot(target: EventTarget | null) {
  const element = target instanceof Element ? target : null;
  const root = element?.closest("[data-tbf-upload]");
  return isUploadDropRoot(root) ? root as HTMLElement : null;
}

function relatedTargetInside(root: HTMLElement, relatedTarget: EventTarget | null) {
  return relatedTarget instanceof Node && root.contains(relatedTarget);
}

function skippedDirectoryNames(root: HTMLElement) {
  return new Set(
    toText(uploadRootConfig(root).skipDirs)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  );
}

function hasSkippedDirectory(path: string, skipped: Set<string>) {
  if (!skipped.size) return false;
  return path.split("/").some((part) => skipped.has(part));
}

async function readDropEntries(root: HTMLElement, dataTransfer: DataTransfer | null) {
  const entries: UploadEntry[] = [];
  const skipped = skippedDirectoryNames(root);
  const items = Array.from(dataTransfer?.items || []);
  for (const item of items) {
    const entry = (item as DataTransferItem & {
        webkitGetAsEntry?: () => FileSystemEntryLike | null;
    }).webkitGetAsEntry?.();
    if (entry) entries.push(...await readFileSystemEntry(entry, "", skipped));
    else {
      const file = item.getAsFile?.();
      if (file) entries.push({ file, path: file.name });
    }
  }
  if (!entries.length) {
    Array.from(dataTransfer?.files || []).forEach((file) => {
        entries.push({ file, path: file.name });
    });
  }
  return entries;
}

async function readFileSystemEntry(
  entry: FileSystemEntryLike,
  parentPath: string,
  skipped: Set<string>,
): Promise<UploadEntry[]> {
  const name = toText(entry.name);
  const path = [parentPath, name].filter(Boolean).join("/");
  if (hasSkippedDirectory(path, skipped)) return [];
  if (entry.isFile) return [await readFileEntry(entry, path)];
  if (!entry.isDirectory || !entry.createReader) return [];
  const children = await readDirectoryEntries(entry);
  const nested = await Promise.all(children.map((child) => readFileSystemEntry(child, path, skipped)));
  return nested.flat();
}

function readFileEntry(entry: FileSystemEntryLike, path: string) {
  return new Promise<UploadEntry>((resolve, reject) => {
      entry.file?.((file) => resolve({ file, path: path || file.name }));
      if (!entry.file) reject(new Error("Missing file entry."));
  });
}

function readDirectoryEntries(entry: FileSystemEntryLike) {
  return new Promise<FileSystemEntryLike[]>((resolve) => {
      const out: FileSystemEntryLike[] = [];
      const reader = entry.createReader?.();
      const read = () => {
        reader?.readEntries((entries) => {
            if (!entries.length) {
              resolve(out);
              return;
            }
            out.push(...entries);
            read();
        });
      };
      read();
  });
}

export {
  closestDropRoot,
  dataTransferHasFiles,
  hasSkippedDirectory,
  preventFileDragDefault,
  readDropEntries,
  relatedTargetInside,
  skippedDirectoryNames,
};
