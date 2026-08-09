import { copy_button } from "#k632wzgl64a3";
import { code_block } from "#c55llzkpl4ob";
import { ModalContent, ModalRoot } from "#2eo44c56ebfi";
import { card } from "#hzrmwbvgt2ax";

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
    <div className="inline-row gap-xs lh-xs">
    <strong className="text-muted lh-xs">{label}:</strong>
    <span className="text-break lh-xs" id={id}></span>
    </div>
  );
}

function detailSummary(model: any) {
  return card({
      className: "column gap-xs log-detail-summary",
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
    <div className="title-desc column gap-sm">
    <div className="inline-row gap-sm">
    <h3>{model.t("logEntry")}</h3>
    <div className="right">
    {copyAction(
        `#${model.ids.detailRaw}`,
        model.t("copyLogEntry"),
        model.t("copyLogEntry"),
    )}
    </div>
    </div>
    <div className="text-muted">{model.t("logEntryDescription")}</div>
    </div>
  );
}

function textDetailSection(
  label: string,
  id: string,
  title: string,
  tooltip: string,
) {
  return card({
      className: "column gap-xs",
      children: (
        <>
        <div className="inline-row gap-sm">
        <span className="label">{label}</span>
        <div className="right">{copyAction(`#${id}`, title, tooltip)}</div>
        </div>
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
      className: "column gap-xs",
      children: (
        <>
        <div className="inline-row gap-sm">
        <span className="label">{label}</span>
        <div className="right">{copyAction(`#${id}`, title, tooltip)}</div>
        </div>
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
    <ModalContent className="column gap-sm width-xl3 height-xl4 scroll">
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
