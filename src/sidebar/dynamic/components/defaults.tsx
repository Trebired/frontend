import { Icon } from "#lbkpzw8nphru";
import { circle, time_counter } from "#hzrmwbvgt2ax";
import type {
  DynamicSidebarCountContext,
  DynamicSidebarItemContext,
  DynamicSidebarLoaderContext,
  DynamicSidebarStateContext,
} from "#9w9ch5jtlv9e";
import { textValue } from "#yv4ubgils4dc";

function defaultDynamicSidebarIcon(context: DynamicSidebarItemContext) {
  const spec =
    textValue(context.item.iconSpec) ||
    textValue(context.item.iconKey) ||
    "remixicon arrow-right-s-line";
  return <Icon spec={spec} />;
}

function defaultDynamicSidebarCount(context: DynamicSidebarCountContext) {
  if (context.count == null) return null;
  return time_counter({
    bare: true,
    count: context.count,
    mode: "count",
  });
}

function defaultDynamicSidebarLoader(context: DynamicSidebarLoaderContext) {
  if (context.repositoryId) {
    if (context.running <= 0 && context.idleCountPath) {
      return context.active && context.idleCount != null
        ? defaultDynamicSidebarCount({
          ...context,
          count: context.idleCount,
          path: context.idleCountPath,
        })
        : null;
    }
    return context.running > 0 ? (
      <span className="text-muted no-select inline-row gap-xs ver-center">
        {circle({ size: "xs" })}
      </span>
    ) : null;
  }
  if (context.running <= 0) return null;
  return (
    <span className="text-muted no-select inline-row gap-xs ver-center">
      {circle({ size: "sm" })}
    </span>
  );
}

function defaultDynamicSidebarState(context: DynamicSidebarStateContext) {
  const state = textValue(context.state).toLowerCase();
  if (!state) return null;
  return (
    <span
      aria-hidden="true"
      className={`dot dot-sm ${state === "running" ? "green" : "red"}`}
      data-state={state}
      data-tbf-sidebar-state-dot=""
    />
  );
}

export {
  defaultDynamicSidebarCount,
  defaultDynamicSidebarIcon,
  defaultDynamicSidebarLoader,
  defaultDynamicSidebarState,
};
