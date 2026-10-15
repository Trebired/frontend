import { useId } from "react";
import type { ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendElementClass } from "#5vbaqj4pirp3";
import type { TextDocument, TextDocumentPart, TextDocumentSection } from "./../../config/text-document.js";
import { Disclosure, DisclosureButton } from "./../../inputs/components/disclosure.js";
import { HairlineCell, HairlinePanel } from "./../../surface/components/index.js";
import { Icon } from "./../../icons/react/index.js";
import { ProseText } from "./../../primitives/components/prose.js";
import { PageOutlineLayout } from "./outline.js";

type TextDocumentBodyProps = {
  className?: string;
  document: TextDocument;
  label?: string;
  minOutlineSections?: number;
  paragraph?: (text: string, key: number) => ReactNode;
};

const block = "text-document";
const DEFAULT_MIN_OUTLINE_SECTIONS = 3;
const MARK_ICON = "remixicon:arrow-down-s-line";

function partsOf(section: TextDocumentSection): TextDocumentPart[] {
  if (section.parts?.length) return section.parts;
  return [{ body: section.body, heading: section.heading, id: section.id }];
}

function paragraphsOf(body: string[], render: TextDocumentBodyProps["paragraph"]) {
  return body.map((text, index) => (render
      ? render(text, index)
      : <p key={index}><ProseText text={text} /></p>));
}

function ProsePart({ part, render, standalone }: {
    part: TextDocumentPart;
    render: TextDocumentBodyProps["paragraph"];
    standalone: boolean;
}) {
  return (
    <article className={classNames(frontendClassName("column"), frontendClassName("gap-sm"))}>
    {standalone ? null : <h3>{part.heading}</h3>}
    {paragraphsOf(part.body, render)}
    </article>
  );
}

function DisclosurePart({ part, render }: { part: TextDocumentPart; render: TextDocumentBodyProps["paragraph"] }) {
  const panelId = `${useId().replace(/:/gu, "")}_part`;

  return (
    <HairlineCell as="li" className={frontendElementClass(block, "item")}>
    <Disclosure
    panel={paragraphsOf(part.body, render)}
    panelId={panelId}
    trigger={(
        <h3 className={frontendElementClass(block, "question")}>
        <DisclosureButton aria-controls={panelId} className={frontendElementClass(block, "trigger")}>
        <span>{part.heading}</span>
        <Icon className={frontendElementClass(block, "mark")} spec={MARK_ICON} />
        </DisclosureButton>
        </h3>
    )}
    />
    </HairlineCell>
  );
}

function Chapter({ mode, render, section }: {
    mode: TextDocument["parts"];
    render: TextDocumentBodyProps["paragraph"];
    section: TextDocumentSection;
}) {
  const parts = partsOf(section);
  const standalone = !section.parts?.length;

  return (
    <section
    className={classNames(frontendClassName("column"), frontendClassName("gap-lg"))}
    id={section.id}
    >
    <h2>{section.heading}</h2>
    {mode === "disclosure" && !standalone ? (
        <HairlinePanel as="ul" className={frontendElementClass(block, "list")} min="100%">
        {parts.map((part) => <DisclosurePart key={part.id} part={part} render={render} />)}
        </HairlinePanel>
      ) : (
        <div className={classNames(frontendClassName("column"), frontendClassName("gap-xl"))}>
        {parts.map((part) => <ProsePart key={part.id} part={part} render={render} standalone={standalone} />)}
        </div>
    )}
    </section>
  );
}

function TextDocumentBody(props: TextDocumentBodyProps) {
  const { className, document, label, minOutlineSections, paragraph } = props;
  const minimum = minOutlineSections ?? DEFAULT_MIN_OUTLINE_SECTIONS;
  const items = document.outline === false || document.sections.length < minimum
  ? []
  : document.sections.map((section) => ({ id: section.id, label: section.heading }));

  return (
    <PageOutlineLayout items={items} label={label}>
    <div className={classNames(frontendClassName(block), frontendClassName("column"), frontendClassName("gap-xl2"), className)}>
    {document.sections.map((section) => (
          <Chapter key={section.id} mode={document.parts} render={paragraph} section={section} />
    ))}
    </div>
    </PageOutlineLayout>
  );
}

export { TextDocumentBody };
export type { TextDocumentBodyProps };
