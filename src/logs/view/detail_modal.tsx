import { copy_button } from "#k632wzgl64a3";
import { code_block } from "#c55llzkpl4ob";
import { ModalContent, ModalRoot } from "#2eo44c56ebfi";
import {
  InlineRow,
  Stack,
  Text,
  card,
  primitiveStackClassName,
} from "#hzrmwbvgt2ax";

function copyAction(target: string, title: string, tooltip: string) {
  return copy_button({
      size: "sm",
      target,
      title,
      tooltip,
  });
}

function summaryRow(label: string, id: string) {
  return (
    <InlineRow className="lh-xs" gap="xs">
    <Text as="strong" className="lh-xs" muted>{label}:</Text>
    <Text breakWord className="lh-xs" id={id}></Text>
    </InlineRow>
  );
}

function detailSummary(model: any) {
  return card({
      className: "log-detail-summary",
      gap: "xs",
      children: (
        <>
        {summaryRow(model.t("timestamp"), model.ids.detailTimestamp)}
        {summaryRow(model.t("level"), model.ids.detailLevel)}
        {summaryRow(model.t("group"), model.ids.detailGroup)}
        {summaryRow(model.t("source"), model.ids.detailSource)}
        </>
      ),
  });
}

function detailTitle(model: any) {
  return (
    <Stack className="title-desc" gap="sm">
    <InlineRow gap="sm">
    <h3>{model.t("logEntry")}</h3>
    <div className="right">
    {copyAction(
        `#${model.ids.detailRaw}`,
        model.t("copyLogEntry"),
        model.t("copyLogEntry"),
    )}
    </div>
    </InlineRow>
    <Text muted>{model.t("logEntryDescription")}</Text>
    </Stack>
  );
}

function textDetailSection(
  label: string,
  id: string,
  title: string,
  tooltip: string,
) {
  return card({
      gap: "xs",
      children: (
        <>
        <InlineRow gap="sm">
        <span className="label">{label}</span>
        <div className="right">{copyAction(`#${id}`, title, tooltip)}</div>
        </InlineRow>
        <p id={id} className="log-detail-message"></p>
        </>
      ),
  });
}

function codeDetailSection(
  label: string,
  id: string,
  title: string,
  tooltip: string,
  attrs: any,
) {
  return card({
      id: attrs.wrapId,
      gap: "xs",
      children: (
        <>
        <InlineRow gap="sm">
        <span className="label">{label}</span>
        <div className="right">{copyAction(`#${id}`, title, tooltip)}</div>
        </InlineRow>
        {code_block({
              codeProps: attrs.codeProps,
              id,
              language: "json",
        })}
        </>
      ),
  });
}

function logDetailModal(model: any) {
  return (
    <ModalRoot id={model.ids.detailModal}>
    <ModalContent className={primitiveStackClassName({ className: "width-xl3 height-xl4 scroll", gap: "sm" })}>
    {detailTitle(model)}
    {detailSummary(model)}
    {textDetailSection(
        model.t("message"),
        model.ids.detailMessage,
        model.t("copyMessage"),
        model.t("copyMessage"),
    )}
    {codeDetailSection(
        model.t("metadata"),
        model.ids.detailMeta,
        model.t("copyMetadata"),
        model.t("copyMetadata"),
        {
          codeProps: { "data-log-detail-meta": "" },
          wrapId: model.ids.detailMetaWrap,
        },
    )}
    {codeDetailSection(
        model.t("raw"),
        model.ids.detailRaw,
        model.t("copyRawLog"),
        model.t("copyRawLog"),
        {
          codeProps: { "data-log-detail-raw": "" },
        },
    )}
    </ModalContent>
    </ModalRoot>
  );
}

export { logDetailModal };
