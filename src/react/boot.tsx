import type { ReactNode, ScriptHTMLAttributes } from "react";
import {
  LayoutBootScript,
  LayoutDocument,
  type LayoutBootScriptProps,
  type LayoutDocumentProps,
} from "#qsb4858ln9g5";
import {
  SidebarBootScript,
  type SidebarBootScriptProps,
} from "#26uyycr73i6f";
import {
  ThemeBootScript,
  type ThemeBootScriptProps,
} from "#wavczpl1zxvg";
import type { LayoutBodyState } from "#ieim4iimrwal";
import type { SidebarSide } from "#dyryux7b683c";
import type { ThemeModeOptions, ThemeValue } from "#zzt5zj380sl9";

type BootScriptLayout = boolean | Partial<LayoutBodyState>;
type BootScriptSidebar = boolean | SidebarSide[] | Pick<SidebarBootScriptProps, "sides">;
type BootScriptTheme = false | ThemeValue;

type BootScriptProps = Omit<
ScriptHTMLAttributes<HTMLScriptElement>,
"children" | "dangerouslySetInnerHTML"
> &
ThemeModeOptions & {
  layout?: BootScriptLayout;
  sidebar?: BootScriptSidebar;
  theme?: BootScriptTheme;
};

type FrontendBootScriptProps = BootScriptProps;
type FrontendDocumentProps = LayoutDocumentProps;

function sidebarSidesFromInput(input: BootScriptSidebar | undefined): SidebarSide[] {
  if (input === false || input === undefined) return [];
  if (input === true) return ["left"];
  const sides = Array.isArray(input) ? input : input.sides || [];
  return sides.filter((side): side is SidebarSide => side === "left" || side === "right");
}

function BootScript(props: BootScriptProps) {
  const {
    dark,
    id: _id,
    layout = false,
    light,
    modes,
    sidebar = false,
    theme = false,
    ...scriptProps
  } = props;
  const nodes: ReactNode[] = [];
  if (theme !== false) {
    nodes.push(
      <ThemeBootScript
        {...scriptProps as ThemeBootScriptProps}
        dark={dark}
        key="theme"
        light={light}
        modes={modes}
        theme={theme}
      />,
    );
  }
  if (layout !== false) {
    nodes.push(
      <LayoutBootScript
        {...scriptProps as LayoutBootScriptProps}
        {...(layout === true ? {} : layout)}
        key="layout"
      />,
    );
  }
  const sides = sidebarSidesFromInput(sidebar);
  if (sides.length > 0) {
    nodes.push(
      <SidebarBootScript
        {...scriptProps as SidebarBootScriptProps}
        key="sidebar"
        sides={sides}
      />,
    );
  }
  return <>{nodes}</>;
}

function FrontendDocument(props: FrontendDocumentProps) {
  return <LayoutDocument {...props} />;
}

const FrontendBootScript = BootScript;

export { BootScript, FrontendBootScript, FrontendDocument };
export type { BootScriptProps, FrontendBootScriptProps, FrontendDocumentProps };
