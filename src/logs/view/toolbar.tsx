import { copy_button } from "#k632wzgl64a3";
import {
  FullscreenCloseButton,
  FullscreenOpenButton,
} from "#vbkfq413o3u7";
import { Icon as icon } from "#lbkpzw8nphru";
import checkbox from "#2ne919slwy5h";
import dropdown from "#79y0zfcyhzga";
import {
  button,
  pill,
  primitiveButtonClassName,
  primitiveCardClassName,
  primitiveGapClass,
} from "#hzrmwbvgt2ax";
import {
  actionTrigger,
  toString,
  type BindActionOptions,
} from "#aq4qe9opqpbm";

function groupDropdown(model: any) {
  return dropdown({
      className: "width-md",
      id: model.ids.groupDropdown,
      inputId: model.ids.groupInput,
      inputProps: { "data-log-filter-input": "group" },
      listId: model.ids.groupList,
      name: model.ids.groupInputName,
      options: [{ value: "all", label: model.t("all") }],
      placeholder: model.t("all"),
      rootProps: { "data-log-filter-dropdown": "group" },
      value: "all",
  });
}

function levelDropdown(model: any) {
  return dropdown({
      className: "width-md",
      id: model.ids.levelDropdown,
      inputId: model.ids.levelInput,
      inputProps: { "data-log-filter-input": "level" },
      listId: model.ids.levelList,
      name: model.ids.levelInputName,
      options: [{ value: "all", label: model.t("all") }],
      placeholder: model.t("all"),
      rootProps: { "data-log-filter-dropdown": "level" },
      value: "all",
  });
}

function platformToggle(model: any) {
  if (!model.showPlatformToggle) return null;
  return (
    <div data-logs-raw-hide="">
    {checkbox({
          bodyClassName: "logs-platform-toggle-body",
          checked: true,
          id: model.ids.platformToggle,
          input_attrs: {},
          optionClassName: [
            "logs-platform-toggle",
            primitiveCardClassName({
              className: "cursor-pointer no-shrink",
              layout: "none",
              padding: "xs",
            }),
            primitiveGapClass("xs"),
          ].join(" "),
          title: model.t("productLogs", { product: model.productName }),
    })}
    </div>
  );
}

function searchField(model: any) {
  return (
    <div className="logs-toolbar-search-field" data-logs-raw-hide="">
    <span className="logs-search-shell width-lg grow">
    <input
    id={model.ids.searchInput}
    type="search"
    placeholder={model.t("searchLogs")}
    autoComplete="off"
    className="input classic grow"
    />
    {icon({
          spec: "remixicon search-line",
          className: "input-search-icon",
    })}
    </span>
    </div>
  );
}

function primaryToolbarRow(model: any) {
  return (
    <div className="logs-toolbar-row logs-toolbar-row-primary">
    {pill({
          className: "width-xs",
          children: (
            <>
            <span id={model.ids.loaded}>0</span> {model.t("loadedSuffix")}
            </>
          ),
    })}
    <div className="logs-toolbar-filter" data-logs-raw-hide="">
    {groupDropdown(model)}
    </div>
    <div className="logs-toolbar-filter" data-logs-raw-hide="">
    {levelDropdown(model)}
    </div>
    {platformToggle(model)}
    {searchField(model)}
    </div>
  );
}

function toolbarButton(
  attrs: any,
  spec: string,
  trigger?: BindActionOptions,
  fullscreen?: { group: unknown; id: unknown; mode: "close" | "open" },
) {
  if (fullscreen) {
    const fullscreenProps = {
      ...attrs,
      className: primitiveButtonClassName({
        className: attrs.className,
        icon: true,
        size: "md",
        tooltip: true,
      }),
      fullscreenId: String(fullscreen.id || ""),
      group: String(fullscreen.group || "default"),
    };
    const node =
    fullscreen.mode === "close" ? (
      <FullscreenCloseButton {...fullscreenProps}>
      {icon({ spec })}
      </FullscreenCloseButton>
    ) : (
      <FullscreenOpenButton {...fullscreenProps}>
      {icon({ spec })}
      </FullscreenOpenButton>
    );
    return trigger ? actionTrigger(node, trigger) : node;
  }
  const node = (
    button({
      ...attrs,
      children: icon({ spec }),
      icon: true,
      size: "md",
      tooltip: true,
      type: "button",
    })
  );
  if (trigger) return actionTrigger(node, trigger);
  return node;
}

