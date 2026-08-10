import tabs, { tab_panel } from "#92vilwel70ga";
import { formatLanguagePercent } from "#k0q2s2kidqtq";
import {
  Stack,
  Text,
  primitiveGapClass,
  primitiveStackClassName,
  primitiveTextClassName,
} from "#hzrmwbvgt2ax";
import { safeId, text, translate } from "#kv9urtb9dbq5";
import { source_language_card } from "./card.js";
import type {
  SourceLanguageBucket,
  SourceLanguageTabsContentProps,
} from "#2w72xmq6rvza";

function sourceLanguageBucketPanelId(bucket: SourceLanguageBucket) {
  return `source_language_bucket_${bucket}_panel`;
}

function matchesBucket(language: any, bucket: SourceLanguageBucket) {
  return bucket === "everything" || text(language && language.viz_bucket) === bucket;
}

function visualLanguageCards(model: SourceLanguageTabsContentProps) {
  const repository =
  model.repository && typeof model.repository === "object" ? model.repository : {};
  const detailsById =
  repository.languageDetailsById && typeof repository.languageDetailsById === "object"
  ? repository.languageDetailsById
  : {};
  const visualLanguages = Array.isArray(model.visualLanguages)
  ? model.visualLanguages
  : [];
  return visualLanguages.map((language: any) => ({
        details: detailsById[text(language && language.id).toLowerCase()] || null,
        language,
        repository,
  }));
}

function bucketedLanguageCards(
  model: SourceLanguageTabsContentProps,
  bucket: SourceLanguageBucket,
) {
  return visualLanguageCards(model)
  .filter((entry: any) => matchesBucket(entry.language, bucket))
  .map((entry: any) => ({
        ...entry,
        modalId: `source_language_detail_${safeId(entry.language && entry.language.viz_id)}_${bucket}`,
  }));
}

function distributionSegment(language: any, index: number, lang?: string) {
  const percent = Number(language && language.percent) || 0;
  const languageName = text(
    language && language.name,
    translate(lang, "unknownLanguage"),
  );
  return (
    <span
    key={`source_language_distribution_${index}`}
    className="tbf-source-language-distribution-segment"
    data-tbf-source-language-overview-segment=""
    data-tbf-source-language-id={text(language && language.viz_id)}
    data-tbf-source-language-color={text(language && language.color)}
    title={`${languageName} / ${formatLanguagePercent(percent)}%`}
    style={{
        width: `${Math.max(0, Math.min(100, percent))}%`,
        background: text(language && language.color, "var(--tbf-language-color, currentColor)"),
    }}
    />
  );
}

function languageDistribution(
  languages: any[],
  bucket: SourceLanguageBucket,
  lang?: string,
) {
  return (
    <div
    className="tbf-source-language-distribution"
    data-tbf-source-language-overview=""
    data-tbf-source-language-panel-bucket={bucket}
    role="img"
    aria-label={translate(lang, "languageSizeDistribution")}
    >
    {languages.map((language, index) => distributionSegment(language, index, lang))}
    </div>
  );
}

function emptyState(lang: string | undefined, bucket: SourceLanguageBucket, hidden: boolean) {
  return (
    <div
    data-tbf-source-language-empty-state=""
    data-tbf-source-language-panel-bucket={bucket}
    className={primitiveTextClassName({ muted: true })}
    hidden={hidden}
    >
    {translate(lang, "noLanguagesInTab")}
    </div>
  );
}

function languageList(model: SourceLanguageTabsContentProps, bucket: SourceLanguageBucket) {
  const cards = bucketedLanguageCards(model, bucket);
  return (
    <div
    className="max-height-xl scroll scroll-min"
    data-tbf-source-language-list=""
    data-tbf-source-language-panel-bucket={bucket}
    >
    <Stack gap="sm">
    {cards.map((entry: any, index: number) => (
          <div key={`source_language_card_${index}`} data-tbf-source-language-list-item="">
          {source_language_card({ ...entry, lang: model.lang, locale: model.locale })}
          </div>
    ))}
    </Stack>
    </div>
  );
}

function languagePanel(model: SourceLanguageTabsContentProps, bucket: SourceLanguageBucket) {
  const visualLanguages = Array.isArray(model.visualLanguages)
  ? model.visualLanguages
  : [];
  const languages = visualLanguages.filter((language: any) =>
    matchesBucket(language, bucket),
  );
  return (
    <Stack gap="sm" data-tbf-source-language-panel-bucket={bucket}>
    {languageDistribution(languages, bucket, model.lang)}
    {languageList(model, bucket)}
    {emptyState(model.lang, bucket, languages.length > 0)}
    </Stack>
  );
}

function bucketTabItems(lang?: string) {
  return [
    {
      buttonAttributes: { "data-tbf-source-language-bucket-tab": "everything" },
      defaultActive: true,
      id: sourceLanguageBucketPanelId("everything"),
      label: translate(lang, "everything"),
      route: "everything",
      value: "everything",
    },
    {
      buttonAttributes: {
        "aria-description": translate(lang, "codeFilesDescription"),
        "data-tbf-source-language-bucket-tab": "repository",
      },
      id: sourceLanguageBucketPanelId("repository"),
      label: translate(lang, "codeFiles"),
      route: "repository",
      value: "repository",
    },
    {
      buttonAttributes: {
        "aria-description": translate(lang, "assetsAndConfigDescription"),
        "data-tbf-source-language-bucket-tab": "supporting",
      },
      id: sourceLanguageBucketPanelId("supporting"),
      label: translate(lang, "assetsAndConfig"),
      route: "supporting",
      value: "supporting",
    },
  ];
}

function sourceLanguageTabs(model: SourceLanguageTabsContentProps) {
  return tabs({
      familyKey: "source-language-bucket",
      items: bucketTabItems(model.lang),
      listAttributes: { "data-tbf-source-language-bucket-tabs": "" },
      listClassName: primitiveGapClass("sm"),
      rootAttributes: { "data-tbf-source-language-bucket-tabs-root": "" },
      rootClassName: primitiveStackClassName({ gap: "sm" }),
  });
}

function sourceLanguageTabPanels(model: SourceLanguageTabsContentProps) {
  return (["everything", "repository", "supporting"] as SourceLanguageBucket[]).map(
    (bucket) =>
    tab_panel({
        className: primitiveStackClassName({ gap: "sm" }),
        defaultActive: bucket === "everything",
        familyKey: "source-language-bucket",
        id: sourceLanguageBucketPanelId(bucket),
        route: bucket,
        children: languagePanel(model, bucket),
    }),
  );
}

function source_language_tabs_content(model: SourceLanguageTabsContentProps) {
  const visualLanguages = Array.isArray(model.visualLanguages)
  ? model.visualLanguages
  : [];
  if (!visualLanguages.length) {
    return <Text muted>{translate(model.lang, "noLanguageScan")}</Text>;
  }
  return (
    <>
    {sourceLanguageTabs(model)}
    {sourceLanguageTabPanels(model)}
    </>
  );
}

const SourceLanguageTabsContent = source_language_tabs_content;

export { SourceLanguageTabsContent, source_language_tabs_content };
export type { SourceLanguageBucket, SourceLanguageTabsContentProps };
