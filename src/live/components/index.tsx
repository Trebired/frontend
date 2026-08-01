import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { classNames, dataBool } from "#ndsvdqv80epr";

type LiveRegionProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "main" | "section";
  children?: ReactNode;
  region: string;
  skip?: boolean;
};

type LiveRefreshButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  url?: string;
};

function LiveRegion(props: LiveRegionProps) {
  const { as: Tag = "section", children, className, region, skip, ...rest } = props;
  return (
    <Tag
      {...rest}
      className={classNames("tbf-live-region", className)}
      data-tbf-live-region={region}
      data-tbf-live-skip={dataBool(skip)}
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
      className={classNames("tbf-button", className)}
      data-tbf-live-refresh=""
      data-tbf-live-url={url}
      type={type}
    >
      {children}
    </button>
  );
}

export { LiveRefreshButton, LiveRegion };
export type { LiveRefreshButtonProps, LiveRegionProps };
