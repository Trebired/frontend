import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { classNames } from "#ndsvdqv80epr";

type TabsProps = HTMLAttributes<HTMLDivElement>;

type TabButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  controls: string;
  value: string;
};

type TabPanelProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
};

function Tabs(props: TabsProps) {
  const { children, className, ...rest } = props;
  return (
    <div {...rest} className={classNames("tbf-tabs", className)} data-tbf-tabs="">
    {children}
    </div>
  );
}

function TabList(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return (
    <div {...rest} className={classNames("tbf-tabs__list", className)} role="tablist">
    {children}
    </div>
  );
}

function TabButton(props: TabButtonProps) {
  const { children, className, controls, type = "button", value, ...rest } = props;
  return (
    <button
    {...rest}
    aria-controls={controls}
    aria-selected={props["aria-selected"] ?? false}
    className={classNames("tbf-tabs__tab", className)}
    data-tbf-tab={value}
    role="tab"
    type={type}
    >
    {children}
    </button>
  );
}

function TabPanel(props: TabPanelProps) {
  const { children, className, value, ...rest } = props;
  return (
    <div
    {...rest}
    className={classNames("tbf-tabs__panel", className)}
    data-tbf-tab-panel={value}
    role="tabpanel"
    >
    {children}
    </div>
  );
}

export { TabButton, TabList, TabPanel, Tabs };
export type { TabButtonProps, TabPanelProps, TabsProps };
