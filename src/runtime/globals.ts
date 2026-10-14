import type { BindRoot } from "#er0dlx1gtbzh";
import { frontendDataAttr } from "#5vbaqj4pirp3";
import { ensureSkipTarget } from "./../a11y/skip.js";
import { bindMotifs } from "./../surface/motif/runtime.js";
import { bindProgress } from "./../progress/index.js";
import { bindScrollOverflows } from "./../primitives/scroll-overflow.js";

type GlobalBindOptions = { progress?: Parameters<typeof bindProgress>[0] };

type GlobalBindStep = (label: string, step: () => void) => void;

const BOUND = new WeakSet<Document>();
const PARSED_ATTR = frontendDataAttr("parsed");

function ownerDocumentOf(scope: BindRoot): Document | null {
  if (scope instanceof Document) return scope;
  if (scope instanceof Element || scope instanceof DocumentFragment) return scope.ownerDocument;
  return typeof document === "undefined" ? null : document;
}

function bindFrontendGlobals(scope: BindRoot, options: GlobalBindOptions, runStep: GlobalBindStep) {
  const owner = ownerDocumentOf(scope);
  if (!owner || BOUND.has(owner)) return;
  BOUND.add(owner);
  owner.documentElement.setAttribute(PARSED_ATTR, "");
  runStep("skipTarget", () => ensureSkipTarget(owner));
  runStep("progress", () => bindProgress(options.progress || {}));
  runStep("scrollOverflows", () => bindScrollOverflows());
  runStep("motifs", () => bindMotifs());
}

export { bindFrontendGlobals };
