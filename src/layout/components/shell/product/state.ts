import { readShellChromeState } from "#boxcxvsyrtdl";
import type {
  ProductShellLabelKey,
  ProductShellLabels,
  ProductShellState,
} from "./types.js";

const defaultLabels: Record<ProductShellLabelKey, string> = {
  about: "About",
  account: "Account",
  apps: "Apps",
  closeNavigationMenu: "Close navigation menu",
  docs: "Docs",
  feedback: "Feedback",
  goHome: "Go home",
  menu: "Menu",
  minimize: "Minimize",
  mobileNavigation: "Mobile navigation",
  mobilePrimaryNavigation: "Mobile primary navigation",
  more: "More",
  navigation: "Navigation",
  navigationSidebarLabel: "Navigation sidebar",
  notifications: "Notifications",
  organizationMembers: "Organization members",
  organizationMembersSidebarLabel: "Organization members sidebar",
  profile: "Profile",
  support: "Support",
  toggleTheme: "Toggle theme",
};

function productShellLabel(
  labels: ProductShellLabels | undefined,
  key: ProductShellLabelKey,
) {
  return labels?.[key] || defaultLabels[key];
}

function objectRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? value as Record<string, unknown>
    : {};
}

function shellUi(shell: Record<string, unknown>) {
  return objectRecord(shell.ui);
}

function shellSidebars(ui: Record<string, unknown>) {
  return objectRecord(ui.sidebars);
}

function shellLeftSidebar(ui: Record<string, unknown>) {
  const sidebars = shellSidebars(ui);
  return Object.keys(objectRecord(sidebars.left)).length
    ? objectRecord(sidebars.left)
    : objectRecord(ui.sidebar);
}

function shellHeaderType(ui: Record<string, unknown>) {
  const header = objectRecord(ui.header);
  return String(header.type || "").toLowerCase();
}

function sidebarIsVisible(sidebar: Record<string, unknown>) {
  return sidebar.show !== false && Boolean(sidebar.type);
}

function readProductShellState(shellInput: unknown): ProductShellState {
  const shell = objectRecord(shellInput);
  const ui = shellUi(shell);
  const sidebars = shellSidebars(ui);
  const leftSidebar = shellLeftSidebar(ui);
  const rightSidebar = objectRecord(sidebars.right);
  const type = shellHeaderType(ui);
  return {
    chrome: readShellChromeState({
      hasMobileBottomBar: type === "platform" || type === "app",
      hasSidebarLinks: sidebarIsVisible(leftSidebar),
      type,
    }),
    leftSidebar,
    rightSidebar,
    shell,
  };
}

export { productShellLabel, readProductShellState };
