import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";

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
    <div {...rest} className={classNames(frontendClassName("tabs"), className)} {...frontendDataAttrs({ "tabs": "" })}>
    {children}
    </div>
  );
}

function TabList(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return (
    <div {...rest} className={classNames(frontendElementClass("tabs", "list"), className)} role="tablist">
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
    className={classNames(frontendElementClass("tabs", "tab"), className)}
    {...frontendDataAttrs({ "tab": value })}
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
    className={classNames(frontendElementClass("tabs", "panel"), className)}
    {...frontendDataAttrs({ "tab-panel": value })}
    role="tabpanel"
    >
    {children}
    </div>
  );
}

export { TabButton, TabList, TabPanel, Tabs };
export type { TabButtonProps, TabPanelProps, TabsProps };
