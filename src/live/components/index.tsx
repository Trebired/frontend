import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { classNames, dataBool } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs } from "#5vbaqj4pirp3";

type LiveRegionProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "main" | "section";
  channel?: string;
  children?: ReactNode;
  event?: string | string[];
  region: string;
  room?: string;
  skip?: boolean;
};

type LiveRefreshButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  url?: string;
};

function LiveRegion(props: LiveRegionProps) {
  const { as: Tag = "section", channel, children, className, event, region, room, skip, ...rest } = props;
  const events = Array.isArray(event) ? event.join(",") : event;
  return (
    <Tag
    {...rest}
    className={classNames(frontendClassName("live-region"), className)}
    {...frontendDataAttrs({ "live-region": region })}
    {...frontendDataAttrs({ "live-skip": dataBool(skip) })}
    {...frontendDataAttrs({
          "live-channel": room ? channel || undefined : undefined,
          "live-event": room ? events || undefined : undefined,
          "live-room": room || undefined,
    })}
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

export { LiveRefreshButton, LiveRegion };
export type { LiveRefreshButtonProps, LiveRegionProps };
