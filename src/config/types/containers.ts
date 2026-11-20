type FrontendContainerStyle = Record<string, string>;

type FrontendContainerDeclarations = Record<string, string|number>;

type FrontendContainerTone = "dark" | "light" | null;

type FrontendContainerBlock = {
  at?: Record<string, FrontendContainerDeclarations>;
  frost?: boolean;
  on?: Record<string, FrontendContainerDeclarations>;
  style?: FrontendContainerDeclarations;
  tone?: Exclude<FrontendContainerTone, null>;
};

type FrontendContainerRole = "card" | "card-row" | "log-line";

type FrontendContainer = FrontendContainerBlock& {
  parts?: Record<string, FrontendContainerBlock>;
  roles?: readonly FrontendContainerRole[];
  variants?: Record<string, FrontendContainerBlock>;
};

type FrontendContainersConfig = Record<string, FrontendContainer>;

type FrontendContainerDefinition = {
  at: Record<string, FrontendContainerStyle>;
  frost: boolean;
  on: Record<string, FrontendContainerStyle>;
  parts: Record<string, FrontendContainerDefinition>;
  roles: string[];
  style: FrontendContainerStyle;
  tone: FrontendContainerTone;
  variants: Record<string, FrontendContainerDefinition>;
};

type NormalizedFrontendContainers = Record<string, FrontendContainerDefinition>;

export type {
  FrontendContainer,
  FrontendContainerTone,
  FrontendContainerBlock,
  FrontendContainerDeclarations,
  FrontendContainerDefinition,
  FrontendContainerRole,
  FrontendContainerStyle,
  FrontendContainersConfig,
  NormalizedFrontendContainers,
};
