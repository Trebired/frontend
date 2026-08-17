import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import type { SidebarSide } from "#dyryux7b683c";
import type { ShellChromeState } from "#boxcxvsyrtdl";
import type { ThemeModeOptions } from "#zzt5zj380sl9";

type ProductShellLabelKey =
|"about"
|"account"
|"apps"
|"closeNavigationMenu"
|"docs"
|"feedback"
|"goHome"
|"menu"
|"minimize"
|"mobileNavigation"
|"mobilePrimaryNavigation"
|"more"
|"navigation"
|"navigationSidebarLabel"
|"notifications"
|"organizationMembers"
|"organizationMembersSidebarLabel"
|"profile"
|"support"
|"toggleTheme";

type ProductShellLabels = Partial<Record<ProductShellLabelKey, string>>;

type ProductShellState = {
  chrome: ShellChromeState;
  leftSidebar: Record<string, unknown>;
  rightSidebar: Record<string, unknown>;
  shell: Record<string, unknown>;
};

type ProductShellLayoutState = ProductShellState& {
  currentPath: string;
  hasMobileBottomBar: boolean;
  showHeader: boolean;
  showLeftSidebar: boolean;
  showRightSidebar: boolean;
  showSecondaryHeader: boolean;
  sidebarSides: SidebarSide[];
  theme: string;
  themeKey: string;
  ui: Record<string, unknown>;
};

type ProductShellStateOptions = {
  currentPath?: unknown;
  defaultTheme?: string;
  theme?: unknown;
  themeKey?: unknown;
};

type ProductShellLayoutRenderContext = ProductShellLayoutState;

type ProductShellSidebarRenderContext = ProductShellLayoutState& {
  side: SidebarSide;
  sidebar: Record<string, unknown>;
};

type ProductShellHeaderBrandTagAlign = "horizontal" | "vertical";

type ProductShellHeaderProps = {
  actions?: ReactNode;
  brandClassName?: string;
  brandContent?: ReactNode;
  brandHref?: string;
  brandLogo?: ReactNode;
  brandMeta?: ReactNode;
  brandTag?: ReactNode;
  brandTagAlign?: ProductShellHeaderBrandTagAlign;
  className?: string;
  id?: string;
  labels?: ProductShellLabels;
  mobileToggleClassName?: string;
  mobileToggleControls?: string;
  mobileToggleIcon?: ReactNode;
  nav?: ReactNode;
  overlays?: ReactNode;
  shell?: unknown;
};

type ProductShellMobileNavProps = {
  accountContent?: ReactNode;
  className?: string;
  closeIcon?: ReactNode;
  contentClassName?: string;
  headerContent?: ReactNode;
  id?: string;
  labels?: ProductShellLabels;
  shell?: unknown;
  sidebarContent?: ReactNode;
  supportHref?: string;
  titleClassName?: string;
};

type ProductShellBottomBarProps = HTMLAttributes<HTMLElement>& {
  appIcon?: ReactNode;
  appsHref?: string;
  itemClassName?: string;
  labels?: ProductShellLabels;
  menuIcon?: ReactNode;
  menuToggleClassName?: string;
  notifications?: ReactNode;
  profileHref?: string;
  profileIcon?: ReactNode;
};

type ProductShellLayoutProps =
Omit<HTMLAttributes<HTMLDivElement>, "children">& {
  body?: ReactNode;
  children?: ReactNode | ((context: ProductShellLayoutRenderContext) => ReactNode);
  currentPath?: unknown;
  mainId?: string;
  renderBottomBar?: (context: ProductShellLayoutRenderContext) => ReactNode;
  renderHeader?: (context: ProductShellLayoutRenderContext) => ReactNode;
  renderMobileNav?: (context: ProductShellLayoutRenderContext) => ReactNode;
  renderSecondaryHeader?: (context: ProductShellLayoutRenderContext) => ReactNode;
  renderSidebar?: (context: ProductShellSidebarRenderContext) => ReactNode;
  shell?: unknown;
};

type ProductShellSidebarProps = {
  ariaLabel?: string;
  bodyClassName?: string;
  bodyId?: string;
  children?: ReactNode;
  className?: string;
  content?: ReactNode;
  footer?: ReactNode;
  footerActions?: ReactNode;
  id?: string;
  minimized?: boolean;
  persist?: boolean;
  showFooter?: boolean;
  side?: SidebarSide;
};

type ProductShellSidebarFooterProps = HTMLAttributes<HTMLDivElement>& {
  actions?: ReactNode;
};

type ProductShellSidebarControlsProps =
Omit<HTMLAttributes<HTMLDivElement>, "about">& {
  about?: ReactNode;
  language?: ReactNode;
  minimize?: ReactNode;
  theme?: ReactNode;
};

type ProductShellSidebarDefaultControlsProps =
Omit<ProductShellSidebarControlsProps, "about"|"language"|"minimize"|"theme">&
Pick<ProductShellThemeToggleProps, "dark"|"light"|"modes">& {
  aboutHref?: string;
  buttonClassName?: string;
  controlsId: string;
  idPrefix?: string;
  labels?: ProductShellLabels;
  lang?: string;
  productName?: string;
  side?: SidebarSide;
  theme?: string;
};

type ProductShellSidebarMinimizeButtonProps =
ButtonHTMLAttributes<HTMLButtonElement>& {
  controls: string;
  expandedIcon?: ReactNode;
  labels?: ProductShellLabels;
  minimizedIcon?: ReactNode;
};

type ProductShellThemeToggleProps =
ButtonHTMLAttributes<HTMLButtonElement>&ThemeModeOptions& {
  icon?: ReactNode;
  labels?: ProductShellLabels;
  popoverId?: string;
  theme?: string;
};

type ProductShellAboutButtonProps =
AnchorHTMLAttributes<HTMLAnchorElement>& {
  icon?: ReactNode;
  labels?: ProductShellLabels;
  productName?: string;
};

export type {
  ProductShellAboutButtonProps,
  ProductShellBottomBarProps,
  ProductShellHeaderBrandTagAlign,
  ProductShellHeaderProps,
  ProductShellLabelKey,
  ProductShellLabels,
  ProductShellLayoutProps,
  ProductShellLayoutRenderContext,
  ProductShellLayoutState,
  ProductShellMobileNavProps,
  ProductShellSidebarControlsProps,
  ProductShellSidebarDefaultControlsProps,
  ProductShellSidebarFooterProps,
  ProductShellSidebarMinimizeButtonProps,
  ProductShellSidebarProps,
  ProductShellSidebarRenderContext,
  ProductShellState,
  ProductShellStateOptions,
  ProductShellThemeToggleProps,
};
