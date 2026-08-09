import { copy_button } from "#k632wzgl64a3";
import { ModalContent, ModalRoot } from "#2eo44c56ebfi";
import {
  InlineRow,
  Stack,
  Text,
  TitleDescription,
  card,
  primitiveStackClassName,
} from "#hzrmwbvgt2ax";
import { key_value } from "#kkjo6xogukzx";
import {
  formatCompactBytes,
  formatCount,
  formatLanguagePercent,
  safeNumber,
} from "#k0q2s2kidqtq";
import { text, translate } from "#kv9urtb9dbq5";
import type { SourceLanguageModalProps } from "#2w72xmq6rvza";

function extensionText(extensions: any[], lang?: string, locale?: string) {
  if (!extensions.length) return translate(lang, "none");
  return extensions
    .map((entry) => {
      const ext = text(entry && entry.ext, translate(lang, "noneExtension"));
      const count = safeNumber(entry && entry.count);
      return `${ext} / ${formatCount(count, locale || lang)}`;
    })
    .join(", ");
}

function sourceLanguageModalModel(props: SourceLanguageModalProps) {
  const item =
    props.language && typeof props.language === "object" ? props.language : {};
  const detail =
    props.details && typeof props.details === "object" ? props.details : {};
  const id = text(props.modalId);
  const languageName = text(item.name, translate(props.lang, "unknown"));
  const files = Array.isArray(detail.files) ? detail.files : [];
  const extensions = Array.isArray(detail.extensions) ? detail.extensions : [];
  const repository =
    props.repository && typeof props.repository === "object" ? props.repository : {};
  const highlightedPaths = files
    .map((file: any) => text(file && file.rel_path))
    .filter(Boolean);
  return {
    detail,
    extensionText: extensionText(extensions, props.lang, props.locale),
    fileTreeConfig: JSON.stringify({
      emptyMessage: translate(props.lang, "noMatchingFiles"),
      highlightedPaths,
      repositoryBase: text(repository.url),
    }),
    files,
    id,
    item,
    languageName,
    matchingPathsId: `${id}_file_paths_copy`,
    matchingPathsText: highlightedPaths.join("\n"),
  };
}

function summaryRows(
  model: ReturnType<typeof sourceLanguageModalModel>,
  props: SourceLanguageModalProps,
) {
  const locale = props.locale || props.lang;
  return [
    { label: translate(props.lang, "files"), value: formatCount(model.detail.file_count, locale) },
    {
      label: translate(props.lang, "totalSize"),
      value: formatCompactBytes(model.detail.total_bytes, locale),
    },
    { label: translate(props.lang, "lines"), value: formatCount(model.detail.total_lines, locale) },
    { label: translate(props.lang, "share"), value: `${formatLanguagePercent(model.item.percent)}%` },
    { label: translate(props.lang, "extensions"), value: model.extensionText },
  ];
}

function sourceLanguageModalSummaryCard(
  model: ReturnType<typeof sourceLanguageModalModel>,
  props: SourceLanguageModalProps,
) {
  return card({
    gap: "sm",
    children: (
      <>
        <TitleDescription
          className="title-desc"
          description={translate(props.lang, "summaryDescription")}
          descriptionSize="sm"
          level={4}
          title={translate(props.lang, "summary")}
        />
        <Stack gap="sm">
          {key_value({ rows: summaryRows(model, props), separated: true })}
        </Stack>
      </>
    ),
  });
}

function filesHeader(
  model: ReturnType<typeof sourceLanguageModalModel>,
  props: SourceLanguageModalProps,
) {
  return (
    <Stack className="title-desc" gap="sm">
      <InlineRow gap="sm">
        <h4>{translate(props.lang, "files")}</h4>
        {model.matchingPathsText ? (
          <div className="right">
            {copy_button({
              size: "sm",
              target: `#${model.matchingPathsId}`,
              title: translate(props.lang, "copyFilePaths"),
              tooltip: translate(props.lang, "copyFilePaths"),
            })}
          </div>
        ) : null}
      </InlineRow>
      <Text as="p" muted size="sm">{translate(props.lang, "filesDescription")}</Text>
    </Stack>
  );
}

function filesCard(
  model: ReturnType<typeof sourceLanguageModalModel>,
  props: SourceLanguageModalProps,
) {
  return card({
    gap: "sm",
    children: (
      <>
        {filesHeader(model, props)}
        {model.matchingPathsText ? <code id={model.matchingPathsId} hidden>{model.matchingPathsText}</code> : null}
        <Stack
          id={`${model.id}_file_tree`}
          gap="sm"
          data-tbf-source-language-file-tree-root=""
          data-tbf-source-language-file-tree-config={model.fileTreeConfig}
        >
          <Text muted size="sm">
            {model.files.length
              ? translate(props.lang, "loadingMatchingFiles")
              : translate(props.lang, "noMatchingFiles")}
          </Text>
        </Stack>
      </>
    ),
  });
}

function source_language_modal(props: SourceLanguageModalProps) {
  const model = sourceLanguageModalModel(props);
  if (!model.id) return null;
  return (
    <ModalRoot id={model.id}>
      <ModalContent className={primitiveStackClassName({ className: "width-xl3 height-xl4 scroll", gap: "sm" })}>
        <TitleDescription
          className="title-desc"
          description={translate(props.lang, "detailsDescription")}
          title={translate(props.lang, "details", { name: model.languageName })}
        />
        {sourceLanguageModalSummaryCard(model, props)}
        {filesCard(model, props)}
      </ModalContent>
    </ModalRoot>
  );
}

const SourceLanguageModal = source_language_modal;

export { SourceLanguageModal, source_language_modal };
export type { SourceLanguageModalProps };
