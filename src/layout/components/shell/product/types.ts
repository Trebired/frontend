import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import type { SidebarSide } from "#dyryux7b683c";
import type { ShellChromeState } from "#boxcxvsyrtdl";

type ProductShellLabelKey =
  | "about"
  | "account"
  | "apps"
  | "closeNavigationMenu"
  | "docs"
  | "feedback"
  | "goHome"
  | "menu"
  | "minimize"
  | "mobileNavigation"
  | "mobilePrimaryNavigation"
  | "more"
  | "navigation"
  | "navigationSidebarLabel"
  | "notifications"
  | "organizationMembers"
  | "organizationMembersSidebarLabel"
  | "profile"
  | "support"
  | "toggleTheme";

type ProductShellLabels = Partial<Record<ProductShellLabelKey, string>>;

type ProductShellState = {
  chrome: ShellChromeState;
  leftSidebar: Record<string, unknown>;
  rightSidebar: Record<string, unknown>;
  shell: Record<string, unknown>;
};

type ProductShellHeaderProps = {
  actions?: ReactNode;
  brandClassName?: string;
  brandContent?: ReactNode;
  brandHref?: string;
  brandMeta?: ReactNode;
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

type ProductShellBottomBarProps = HTMLAttributes<HTMLElement> & {
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
  persist?: boolean;
  showFooter?: boolean;
  side?: SidebarSide;
};

type ProductShellSidebarFooterProps = HTMLAttributes<HTMLDivElement> & {
  actions?: ReactNode;
};

type ProductShellSidebarControlsProps =
  Omit<HTMLAttributes<HTMLDivElement>, "about"> & {
    about?: ReactNode;
    language?: ReactNode;
    minimize?: ReactNode;
    theme?: ReactNode;
  };

type ProductShellSidebarMinimizeButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    controls: string;
    expandedIcon?: ReactNode;
    labels?: ProductShellLabels;
    minimizedIcon?: ReactNode;
  };

type ProductShellThemeToggleProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: ReactNode;
    labels?: ProductShellLabels;
  };

type ProductShellAboutButtonProps =
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    icon?: ReactNode;
    labels?: ProductShellLabels;
    productName?: string;
  };

export type {
  ProductShellAboutButtonProps,
  ProductShellBottomBarProps,
  ProductShellHeaderProps,
  ProductShellLabelKey,
  ProductShellLabels,
  ProductShellMobileNavProps,
  ProductShellSidebarControlsProps,
  ProductShellSidebarFooterProps,
  ProductShellSidebarMinimizeButtonProps,
  ProductShellSidebarProps,
  ProductShellState,
  ProductShellThemeToggleProps,
};
