function str(value: unknown) {
  return typeof value === "string" ? value : String(value == null ? "" : value);
}

function stripPrefix(value: string, prefix: string) {
  return prefix && value.startsWith(prefix)
  ? value.slice(prefix.length)
  : value;
}

function stripSuffix(value: string, suffix: string) {
  return suffix && value.endsWith(suffix)
  ? value.slice(0, value.length - suffix.length)
  : value;
}

function ensureAffix(raw: unknown, prefix = "", suffix = "") {
  let value = str(raw);
  if (prefix && !value.startsWith(prefix))
  value = prefix + stripPrefix(value, prefix);
  if (suffix && !value.endsWith(suffix))
  value = stripSuffix(value, suffix) + suffix;
  if (prefix && suffix && value.length < prefix.length + suffix.length)
  return prefix + suffix;
  if (prefix && value.length < prefix.length) return prefix;
  if (suffix && value.length < suffix.length) return suffix;
  return value;
}

function setCaretSafe(input: HTMLInputElement, position: number) {
  try {
    input.setSelectionRange(position, position);
  } catch {}
}

function clampCaret(input: HTMLInputElement, prefix = "", suffix = "") {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  if (typeof start !== "number" || typeof end !== "number" || start !== end)
  return;
  const min = prefix ? prefix.length : 0;
  const max = suffix
  ? Math.max(min, input.value.length - suffix.length)
  : input.value.length;
  const next = Math.min(Math.max(start, min), max);
  if (next !== start) setCaretSafe(input, next);
}

function bindInputAffix(
  input: HTMLInputElement | null,
  options: { prefix?: string; suffix?: string } = {},
) {
  if (!(input instanceof HTMLInputElement)) return false;
  const prefix = str(options.prefix);
  const suffix = str(options.suffix);
  if (!prefix && !suffix) return false;
  input.value = ensureAffix(input.value, prefix, suffix);
  input.addEventListener("input", () => {
      const fixed = ensureAffix(input.value, prefix, suffix);
      if (fixed !== input.value) input.value = fixed;
      clampCaret(input, prefix, suffix);
  });
  input.addEventListener("click", () => clampCaret(input, prefix, suffix));
  input.addEventListener("focus", () => clampCaret(input, prefix, suffix));
  return true;
}

const inputAffix = Object.freeze({ bind: bindInputAffix, ensure: ensureAffix });

export { bindInputAffix, ensureAffix };
export default inputAffix;
