import { Card, icon } from "#4fte8m1x62rd";
import type { graph_props } from "./types.js";
import { renderGroupedDetails, renderRowDetails } from "./details.js";
import { appendClassName } from "#4fte8m1x62rd";
import { InlineRow, Text, primitiveCardClassName, primitiveInlineRowClassName } from "#hzrmwbvgt2ax";
import { FullscreenTarget } from "#vbkfq413o3u7";
import { frontendCssVar } from "#5vbaqj4pirp3";

function renderGraphToolbar(props: graph_props) {
  if (!props.toolbarContent) return null;

  return (
    <Card className={primitiveInlineRowClassName({ className: "canvas-panel-toolbar", gap: "sm", wrap: true })}>
    {props.toolbarContent}
    </Card>
  );
}

function stateOverlayColor(model: any) {
  if (model.resolvedState === "empty") {
    return `var(${frontendCssVar("text-muted")}, currentColor)`;
  }
  return model.resolvedStateTone === "warn"
  ? `var(${frontendCssVar("status-warning-color")}, var(${frontendCssVar("focus")}, currentColor))`
  : `var(${frontendCssVar("status-error-color")}, var(${frontendCssVar("focus")}, currentColor))`;
}

function graphShellStateOverlay(model: any) {
  if (model.resolvedState === "warning" || model.resolvedState === "empty") {
    return (
      <InlineRow
      style={{
          position: "absolute",
          inset: 0,
          alignItems: "center",
          justifyContent: "center",
          color: stateOverlayColor(model),
      }}
      >
      <div className="center column gap-sm">
      {icon({
            spec: model.resolvedStateIcon,
            style: {
              fontSize: model.resolvedState === "empty" ? "40px" : "56px",
              lineHeight: 1,
            },
      })}
      {model.resolvedStateMessage ? (
          <Text as="span" size="sm">{model.resolvedStateMessage}</Text>
        ) : null}
      </div>
      </InlineRow>
    );
  }

  if (!model.isLoading) return null;
  return (
    <InlineRow
    style={{
        position: "absolute",
        inset: 0,
        alignItems: "center",
        justifyContent: "center",
    }}
    >
    <div className="center">
    <div className="loader md" aria-hidden="true"></div>
    </div>
    </InlineRow>
  );
}

function renderGraphCanvas(model: any, mountClassName = "") {
  return (
    <div id={`${model.graphId}_mount`} className={mountClassName}>
    <div
    className="bg-canvas padding-sm radius-md border"
    style={{
        height: "220px",
        position: "relative",
    }}
    >
    {graphShellStateOverlay(model)}
    </div>
    </div>
  );
}

function renderGraphDetails(model: any) {
  return (
    <>
    {model.groups.length ? renderGroupedDetails(model.groups) : null}
    {!model.groups.length && model.rows.length
      ? renderRowDetails(model.rows)
      : null}
    {model.descriptionValue ? (
        <Text as="span" muted size="sm">{model.descriptionValue}</Text>
      ) : null}
    </>
  );
}

function renderGraphTemplates(model: any) {
  return (
    <>
    {model.unitDropdownNode ? (
        <template id={model.unitDropdownTemplateId}>
        {model.unitDropdownNode}
        </template>
      ) : null}
    <template
    id={`${model.graphId}_boot`}
    dangerouslySetInnerHTML={{ __html: model.graphBoot }}
    />
    </>
  );
}

function enhancedRootClassName(props: graph_props) {
  const enhancedRootClass = appendClassName(
    props.rootClassName,
    props.bodyClassName || "",
  );
  return appendClassName(
    enhancedRootClass,
    primitiveCardClassName({
        className: "graph-shell flex-1",
        gap: "sm",
        scroll: props.scroll === true,
    }),
  );
}

function renderGraphShell(props: graph_props, model: any) {
  const fullscreen = { group: model.fullscreenGroup, id: model.fullscreenId };
  const target = (
    <Card
    {...model.rootAttrs}
    className={enhancedRootClassName(props)}
    style={{ minHeight: 0 }}
    >
    {renderGraphToolbar(props)}
    {renderGraphCanvas(model, "graph-shell-mount")}
    {renderGraphDetails(model)}
    </Card>
  );
  const content = fullscreen.id ? (
    <FullscreenTarget fullscreenId={fullscreen.id} group={fullscreen.group}>
    {target}
    </FullscreenTarget>
  ) : target;

  return (
    <>
    {content}
    {renderGraphTemplates(model)}
    </>
  );
}

export { renderGraphShell };
