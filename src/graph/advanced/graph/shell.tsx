import { Card, createLocalTranslator, icon } from "#4fte8m1x62rd";
import type { graph_props } from "./types.js";
import { renderGroupedDetails, renderRowDetails } from "./details.js";
import { appendClassName } from "#4fte8m1x62rd";
import {
  InlineRow,
  Text,
  primitiveButtonClassName,
  primitiveInlineRowClassName,
  primitiveStackClassName,
} from "#hzrmwbvgt2ax";
import {
  FullscreenCloseButton,
  FullscreenOpenButton,
  FullscreenTarget,
} from "#vbkfq413o3u7";
import { frontendCssVar, frontendDataAttrs } from "#5vbaqj4pirp3";

function graphFullscreenButton(
  props: graph_props,
  mode: "open" | "close",
  label: string,
) {
  const iconSpec =
  mode === "open"
  ? "remixicon fullscreen-line"
  : "remixicon fullscreen-exit-line";
  const commonProps = {
    title: label,
    "aria-label": label,
    fullscreenId: String(props.extendId || ""),
    group: String(props.extendGroup || "default"),
    className: primitiveButtonClassName({ icon: true, size: "md", tooltip: true }),
  };

  return mode === "close" ? (
    <FullscreenCloseButton
    {...commonProps}
    {...frontendDataAttrs({ "fullscreen-hidden": "true" })}
    >
    {icon({ spec: iconSpec })}
    </FullscreenCloseButton>
  ) : (
    <FullscreenOpenButton {...commonProps}>
    {icon({ spec: iconSpec })}
    </FullscreenOpenButton>
  );
}

function graphFullscreenActions(
  props: graph_props,
  t: ReturnType<typeof createLocalTranslator>,
) {
  return (
    <div className="right">
    <InlineRow gap="xs">
    {graphFullscreenButton(props, "open", t("display.fullscreen"))}
    {graphFullscreenButton(props, "close", t("display.exitFullscreen"))}
    </InlineRow>
    </div>
  );
}

function renderGraphToolbar(props: graph_props) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  const hasFullscreen = Boolean(props.extendId && props.extendGroup);
  if (!props.toolbarContent && !hasFullscreen) return null;
  const actions = hasFullscreen ? graphFullscreenActions(props, localT) : null;

  if (!props.toolbarContent) {
    return (
      <InlineRow className="canvas-panel-toolbar" gap="sm" wrap>
      {actions}
      </InlineRow>
    );
  }

  return (
    <Card className={primitiveInlineRowClassName({ className: "canvas-panel-toolbar padding-xs", gap: "sm", wrap: true })}>
    {props.toolbarContent}
    {actions}
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
      <div className="center column gap-xs">
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
    className="bg-canvas padding-xs radius-md border"
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

function graphFullscreenIds(props: graph_props, model: any) {
  if (props.extendId === false) return { group: "", id: "" };
  return {
    group: String(props.extendGroup || "graphs"),
    id: String(props.extendId || `${model.graphId}_fullscreen`),
  };
}

function enhancedRootClassName(props: graph_props) {
  const enhancedRootClass = appendClassName(
    props.rootClassName,
    props.bodyClassName || "",
  );
  return appendClassName(
    enhancedRootClass,
    primitiveStackClassName({
        className: appendClassName(
          "graph-shell padding-xs flex-1",
          props.scroll === true ? "scroll scroll-min" : "",
        ),
        gap: "sm",
    }),
  );
}

function renderGraphShell(props: graph_props, model: any) {
  const fullscreen = graphFullscreenIds(props, model);
  const target = (
    <Card
    {...model.rootAttrs}
    className={enhancedRootClassName(props)}
    style={{ minHeight: 0 }}
    >
    {renderGraphToolbar({ ...props, ...fullscreenToolbarProps(fullscreen) })}
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

function fullscreenToolbarProps(fullscreen: { group: string; id: string }) {
  return { extendGroup: fullscreen.group, extendId: fullscreen.id };
}

export { renderGraphShell };
