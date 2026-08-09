import { createElement } from "react";
import content from "./content";
import { canvas_panel } from "#kwgj7f15gqem";
import { createLogsViewModel } from "./view/model";
import { logDetailModal } from "./view/detail_modal";
import { logsStatsPanel } from "./view/stats";
import { logsToolbar } from "./view/toolbar";
import type { view_props } from "./view/model";

function jsonScriptConfig(config: Record<string, unknown>) {
  return {
    __html: JSON.stringify(config).replace(/</g, "\\u003c"),
  };
}

function view(props: view_props) {
  const model = createLogsViewModel(props);
  return createElement(
    "div",
    {
      id: model.ids.root,
      className: model.resolvedRootClassName,
      "data-tbf-logs-partial": "",
      "data-logs-instance-id": model.logsInstanceId,
    },
    <>
    <script
    data-logs-view-config=""
    hidden
    type="application/json"
    dangerouslySetInnerHTML={jsonScriptConfig({
          fullscreenGroup: model.logsExtendGroup,
          fullscreenId: model.logsInstanceId,
    })}
    />
    {canvas_panel({
          content: content({ ids: model.ids }),
          contentClassName: "padding-xs column log-box-shell",
          extendGroup: model.logsExtendGroup,
          extendId: model.logsInstanceId,
          panelClassName: model.panelClassName,
          scroll: true,
          title: model.title,
          toolbarContent: logsToolbar(model),
    })}
    {logsStatsPanel(model)}
    {logDetailModal(model)}
    </>,
  );
}

export type { view_props };
export default view;
