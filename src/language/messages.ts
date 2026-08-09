type MessageVars = Record<string, unknown>;

type LanguageMessages = Record<string, string>;

const EN_MESSAGES: LanguageMessages = {
  assetsAndConfig: "Assets and config",
  assetsAndConfigDescription:
    "Assets, configuration, data files, docs, and other supporting files",
  codeFiles: "Code files",
  codeFilesDescription: "Application and runtime code used by the repository",
  codeLines: "Code lines:",
  copyFilePaths: "Copy file paths",
  cs: "Czech",
  details: "{{name}} details",
  detailsButton: "Details",
  detailsDescription:
    "Review the repository files and language totals that contributed to this language breakdown.",
  detected: "{{count}} detected",
  detectedSubset: "{{active}} of {{total}} detected",
  en: "English",
  everything: "Everything",
  extensions: "Extensions",
  files: "Files",
  filesDescription: "Exact matching files for this language.",
  label: "Select language",
  languageExcludeTooltip: "Click to exclude this language from the visualization",
  languageIncludeTooltip: "Click to include this language in the visualization",
  languageSizeDistribution: "Language size distribution",
  languages: "Languages",
  lineCount: "{{count}} lines",
  lines: "Lines",
  loadingMatchingFiles: "Loading matching files...",
  noCodeFilesInTab: "No code files detected in this tab.",
  noLanguageScan: "No language scan available yet.",
  noLanguagesInTab: "No languages detected in this tab.",
  noMatchingFiles: "No matching files found.",
  noRepositoryTreeAvailable: "No repository tree is available yet.",
  noSupportingFilesInTab:
    "No assets, config, docs, or other supporting files detected in this tab.",
  none: "None",
  noneExtension: "(none)",
  openDetails: "Open language details for {{name}}",
  repositoryContentScanFailed: "Failed to scan repository content.",
  repositoryLanguageScanComplete: "Language scan complete.",
  repositoryLanguageScanCounting: "Counting repository files...",
  repositoryLanguageScanFailed: "Language scan failed.",
  repositoryLanguageScanQueued: "Language scan is queued.",
  repositoryLanguageScanSaving: "Saving language scan...",
  resetFilter: "Reset filter",
  scanAnalyzing: "Analyzing repository files...",
  scanComplete: "Language scan complete.",
  scanCounting: "Counting repository files...",
  scanFailed: "Language scan failed.",
  scanQueued: "Language scan is queued.",
  scanSaving: "Saving language scan...",
  scanned: "Scanned:",
  share: "Share",
  sourceLanguageRuntimeFailed: "Source language runtime failed.",
  summary: "Summary",
  summaryDescription: "Repository totals and file breakdown for this language.",
  totalSize: "Total size",
  totalSizeLabel: "Total size:",
  unknown: "Unknown",
  unknownLanguage: "Unknown",
};

const CS_MESSAGES: LanguageMessages = {
  assetsAndConfig: "Assety a konfigurace",
  assetsAndConfigDescription:
    "Assety, konfigurace, datove soubory, dokumentace a dalsi podpurne soubory",
  codeFiles: "Soubory kodu",
  codeFilesDescription: "Aplikacni a runtime kod pouzivany repozitarem",
  codeLines: "Radky kodu:",
  copyFilePaths: "Kopirovat cesty souboru",
  cs: "Cestina",
  details: "Podrobnosti jazyka {{name}}",
  detailsButton: "Podrobnosti",
  detailsDescription:
    "Zkontrolujte soubory repozitare a jazykove soucty, ktere prispely k tomuto rozpisu jazyku.",
  detected: "{{count}} nalezeno",
  detectedSubset: "{{active}} z {{total}} nalezeno",
  en: "Anglictina",
  everything: "Vse",
  extensions: "Pripony",
  files: "Soubory",
  filesDescription: "Presne odpovidajici soubory pro tento jazyk.",
  label: "Vybrat jazyk",
  languageExcludeTooltip: "Kliknutim tento jazyk z vizualizace vyloucite",
  languageIncludeTooltip: "Kliknutim tento jazyk do vizualizace zahrnete",
  languageSizeDistribution: "Rozdeleni velikosti podle jazyku",
  languages: "Jazyky",
  lineCount: "{{count}} radku",
  lines: "Radky",
  loadingMatchingFiles: "Nacitam odpovidajici soubory...",
  noCodeFilesInTab: "V teto zalozce nebyly nalezeny zadne soubory kodu.",
  noLanguageScan: "Zatim neni k dispozici zadny sken jazyku.",
  noLanguagesInTab: "V teto zalozce nebyly nalezeny zadne jazyky.",
  noMatchingFiles: "Nebyly nalezeny zadne odpovidajici soubory.",
  noRepositoryTreeAvailable: "Strom repozitare zatim neni dostupny.",
  noSupportingFilesInTab:
    "V teto zalozce nebyly nalezeny zadne assety, konfigurace, dokumentace ani jine podpurne soubory.",
  none: "Zadne",
  noneExtension: "(zadna)",
  openDetails: "Otevrit podrobnosti jazyka {{name}}",
  repositoryContentScanFailed: "Obsah repozitare se nepodarilo proskenovat.",
  repositoryLanguageScanComplete: "Sken jazyku dokoncen.",
  repositoryLanguageScanCounting: "Pocitam soubory repozitare...",
  repositoryLanguageScanFailed: "Sken jazyku selhal.",
  repositoryLanguageScanQueued: "Sken jazyku ceka ve fronte.",
  repositoryLanguageScanSaving: "Ukladam sken jazyku...",
  resetFilter: "Resetovat filtr",
  scanAnalyzing: "Analyzuji soubory repozitare...",
  scanComplete: "Sken jazyku dokoncen.",
  scanCounting: "Pocitam soubory repozitare...",
  scanFailed: "Sken jazyku selhal.",
  scanQueued: "Skenovani jazyku ceka ve fronte.",
  scanSaving: "Ukladam sken jazyku...",
  scanned: "Skenovano:",
  share: "Podil",
  sourceLanguageRuntimeFailed: "Runtime jazyku selhal.",
  summary: "Souhrn",
  summaryDescription: "Soucty repozitare a rozpad souboru pro tento jazyk.",
  totalSize: "Celkova velikost",
  totalSizeLabel: "Celkova velikost:",
  unknown: "Neznamy",
  unknownLanguage: "Nezname",
};

const MESSAGE_TABLES: Record<string, LanguageMessages> = {
  cs: CS_MESSAGES,
  en: EN_MESSAGES,
};

function normalizeLocale(value: unknown) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw.startsWith("cs")) return "cs";
  return "en";
}

function interpolate(message: string, vars: MessageVars = {}) {
  return Object.entries(vars).reduce((next, [key, value]) => {
    return next
      .split(`{{${key}}}`)
      .join(String(value ?? ""))
      .split(`{${key}}`)
      .join(String(value ?? ""));
  }, message);
}

function sourceLanguageMessage(
  key: string,
  lang?: string,
  vars?: MessageVars,
) {
  const locale = normalizeLocale(lang);
  const table = MESSAGE_TABLES[locale] || EN_MESSAGES;
  return interpolate(table[key] || EN_MESSAGES[key] || key, vars);
}

function documentLanguage() {
  if (typeof document === "undefined") return "en";
  return normalizeLocale(document.documentElement.getAttribute("lang"));
}

export { documentLanguage, normalizeLocale, sourceLanguageMessage };
export type { MessageVars };
