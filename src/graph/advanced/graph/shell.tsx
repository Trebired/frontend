import { Card, createLocalTranslator, icon } from "#4fte8m1x62rd";
import type { graph_props } from "./types.js";
import { renderGroupedDetails, renderRowDetails } from "./details.js";
import { appendClassName } from "#4fte8m1x62rd";
import {
  FullscreenCloseButton,
  FullscreenOpenButton,
  FullscreenTarget,
} from "#vbkfq413o3u7";

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
    className: "btn solid icon md has-tooltip",
  };

  return mode === "close" ? (
    <FullscreenCloseButton
    {...commonProps}
    data-tbf-fullscreen-hidden="true"
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
    <div className="inline-row gap-xs">
    {graphFullscreenButton(props, "open", t("display.fullscreen"))}
    {graphFullscreenButton(props, "close", t("display.exitFullscreen"))}
    </div>
    </div>
  );
}

function renderGraphToolbar(props: graph_props) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  const hasFullscreen = Boolean(props.extendId && props.extendGroup);
  if (!props.toolbarContent && !hasFullscreen) return null;

  return (
    <Card className="canvas-panel-toolbar gap-sm padding-xs" style={{ flexWrap: "wrap" }}>
    {props.toolbarContent}
    {hasFullscreen ? graphFullscreenActions(props, localT) : null}
    </Card>
  );
}

function graphShellStateOverlay(model: any) {
  if (model.resolvedState === "warning") {
    return (
      <div
      className="inline-row"
      style={{
          position: "absolute",
          inset: 0,
          alignItems: "center",
          justifyContent: "center",
          color:
          model.resolvedStateTone === "warn"
          ? "var(--red-400)"
          : "var(--red-400)",
      }}
      >
      <div className="center">
      {icon({
            spec: model.resolvedStateIcon,
            style: {
              fontSize: "56px",
              lineHeight: 1,
            },
      })}
      </div>
      </div>
    );
  }

  if (!model.isLoading) return null;
  return (
    <div
    className="inline-row"
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
    </div>
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
        <div className="text-muted text-sm">{model.descriptionValue}</div>
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

function hasEnhancedShell(props: graph_props) {
  return (
    Boolean(props.toolbarContent) ||
      Boolean(props.extendId) ||
      Boolean(props.extendGroup) ||
      Boolean(props.rootClassName) ||
      Boolean(props.rootAttrs && typeof props.rootAttrs === "object") ||
      props.scroll === true
  );
}

function enhancedRootClassName(props: graph_props) {
  const enhancedRootClass = appendClassName(
    props.rootClassName,
    props.bodyClassName || "",
  );
  return appendClassName(
    enhancedRootClass,
    appendClassName(
      "graph-shell column gap-sm padding-xs flex-1",
      props.scroll === true ? "scroll scroll-min" : "",
    ),
  );
}

function renderEnhancedGraphShell(props: graph_props, model: any) {
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
  const content =
  props.extendId && props.extendGroup
  ? (
    <FullscreenTarget fullscreenId={props.extendId} group={props.extendGroup}>
    {target}
    </FullscreenTarget>
  )
  : target;

  return (
    <>
    {content}
    {renderGraphTemplates(model)}
    </>
  );
}

function renderSimpleGraphShell(model: any) {
  return (
    <>
    <Card className="column gap-sm">
    {renderGraphCanvas(model)}
    {renderGraphDetails(model)}
    </Card>
    {renderGraphTemplates(model)}
    </>
  );
}

function renderGraphShell(props: graph_props, model: any) {
  return hasEnhancedShell(props)
  ? renderEnhancedGraphShell(props, model)
  : renderSimpleGraphShell(model);
}

export { renderGraphShell };
