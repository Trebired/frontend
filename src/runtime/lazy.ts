import { frontendDataSelector } from "./../namespace/index.js";
import type { BindRoot } from "./../dom/index.js";
import type { LiveSubscribe } from "./../live/index.js";
import type { SourceLanguageRuntimeOptions } from "./../language/index.js";

type LazyContext = { sourceLanguage?: SourceLanguageRuntimeOptions; subscribe?: LiveSubscribe };

type LazySystem = {
  bind: (scope: BindRoot, context: LazyContext) => Promise<void>;
  name: string;
  presence: () => string;
};

type LazyStep = (label: string, step: () => Promise<void>) => void;

const LAZY_SYSTEMS: LazySystem[] = [
  {
    bind: async(scope) => (await import("./../graph/lazy.js")).bind(scope),
    name: "graphs",
    presence: () => `${frontendDataSelector("graph")}, .graph-shell-mount`,
  },
  {
    bind: async(scope) => {
      (await import("./../logs/lazy.js")).bind(scope);
    },
    name: "logs",
    presence: () => `${frontendDataSelector("logs-partial")}, ${frontendDataSelector("logs-boot")}`,
  },
  {
    bind: async(scope) => (await import("./../code/lazy.js")).bind(scope),
    name: "codeBlocks",
    presence: () => frontendDataSelector("code-block"),
  },
  {
    bind: async(scope) => (await import("./../editor/lazy.js")).bind(scope),
    name: "editors",
    presence: () => `${frontendDataSelector("editor-content-field")}, ${frontendDataSelector("editor-content-config")}`,
  },
  {
    bind: async(scope) => {
      (await import("./../fullscreen/lazy.js")).bind(scope);
    },
    name: "fullscreen",
    presence: () => ["fullscreen-trigger", "fullscreen-toggle", "fullscreen-enter", "fullscreen-exit", "fullscreen-target"]
    .map((name) => frontendDataSelector(name))
    .join(", "),
  },
  {
    bind: async(scope, context) => {
      (await import("./../language/runtime/source/lazy.js")).bind(scope, context.sourceLanguage);
    },
    name: "sourceLanguage",
    presence: () => frontendDataSelector("source-language-root"),
  },
  {
    bind: async(scope, context) => {
      (await import("./../live/lazy.js")).bind(scope, context.subscribe);
    },
    name: "live",
    presence: () => `${frontendDataSelector("live-card")}, live-list${frontendDataSelector("live-list-room")}`,
  },
];

function holds(scope: BindRoot, selector: string): boolean {
  if (typeof Element !== "undefined" && scope instanceof Element && scope.matches(selector)) return true;
  return Boolean(scope && typeof(scope as ParentNode).querySelector === "function" && (scope as ParentNode).querySelector(selector));
}

function bindLazySystems(scope: BindRoot, context: LazyContext, step: LazyStep) {
  for (const system of LAZY_SYSTEMS) {
    if (holds(scope, system.presence())) step(system.name, () => system.bind(scope, context));
  }
}

export { bindLazySystems, LAZY_SYSTEMS };
export type { LazyContext, LazySystem };
