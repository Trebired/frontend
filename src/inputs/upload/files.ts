import { splitTokens, toText } from "./text.js";

const IMAGE_ACCEPT_VALUES = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".webp",
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function fileExtension(file: File | null, options: { withDot?: boolean } = {}) {
  const name = toText(file?.name).toLowerCase();
  const index = name.lastIndexOf(".");
  if (index < 0) return "";
  const ext = name.slice(index);
  return options.withDot === true ? ext : ext.slice(1);
}

function isImageAcceptItem(value: string) {
  const item = toText(value).toLowerCase();
  return IMAGE_ACCEPT_VALUES.has(item) || item === "image/*" || item.startsWith("image/");
}

function isImageFileObject(file: unknown) {
  if (!(file instanceof File)) return false;
  const type = toText(file.type).toLowerCase();
  return type.startsWith("image/") || isImageAcceptItem(`.${fileExtension(file)}`);
}

function parseAcceptList(value: unknown) {
  return splitTokens(value).map((item) => item.toLowerCase());
}

function matchesAccept(file: File | null, acceptList: string[]) {
  if (!(file instanceof File)) return false;
  if (!acceptList.length) return true;
  const name = toText(file.name).toLowerCase();
  const type = toText(file.type).toLowerCase();
  const ext = fileExtension(file, { withDot: true });
  return acceptList.some((rule) => {
    if (!rule) return false;
    if (rule === "*/*") return true;
    if (rule.startsWith(".")) return rule === ext || name.endsWith(rule);
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

function formatLabels(acceptItems: string[]) {
  const seen = new Set<string>();
  const labels: string[] = [];
  acceptItems.forEach((item) => {
    const raw = item.startsWith(".")
      ? item.slice(1)
      : item.endsWith("/*")
        ? item.slice(0, -2)
        : item.replace(/^image\//u, "");
    const label = raw.toUpperCase();
    if (!label || seen.has(label)) return;
    seen.add(label);
    labels.push(label);
  });
  return labels;
}

function inputEntries(input: HTMLInputElement | null) {
  if (!input?.files?.length) return [];
  return Array.from(input.files).map((file) => {
    const path = toText((file as File & { webkitRelativePath?: string }).webkitRelativePath, file.name);
    return { file, path };
  });
}

export {
  fileExtension,
  formatLabels,
  inputEntries,
  isImageAcceptItem,
  isImageFileObject,
  matchesAccept,
  parseAcceptList,
};