function searchToggleButton(model: any) {
  return toolbarButton(
    {
      "aria-label": model.t("searchLogsAction"),
      "data-logs-raw-hide": "",
      className: "logs-toolbar-search-toggle",
      id: model.ids.searchButton,
      title: model.t("searchLogsAction"),
    },
    "remixicon search-line",
    undefined,
    {
      group: model.logsExtendGroup,
      id: model.logsInstanceId,
      mode: "open",
    },
  );
}

function exportPopover(model: any) {
  if (!model.exportOptions.length) return null;
  return (
    <>
    {button({
          type: "button",
          "aria-controls": model.exportPopoverId,
          "aria-expanded": "false",
          title: model.t("exportLogs"),
          "aria-label": model.t("exportLogs"),
          icon: true,
          size: "md",
          tooltip: true,
          "data-tbf-popover-open": "",
          children: <>{icon({ spec: "remixicon download-2-line" })}</>,
    })}
    <div
    className="popover popover-portaled"
    id={model.exportPopoverId}
    aria-hidden="true"
    data-tbf-popover=""
    >
    {model.exportOptions.map((item: any) => (
          <a
          key={toString(item.href)}
          href={toString(item.href)}
          className="popover-close popover-item"
          data-tbf-popover-close=""
          >
          {toString(item.label)}
          </a>
    ))}
    </div>
    </>
  );
}

function fullscreenButtons(model: any) {
  return (
    <div className="right">
    {toolbarButton(
        {
          "aria-label": model.t("display.fullscreen"),
          title: model.t("display.fullscreen"),
        },
        "remixicon fullscreen-line",
        undefined,
        {
          group: model.logsExtendGroup,
          id: model.logsInstanceId,
          mode: "open",
        },
    )}
    {toolbarButton(
        {
          "aria-label": model.t("display.exitFullscreen"),
          "data-tbf-fullscreen-hidden": "true",
          title: model.t("display.exitFullscreen"),
        },
        "remixicon fullscreen-exit-line",
        undefined,
        {
          group: model.logsExtendGroup,
          id: model.logsInstanceId,
          mode: "close",
        },
    )}
    </div>
  );
}

function secondaryToolbarRow(model: any) {
  return (
    <div className="logs-toolbar-row logs-toolbar-row-secondary">
    {searchToggleButton(model)}
    {toolbarButton(
        {
          "aria-label": model.t("rawMode"),
          "aria-pressed": "false",
          id: model.ids.rawModeButton,
          title: model.t("rawMode"),
        },
        "remixicon code-box-line",
        { action: "logs-toggle-raw" },
    )}
    {toolbarButton(
        {
          "aria-label": model.t("showMetadata"),
          "aria-pressed": "false",
          "data-logs-raw-hide": "",
          id: model.ids.metadataButton,
          title: model.t("showMetadata"),
        },
        "remixicon braces-line",
        { action: "logs-toggle-metadata" },
    )}
    {toolbarButton(
        {
          "aria-label": model.t("followLiveLogs"),
          id: model.ids.jumpButton,
          title: model.t("followLiveLogs"),
        },
        "remixicon arrow-down-s-line",
        { action: "logs-scroll-bottom" },
    )}
    {copy_button({
          target: `#${model.ids.box}`,
          title: model.t("copyLogs"),
          tooltip: model.t("copyLogs"),
          size: "md",
    })}
    {exportPopover(model)}
    {fullscreenButtons(model)}
    </div>
  );
}

function logsToolbar(model: any) {
  return (
    <div className="logs-toolbar-main">
    {primaryToolbarRow(model)}
    {secondaryToolbarRow(model)}
    </div>
  );
}

export { logsToolbar };
