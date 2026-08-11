import { readShellChromeState } from "#boxcxvsyrtdl";
import { objectRecord, toText as textValue } from "#ndsvdqv80epr";
import { normalizeRoutePath } from "#yv4ubgils4dc";
import type {
  ProductShellLabelKey,
  ProductShellLabels,
  ProductShellLayoutState,
  ProductShellState,
  ProductShellStateOptions,
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

function hasRoutePlaceholderPath(input: unknown) {
  return textValue(input).split("/").some((part) => /^:[A-Za-z0-9_]+$/u.test(part));
}

function productShellCurrentPath(shellInput: unknown, override?: unknown) {
  if (override !== undefined) {
    const normalizedOverride = normalizeRoutePath(override);
    return hasRoutePlaceholderPath(normalizedOverride) ? "/" : normalizedOverride;
  }
  const shell = objectRecord(shellInput);
  const navigation = objectRecord(shell.navigation);
  const current = objectRecord(navigation.current);
  const normalized = normalizeRoutePath(textValue(current.path, "/"));
  return hasRoutePlaceholderPath(normalized) ? "/" : normalized;
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

function productShellTheme(options: ProductShellStateOptions, shell: Record<string, unknown>) {
  const themeKey = textValue(
    options.themeKey,
    textValue(options.theme, textValue(shell.theme, options.defaultTheme || "dark")),
  );
  return {
    theme: textValue(options.theme, themeKey),
    themeKey,
  };
}

function readProductShellLayoutState(
  shellInput: unknown,
  options: ProductShellStateOptions = {},
): ProductShellLayoutState {
  const baseShell = objectRecord(shellInput);
  const theme = productShellTheme(options, baseShell);
  const shell = {
    ...baseShell,
    theme: textValue(baseShell.theme, theme.themeKey),
  };
  const productState = readProductShellState(shell);
  const ui = shellUi(shell);
  const rightSidebar = productState.rightSidebar;
  const showHeader = ui.header !== undefined &&
    ui.header !== false &&
    objectRecord(ui.header).show !== false;
  const showSecondaryHeader = objectRecord(ui.header_secondary).show === true;
  const showLeftSidebar = productState.chrome.showSidebarLinks;
  const showRightSidebar = sidebarIsVisible(rightSidebar);
  const hasMobileBottomBar = showHeader && productState.chrome.hasMobileBottomBar;
  const sidebarSides = [
    showLeftSidebar ? "left" : "",
    showRightSidebar ? "right" : "",
  ].filter((side): side is "left" | "right" => side === "left" || side === "right");

  return {
    ...productState,
    currentPath: productShellCurrentPath(shell, options.currentPath),
    hasMobileBottomBar,
    showHeader,
    showLeftSidebar,
    showRightSidebar,
    showSecondaryHeader,
    sidebarSides,
    theme: theme.theme,
    themeKey: theme.themeKey,
    ui,
  };
}

export {
  productShellCurrentPath,
  productShellLabel,
  readProductShellLayoutState,
  readProductShellState,
};
