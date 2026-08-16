import { Icon } from "#lbkpzw8nphru";
import { button } from "#6hfutrhvm6x6";
import { card_body } from "#2ozv7qbfhpgm";
import { card_segments } from "#8sesrhm9y9pv";
import {
  formatCompactBytes,
  formatCount,
  formatLanguagePercent,
  safeNumber,
} from "#k0q2s2kidqtq";
import { safeId, text, translate } from "#kv9urtb9dbq5";
import { source_language_modal } from "./modal.js";
import type { SourceLanguageCardProps } from "#2w72xmq6rvza";
import { Text } from "#hzrmwbvgt2ax";
import { frontendClassName, frontendCssVar, frontendDataAttr, frontendDataAttrs } from "#5vbaqj4pirp3";

function sourceLanguageCardModel(props: SourceLanguageCardProps) {
  const payload =
  props.item && typeof props.item === "object" ? props.item : {};
  const repository =
  props.repository && typeof props.repository === "object"
  ? props.repository
  : payload.repository && typeof payload.repository === "object"
  ? payload.repository
  : null;
  const details =
  props.details && typeof props.details === "object"
  ? props.details
  : payload.details && typeof payload.details === "object"
  ? payload.details
  : null;
  const language =
  props.language && typeof props.language === "object"
  ? props.language
  : payload.language && typeof payload.language === "object"
  ? payload.language
  : payload;
  const languageName = text(language.name, translate(props.lang, "unknown"));
  return {
    bytes: safeNumber(language.bytes),
    details,
    language,
    languageIconSpec: text(language.icon),
    languageName,
    lineCount: safeNumber(language.lines && language.lines.code),
    modalId:
    text(props.modalId) ||
      `source_language_detail_${safeId(language.viz_id || languageName)}`,
    percent: safeNumber(language.percent),
    repository,
  };
}

function detailButton(
  model: ReturnType<typeof sourceLanguageCardModel>,
  lang?: string,
) {
  return button({
      type: "button",
      "aria-controls": model.modalId,
      "aria-label": translate(lang, "openDetails", { name: model.languageName }),
      [frontendDataAttr("modal-open")]: "",
      title: translate(lang, "detailsButton"),
      className: "icon sm has-tooltip",
      children: <Icon spec="remixicon information-line" />,
  });
}

function languageSegments(
  model: ReturnType<typeof sourceLanguageCardModel>,
  lang?: string,
  locale?: string,
) {
  return card_segments({
      rows: [
        {
          segments: [
            {
              value: (
                <Text muted>
                <span {...frontendDataAttrs({ "source-language-percent": "" })}>
                {formatLanguagePercent(model.percent)}
                </span>
                %
                </Text>
              ),
            },
            { value: formatCompactBytes(model.bytes, locale || lang) },
            {
              value: translate(lang, "lineCount", {
                  count: formatCount(model.lineCount, locale || lang),
              }),
            },
          ],
        },
      ],
  });
}

function shareBar(model: ReturnType<typeof sourceLanguageCardModel>) {
  return (
    <div className={frontendClassName("source-language-share")}>
    <span
    className={frontendClassName("source-language-share-bar")}
    {...frontendDataAttrs({ "source-language-progress": "" })}
    style={{
        width: `${Math.max(0, Math.min(100, model.percent))}%`,
        background: text(model.language.color, `var(${frontendCssVar("language-color")}, currentColor)`),
    }}
    />
    </div>
  );
}

function iconNode(model: ReturnType<typeof sourceLanguageCardModel>) {
  if (!model.languageIconSpec) return null;
  return (
    <Icon
    spec={model.languageIconSpec}
    className="icon"
    {...frontendDataAttrs({ "source-language-icon": "" })}
    />
  );
}

function sourceLanguageDataAttrs(model: ReturnType<typeof sourceLanguageCardModel>) {
  return {
    [frontendDataAttr("source-language-row")]: "",
    [frontendDataAttr("source-language-id")]: text(model.language.viz_id),
    [frontendDataAttr("source-language-bucket")]: text(model.language.viz_bucket, "supporting"),
    [frontendDataAttr("source-language-name")]: model.languageName,
    [frontendDataAttr("source-language-color")]: text(model.language.color),
    [frontendDataAttr("source-language-bytes")]: String(model.bytes),
    [frontendDataAttr("source-language-lines")]: String(model.lineCount),
    role: "button",
    tabIndex: "0",
    "aria-pressed": "true",
  };
}

function source_language_card(props: SourceLanguageCardProps) {
  const model = sourceLanguageCardModel(props);
  return (
    <>
    {card_body({
          dataAttrs: sourceLanguageDataAttrs(model),
          icon: iconNode(model),
          title: model.languageName,
          actions: detailButton(model, props.lang),
          segments: languageSegments(model, props.lang, props.locale),
          extra: shareBar(model),
    })}
    {source_language_modal({
          details: model.details,
          lang: props.lang,
          locale: props.locale,
          language: model.language,
          modalId: model.modalId,
          repository: model.repository,
    })}
    </>
  );
}

const SourceLanguageCard = source_language_card;

export { SourceLanguageCard, source_language_card };
export type { SourceLanguageCardProps };
