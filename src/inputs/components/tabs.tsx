import { useEffect, useLayoutEffect, useRef, type ButtonHTMLAttributes, type HTMLAttributes, type MouseEvent } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import { animateTabPane } from "./../advanced/tabs/motion.js";

const TAB_SWITCH_WINDOW_MS = 1000;
const useClientLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
let lastTabSwitch = 0;

function now(): number {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

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
    <div {...rest} className={classNames(frontendClassName("tabs-group"), className)} {...frontendDataAttrs({ "tabs": "" })}>
    {children}
    </div>
  );
}

function TabList(props: HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return (
    <div {...rest} className={classNames(frontendClassName("tabs"), frontendElementClass("tabs", "list"), className)} role="tablist">
    {children}
    </div>
  );
}

function TabButton(props: TabButtonProps) {
  const { children, className, controls, onClick, type = "button", value, ...rest } = props;
  const select = (event: MouseEvent<HTMLButtonElement>) => {
    lastTabSwitch = now();
    onClick?.(event);
  };
  return (
    <button
    {...rest}
    aria-controls={controls}
    aria-selected={props["aria-selected"] ?? false}
    className={classNames(frontendClassName("tab"), frontendElementClass("tabs", "tab"), className)}
    {...frontendDataAttrs({ "tab": value })}
    onClick={select}
    role="tab"
    type={type}
    >
    {children}
    </button>
  );
}

function TabPanel(props: TabPanelProps) {
  const { children, className, value, ...rest } = props;
  const ref = useRef<HTMLDivElement>(null);
  useClientLayoutEffect(() => {
      if (!ref.current || !lastTabSwitch || now() - lastTabSwitch > TAB_SWITCH_WINDOW_MS) return;
      lastTabSwitch = 0;
      animateTabPane(ref.current);
    }, [value]);
  return (
    <div
    {...rest}
    ref={ref}
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
