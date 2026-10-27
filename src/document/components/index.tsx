import { useId } from "react";
import type { ReactNode } from "react";
import { classNames } from "#ndsvdqv80epr";
import { frontendClassName, frontendDataAttrs, frontendElementClass } from "#5vbaqj4pirp3";
import type { TextDocument, TextDocumentPart, TextDocumentSection } from "./../../config/text-document.js";
import { Disclosure, DisclosureButton } from "./../../inputs/components/disclosure.js";
import { HairlineCell, HairlinePanel } from "./../../surface/components/index.js";
import { Icon } from "./../../icons/react/index.js";
import { ProseText } from "./../../primitives/components/prose.js";
import { PageOutlineLayout } from "./../../layout/components/outline_dock.js";

type TextDocumentBodyProps = {
  alternate?: string[];
  aside?: ReactNode;
  className?: string;
  document: TextDocument;
  label?: string;
  minOutlineSections?: number;
  opening?: boolean;
  outline?: boolean;
  paragraph?: (text: string, key: number) => ReactNode;
};

const block = "text-document";
const DEFAULT_MIN_OUTLINE_SECTIONS = 3;
const MARK_ICON = "remixicon:arrow-down-s-line";

function ChapterBand({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={classNames(frontendClassName("document-chapter"), className)}>
    <div className={frontendElementClass("document-chapter", "inner")}>{children}</div>
    </div>
  );
}

function partsOf(section: TextDocumentSection): TextDocumentPart[] {
  if (section.parts?.length) return section.parts;
  return [{ body: section.body, heading: section.heading, id: section.id }];
}

function paragraphsOf(body: string[], render: TextDocumentBodyProps["paragraph"]) {
  return body.map((text, index) => (render
      ? render(text, index)
      : (
        <p key={index}>
        <ProseText softRedirect text={text} />
        </p>
  )));
}

function ProsePart({ part, render, standalone }: {
    part: TextDocumentPart;
    render: TextDocumentBodyProps["paragraph"];
    standalone: boolean;
}) {
  const column = classNames(frontendClassName("column"), frontendClassName("gap-sm"));
  if (standalone) return <div className={column}>{paragraphsOf(part.body, render)}</div>;
  return (
    <section className={column}>
    <h3>{part.heading}</h3>
    <div className={classNames(frontendClassName("indent"), column)}>
    {paragraphsOf(part.body, render)}
    </div>
    </section>
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
        {part.heading}
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
    className={classNames(frontendClassName("column"), frontendClassName("gap-md"))}
    id={section.id}
    >
    <h2>{section.heading}</h2>
    {mode === "disclosure" && !standalone ? (
        <HairlinePanel as="ul" className={frontendElementClass(block, "list")} min="100%">
        {parts.map((part) => <DisclosurePart key={part.id} part={part} render={render} />)}
        </HairlinePanel>
      ) : (
        <div className={classNames(frontendClassName("indent"), frontendClassName("column"), frontendClassName("gap-xl"))}>
        {parts.map((part) => <ProsePart key={part.id} part={part} render={render} standalone={standalone} />)}
        </div>
    )}
    </section>
  );
}

function Opening({ document, render }: { document: TextDocument; render: TextDocumentBodyProps["paragraph"] }) {
  if (document.lead.length === 0) return null;
  return (
    <section className={classNames(frontendElementClass(block, "opening"), frontendClassName("column"), frontendClassName("gap-sm"))}>
    {paragraphsOf(document.lead, render)}
    </section>
  );
}

function outlineItems(props: TextDocumentBodyProps) {
  const { document, minOutlineSections, outline } = props;
  if (outline === false) return [];
  const minimum = minOutlineSections ?? DEFAULT_MIN_OUTLINE_SECTIONS;
  if (outline !== true && (document.outline === false || document.sections.length < minimum)) return [];
  return document.sections.map((section) => ({ id: section.id, label: section.heading }));
}

function TextDocumentBody(props: TextDocumentBodyProps) {
  const { aside, className, document, label, paragraph } = props;
  const items = outlineItems(props);
  const opening = props.opening && document.lead.length > 0 ? <Opening document={document} render={paragraph} /> : null;
  const shift = opening ? 1 : 0;

  const { alternate } = props;
  const chapters = document.sections.map((section, index) => {
      const chapter = <Chapter key={section.id} mode={document.parts} render={paragraph} section={section} />;
      if (!alternate?.length) return chapter;
      return (
        <ChapterBand className={alternate[(index + shift) % alternate.length]} key={section.id}>
        {chapter}
        </ChapterBand>
      );
  });

  if (alternate?.length) {
    return (
      <PageOutlineLayout aside={aside} className={className} frame items={items} label={label}>
      <article {...frontendDataAttrs({ document: "" })}>
      {opening ? <ChapterBand className={alternate[0]}>{opening}</ChapterBand> : null}
      {chapters}
      </article>
      </PageOutlineLayout>
    );
  }

  return (
    <PageOutlineLayout aside={aside} items={items} label={label}>
    <article
    className={classNames(frontendClassName(block), frontendClassName("column"), frontendClassName("gap-xl2"), className)}
    {...frontendDataAttrs({ document: "" })}
    >
    {opening}
    {chapters}
    </article>
    </PageOutlineLayout>
  );
}

export { TextDocumentBody };
export type { TextDocumentBodyProps };
