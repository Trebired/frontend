import { type CSSProperties, type ReactNode } from "react";
import { icon, joinClassNames, toString, useRenderCurrentUrl } from "#dqy2d22qyujv";
import {
  primitiveInlineRowClassName,
  primitiveStackClassName,
} from "#hzrmwbvgt2ax";
import type {
  tab_panel_props,
  tabs_item,
  tabs_model,
  tabs_props,
} from "./model.js";
import { buildTabsModel, routeInitialValue } from "./model.js";
import "./client.js";

function renderTabContent(item: tabs_item) {
  return <span className="tab-label">{item.label}</span>;
}

function renderTabButton(item: tabs_item, activeId: string) {
  const isActive = toString(item.id) === activeId;
  const buttonClassName = joinClassNames([
      "tab",
      toString(item.buttonClassName),
  ]);
  return (
    <button
    {...((item.buttonAttributes || {}) as any)}
    key={`tab_button_${item.id}`}
    type="button"
    className={buttonClassName}
    aria-controls={item.id}
    aria-selected={isActive ? "true" : "false"}
    data-tab-button=""
    {...(toString(item.route)
        ? { "data-tab-route": toString(item.route) }
        : {})}
    {...(item.hasNestedTabs ? { "data-tab-has-nested-tabs": "true" } : {})}
    hidden={item.hidden === true}
    {...(toString(item.value) ? { value: toString(item.value) } : {})}
    >
    {renderTabContent(item)}
    </button>
  );
}

function tabList(props: tabs_props, model: tabs_model) {
  return (
    <div
    {...((props.listAttributes || {}) as any)}
    className={model.listClassName}
    data-tabs-list=""
    >
    {model.items.map((item) => renderTabButton(item, model.activeId))}
    </div>
  );
}

const TABS_ROW_GAP_PX = 8;

function nestedIndicatorLeft(model: tabs_model) {
  const visibleItems = model.items.filter((item) => item.hidden !== true);
  const activeIndex = visibleItems.findIndex(
    (item) => toString(item.id) === model.activeId,
  );
  if (activeIndex < 0 || !visibleItems.length) return "50%";
  const count = visibleItems.length;
  const gaps = TABS_ROW_GAP_PX * (count - 1);
  return `calc((100% - ${gaps}px) / ${count} * ${activeIndex + 0.5} + ${activeIndex * TABS_ROW_GAP_PX}px)`;
}

function nestedIndicatorRow(model: tabs_model) {
  if (!model.hasNestedTabs) return null;
  return (
    <div
    className="tabs-nested-indicator-row"
    data-tabs-nested-indicator-row=""
    data-state={model.activeHasNestedTabs ? "active" : "inactive"}
    hidden={!model.activeHasNestedTabs}
    style={
      model.activeHasNestedTabs
      ? ({
          "--tabs-nested-indicator-left": nestedIndicatorLeft(model),
        } as CSSProperties)
      : undefined
    }
    >
    {icon({
          className: "tabs-nested-indicator-icon",
          spec: "remixicon arrow-down-s-line",
          "data-tabs-nested-indicator-icon": "",
    })}
    </div>
  );
}

function tabRows(props: tabs_props, model: tabs_model) {
  const rows: Array<{ content: ReactNode; row: number }> = [
    { content: tabList(props, model), row: 1 },
  ];
  const nestedRow = nestedIndicatorRow(model);
  if (nestedRow) rows.push({ content: nestedRow, row: rows.length + 1 });
  return rows;
}

function resolvedLeadingRow(model: tabs_model, rows: Array<{ row: number }>) {
  if (!model.hasHeaderLeading || model.requestedHeaderLeadingRow <= 0) return 0;
  return rows.some((row) => row.row === model.requestedHeaderLeadingRow)
  ? model.requestedHeaderLeadingRow
  : 1;
}

