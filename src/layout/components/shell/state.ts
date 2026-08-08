type ShellHeaderType = "app" | "login" | "platform";

type ShellHeaderPartialType = "login" | "platform";

type ShellChromeStateInput = {
  hasMobileBottomBar?: boolean;
  hasPrimaryLinks?: boolean;
  hasSidebarLinks?: boolean;
  hasUserActions?: boolean;
  showMobileNavToggle?: boolean;
  type?: unknown;
};

type ShellChromeState = {
  hasMobileBottomBar: boolean;
  partialType: ShellHeaderPartialType;
  showHeaderLinks: boolean;
  showHeaderUserActions: boolean;
  showMobileNav: boolean;
  showMobileNavToggle: boolean;
  showSidebarLinks: boolean;
  type: ShellHeaderType;
};

function normalizeShellHeaderType(value: unknown): ShellHeaderType {
  const type = String(value || "").toLowerCase();
  return type === "app" || type === "login" || type === "platform"
    ? type
    : "platform";
}

function shellHeaderPartialType(type: ShellHeaderType): ShellHeaderPartialType {
  return type === "login" ? "login" : "platform";
}

function readShellChromeState(input: ShellChromeStateInput = {}): ShellChromeState {
  const type = normalizeShellHeaderType(input.type);
  const partialType = shellHeaderPartialType(type);
  const hasMobileBottomBar = input.hasMobileBottomBar === true;
  const showHeaderLinks = input.hasPrimaryLinks ?? (partialType === "platform" || partialType === "login");
  const showHeaderUserActions = input.hasUserActions ?? (partialType === "platform" && type !== "login");
  const showSidebarLinks = input.hasSidebarLinks === true;
  const showMobileNavToggle = input.showMobileNavToggle ?? (
    !hasMobileBottomBar && (showSidebarLinks || showHeaderLinks)
  );
  return {
    hasMobileBottomBar,
    partialType,
    showHeaderLinks,
    showHeaderUserActions,
    showMobileNav: showSidebarLinks || showHeaderLinks || showHeaderUserActions,
    showMobileNavToggle,
    showSidebarLinks,
    type,
  };
}

function shellPageHref(baseUrl: string | undefined, path: string) {
  const base = String(baseUrl || "").replace(/\/+$/u, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${suffix}` : suffix;
}

export {
  normalizeShellHeaderType,
  readShellChromeState,
  shellHeaderPartialType,
  shellPageHref,
};
export type {
  ShellChromeState,
  ShellChromeStateInput,
  ShellHeaderPartialType,
  ShellHeaderType,
};
