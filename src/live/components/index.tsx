import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { classNames, dataBool, jsonScript } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttr, frontendDataAttrs } from "#5vbaqj4pirp3";

type LiveRegionProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "main" | "section";
  children?: ReactNode;
  region: string;
  skip?: boolean;
};

type LiveRefreshButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  url?: string;
};
type LiveIslandMountProps = {
  children?: ReactNode;
  rootAttr?: string;
  rootId?: string;
};

type LiveIslandStateProps = {
  state?: unknown;
  stateId: string;
};

function LiveRegion(props: LiveRegionProps) {
  const { as: Tag = "section", children, className, region, skip, ...rest } = props;
  return (
    <Tag
    {...rest}
    className={classNames(frontendClassName("live-region"), className)}
    {...frontendDataAttrs({ "live-region": region })}
    {...frontendDataAttrs({ "live-skip": dataBool(skip) })}
    >
    {children}
    </Tag>
  );
}

function LiveRefreshButton(props: LiveRefreshButtonProps) {
  const { children, className, type = "button", url, ...rest } = props;
  return (
    <button
    {...rest}
    className={classNames(frontendClassName("button"), className)}
    {...frontendDataAttrs({ "live-refresh": "" })}
    {...frontendDataAttrs({ "live-url": url })}
    type={type}
    >
    {children}
    </button>
  );
}

function LiveIslandState(props: LiveIslandStateProps) {
  const state = props.state && typeof props.state === "object" ? props.state : {};
  return (
    <script
    type="application/json"
    id={String(props.stateId || "").trim()}
    dangerouslySetInnerHTML={{ __html: jsonScript(state) }}
    />
  );
}

function LiveIslandMount(props: LiveIslandMountProps) {
  const rootAttr =
  String(props.rootAttr || frontendDataAttr("live-island-root")).trim() ||
    frontendDataAttr("live-island-root");
  return (
    <div
    id={String(props.rootId || "").trim() || undefined}
    {...{ [rootAttr]: "" }}
    {...frontendDataAttrs({ "live-island-root": "" })}
    {...frontendDataAttrs({ "live-island-hydrated": "false" })}
    >
    {props.children}
    </div>
  );
}

function live_island_mount(props: LiveIslandMountProps) {
  return <LiveIslandMount {...props} />;
}

export { LiveIslandMount, LiveIslandState, LiveRefreshButton, LiveRegion, live_island_mount };
export type { LiveIslandMountProps, LiveIslandStateProps, LiveRefreshButtonProps, LiveRegionProps };