function renderTabsRow(
  props: tabs_props,
  row: { content: ReactNode; row: number },
  leadingRow: number,
) {
  if (leadingRow !== row.row)
  return <div key={`tabs_row_${row.row}`}>{row.content}</div>;
  return (
    <div
    key={`tabs_row_${row.row}`}
    className={joinClassNames([
          primitiveInlineRowClassName({
            className: "tabs-row",
            gap: "sm",
            verticalCenter: true,
          }),
          toString(props.headerClassName),
    ])}
    data-tabs-row=""
    data-tabs-row-index={String(row.row)}
    >
    {props.headerLeading}
    <div className="tabs-row-main" data-tabs-row-main="">
    {row.content}
    </div>
    </div>
  );
}

function renderTabsList(props: tabs_props, model: tabs_model) {
  const rows = tabRows(props, model);
  const leadingRow = resolvedLeadingRow(model, rows);
  return (
    <div
    className={primitiveStackClassName({ className: "tabs-stack", gap: "sm" })}
    data-tabs-stack=""
    {...(model.collapseNestedSpacing ? { style: { gap: "0px" } } : {})}
    >
    {rows.map((row) => renderTabsRow(props, row, leadingRow))}
    </div>
  );
}

function familyContent(props: tabs_props, model: tabs_model) {
  const headerClassName = joinClassNames([
      model.hasHeaderLeading ? primitiveInlineRowClassName({ gap: "sm" }) : "",
      toString(props.headerClassName),
  ]);
  if (model.hasHeaderLeading && model.requestedHeaderLeadingRow <= 0) {
    return (
      <div className={headerClassName}>
      {props.headerLeading}
      {renderTabsList(props, model)}
      </div>
    );
  }
  return renderTabsList(props, model);
}

function renderFamily(props: tabs_props, model: tabs_model) {
  return (
    <div
    {...((props.familyAttributes || {}) as any)}
    className={model.familyClassName}
    data-tabs-family=""
    {...(model.hasNestedTabs ? { "data-tabs-has-nested-tabs": "true" } : {})}
    {...(model.activeHasNestedTabs
        ? { "data-tabs-active-has-nested-tabs": "true" }
        : {})}
    {...(!model.activeHasNestedTabs
        ? { "data-tabs-active-has-nested-tabs": "false" }
        : {})}
    {...(model.familyStyle ? { style: model.familyStyle } : {})}
    >
    {familyContent(props, model)}
    </div>
  );
}

function TabsRoot(props: tabs_props) {
  const currentUrl = useRenderCurrentUrl();
  const model = buildTabsModel(props, currentUrl);
  const familyKey = toString(props.familyKey);
  return (
    <div
    {...((props.rootAttributes || {}) as any)}
    {...(model.rootId ? { id: model.rootId } : {})}
    className={toString(props.rootClassName) || undefined}
    data-tabs-root=""
    {...(familyKey ? { "data-tabs-family-key": familyKey } : {})}
    {...(props.hoistFamilyToParent
        ? { "data-tabs-hoist-family": "true" }
        : {})}
    >
    {renderFamily(props, model)}
    </div>
  );
}

function tabs(props: tabs_props) {
  return <TabsRoot {...props} />;
}

function useTabPanelHidden(
  familyKey: string,
  route: string,
  defaultActive = false,
) {
  const currentUrl = useRenderCurrentUrl();
  const selected = routeInitialValue(currentUrl, familyKey);
  return selected ? selected !== toString(route) : !defaultActive;
}

function TabPanel(props: tab_panel_props) {
  const hidden =
  props.hidden === true ||
    useTabPanelHidden(
    props.familyKey,
    props.route,
    props.defaultActive === true,
  );
  return (
    <div
    {...((props.attributes || {}) as any)}
    id={props.id}
    className={toString(props.className) || undefined}
    hidden={hidden}
    >
    {props.children}
    </div>
  );
}

function tab_panel(props: tab_panel_props) {
  return <TabPanel {...props} />;
}

export { tab_panel };
export type { tab_panel_props, tabs_item, tabs_props };
export default tabs;
