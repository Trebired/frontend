import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { classNames, dataBool, jsonScript } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs } from "#5vbaqj4pirp3";

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

function LiveIslandMount(props: LiveIslandMountProps) {
  const rootAttr =
  String(props.rootAttr || "data-live-island-root").trim() ||
    "data-live-island-root";
  const stateId = String(props.stateId || "").trim();
  const state =
  props.state && typeof props.state === "object" ? props.state : {};
  return (
    <>
    <script
    type="application/json"
    id={stateId}
    dangerouslySetInnerHTML={{ __html: jsonScript(state) }}
    />
    <div
    id={String(props.rootId || "").trim() || undefined}
    {...{ [rootAttr]: "" }}
    data-live-island-root=""
    data-live-island-hydrated="false"
    >
    {props.children}
    </div>
    </>
  );
}

function live_island_mount(props: LiveIslandMountProps) {
  return <LiveIslandMount {...props} />;
}

export { LiveIslandMount, LiveRefreshButton, LiveRegion, live_island_mount };
export type { LiveIslandMountProps, LiveRefreshButtonProps, LiveRegionProps };
