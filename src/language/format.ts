function safeNumber(value: unknown) {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

function formatCount(value: unknown, locale?: string) {
  return Math.max(0, safeNumber(value)).toLocaleString(locale || undefined);
}

function formatCompactBytes(value: unknown, locale?: string) {
  const bytes = Math.max(0, safeNumber(value));
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  if (bytes < 1024) return `${formatCount(bytes, locale)} B`;
  let amount = bytes;
  let unitIndex = 0;
  while (amount >= 1024 && unitIndex < units.length - 1) {
    amount /= 1024;
    unitIndex += 1;
  }
  const digits = amount >= 10 ? 1 : 2;
  return `${amount.toLocaleString(locale || undefined, {
  maximumFractionDigits: digits,
  minimumFractionDigits: 0,
  })} ${units[unitIndex]}`;
}

function formatDateTime(value: unknown, locale?: string) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const date = new Date(raw);
  if (!Number.isFinite(date.getTime())) return raw;
  return date.toLocaleString(locale || undefined);
}

function formatLanguagePercent(value: unknown, digits = 1) {
  return Math.max(0, Math.min(100, safeNumber(value))).toFixed(digits);
}

export {
  formatCompactBytes,
  formatCount,
  formatDateTime,
  formatLanguagePercent,
  safeNumber,
};
