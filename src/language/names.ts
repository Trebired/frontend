function languageName(code: unknown) {
  const tag = String(code == null ? "" : code).trim();
  if (!tag) return "";
  try {
    const name = String(new Intl.DisplayNames([tag], { type: "language" }).of(tag) || "").trim();
    if (!name || name.toLowerCase() === tag.toLowerCase()) return "";
    return name.charAt(0).toLocaleUpperCase(tag) + name.slice(1);
  } catch {
    return "";
  }
}

export { languageName };
