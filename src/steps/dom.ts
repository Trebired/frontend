import { frontendClassName, frontendDataAttr } from "#5vbaqj4pirp3";
import {
  primitiveCardRowAttrs,
  primitiveCardRowClassName,
  primitiveInlineRowClassName,
  primitiveStackClassName,
  primitiveTextClassName,
} from "#hzrmwbvgt2ax";
import { toText as onlyString } from "#ndsvdqv80epr";
import { groupSharedSteps, normalizeSharedSteps, stepTone } from "./model.js";
import type { SharedStepCardInput, SharedStepGroup } from "./model.js";
import { rebind, softRedirect } from "#xhefk4bgh568";
import { createDisclosure } from "#z2c0jqmjqds4";
import { createNumberElement } from "#z1ajnkhjieay";
import { highlightAttrs, highlightTargetOf } from "#8xdkni5exuif";

function createSharedStepCard(doc: Document, input: SharedStepCardInput) {
  const message = onlyString(input && input.message);
  if (!message) return null;

  const row = doc.createElement("div");
  row.className = primitiveCardRowClassName({
      className: primitiveStackClassName({
          className: frontendClassName("min-height-fit"),
          gap: "xs",
      }),
  });
  for (const [name, value] of Object.entries(primitiveCardRowAttrs())) {
    if (value !== undefined) row.setAttribute(name, String(value));
  }

  const header = doc.createElement("div");
  header.className = primitiveInlineRowClassName({ gap: "xs" });
  header.style.alignItems = "flex-start";

  const tone = stepTone(input && input.level);
  const badge = doc.createElement("span");
  badge.className = `${frontendClassName("pill")} ${frontendClassName("no-shrink")} ${tone.className}`.trim();
  badge.textContent = tone.label;

  const messageEl = doc.createElement("span");
  messageEl.className = primitiveTextClassName({
      breakWord: true,
      className: frontendClassName("display-block"),
      size: "sm",
  });
  messageEl.textContent = message;
  messageEl.style.flex = "1 1 auto";
  messageEl.style.lineHeight = "1.4";

  header.appendChild(badge);
  header.appendChild(messageEl);
  row.appendChild(header);

  appendStepRecordedAt(doc, row, input && input.recordedAtLabel);
  linkStepRow(row, onlyString(input && input.href), onlyString(input && input.highlight));

  return row;
}

const STEP_HREF_ATTR = frontendDataAttr("step-href");
let stepLinksBound = false;

function stepLinkRow(target: EventTarget | null) {
  return target instanceof Element ? target.closest<HTMLElement>(`[${STEP_HREF_ATTR}]`) : null;
}

function openStepLink(row: HTMLElement | null) {
  const href = row ? onlyString(row.getAttribute(STEP_HREF_ATTR)) : "";
  if (href) void softRedirect(href, { highlight: highlightTargetOf(row) || undefined });
}

function bindStepLinks() {
  if (stepLinksBound || typeof document === "undefined") return;
  stepLinksBound = true;
  document.addEventListener("click", (event) => openStepLink(stepLinkRow(event.target)));
  document.addEventListener("keydown", (event) => {
      const row = stepLinkRow(event.target);
      if (event.key !== "Enter" || !row || event.target !== row) return;
      event.preventDefault();
      openStepLink(row);
  });
}

function linkStepRow(row: HTMLElement, href: string, highlight: string) {
  if (!href) return;
  bindStepLinks();
  row.setAttribute(STEP_HREF_ATTR, href);
  for (const [name, value] of Object.entries(highlightAttrs(highlight))) row.setAttribute(name, value);
  row.setAttribute("role", "link");
  row.tabIndex = 0;
}

function appendStepRecordedAt(doc: Document, row: HTMLElement, value: unknown) {
  const recordedAtLabel = onlyString(value);
  if (!recordedAtLabel) return;
  const timeEl = doc.createElement("span");
  timeEl.className = primitiveTextClassName({
      breakWord: true,
      className: frontendClassName("display-block"),
      muted: true,
      size: "xs",
  });
  timeEl.textContent = recordedAtLabel;
  timeEl.style.lineHeight = "1.35";
  row.appendChild(timeEl);
}

const GROUP_HEADER_ATTR = frontendDataAttr("steps-group-header");
const CARD_GROUP_ATTR = frontendDataAttr("steps-group-card");

function groupHeaderTemplate(container: HTMLElement, key: string) {
  const panel = container.closest(`[${frontendDataAttr("steps-panel")}]`) || container;
  const templates = Array.from(panel.querySelectorAll<HTMLTemplateElement>(`template[${GROUP_HEADER_ATTR}]`));
  return templates.find((template) => template.getAttribute(GROUP_HEADER_ATTR) === key) || null;
}

function stepCardsList(doc: Document, group: SharedStepGroup) {
  const list = doc.createElement("div");
  list.className = primitiveStackClassName({ gap: "xs" });
  list.setAttribute(frontendDataAttr("steps-group-list"), group.key);
  group.steps.forEach((entry) => {
      const card = createSharedStepCard(doc, entry);
      if (card) list.appendChild(card);
  });
  return list;
}

function createCardStepGroup(doc: Document, group: SharedStepGroup, template: HTMLTemplateElement) {
  const wrapper = doc.createElement("section");
  wrapper.setAttribute(frontendDataAttr("steps-group"), group.key);
  wrapper.setAttribute(CARD_GROUP_ATTR, "");
  wrapper.appendChild(template.content.cloneNode(true));
  const slot = wrapper.querySelector<HTMLElement>(`[${frontendDataAttr("steps-group-slot")}]`);
  const list = stepCardsList(doc, group);
  if (slot) slot.replaceChildren(...Array.from(list.childNodes));
  else wrapper.appendChild(list);
  wrapper.querySelectorAll(`[${frontendDataAttr("steps-group-count")}]`).forEach((count) => {
      count.replaceChildren(createNumberElement(doc, group.steps.length));
  });
  return wrapper;
}

function createSharedStepGroup(doc: Document, group: SharedStepGroup, container: HTMLElement) {
  const template = groupHeaderTemplate(container, group.key);
  if (template) return createCardStepGroup(doc, group, template);

  const wrapper = doc.createElement("section");
  wrapper.className = primitiveStackClassName({ gap: "xs" });
  wrapper.setAttribute(frontendDataAttr("steps-group"), group.key);

  const separator = doc.createElement("hr");
  separator.setAttribute("aria-hidden", "true");
  wrapper.appendChild(separator);

  const header = doc.createElement("div");
  header.className = primitiveStackClassName({ gap: "xs2" });
  const title = doc.createElement("h5");
  title.textContent = group.label;
  header.appendChild(title);

  const actionLabel = onlyString(group.actionLabel);
  if (actionLabel) {
    const actionEl = doc.createElement("span");
    actionEl.className = primitiveTextClassName({ muted: true, size: "xs" });
    actionEl.textContent =
    actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1);
    header.appendChild(actionEl);
  }

  wrapper.appendChild(header);
  wrapper.appendChild(stepCardsList(doc, group));
  return wrapper;
}

const DISCLOSURE_SELECTOR = `[${frontendDataAttr("disclosure")}]`;

function openCardGroupKeys(container: HTMLElement) {
  return new Set(
    Array.from(container.querySelectorAll<HTMLElement>(`[${CARD_GROUP_ATTR}]`))
    .filter((section) => section.querySelector(DISCLOSURE_SELECTOR)?.getAttribute(frontendDataAttr("disclosure-open")) === "true")
    .map((section) => section.getAttribute(frontendDataAttr("steps-group")) || ""),
  );
}

function rebindInserted(section: HTMLElement, openKeys: Set<string>) {
  if (!section.isConnected) return;
  rebind(section);
  if (!openKeys.has(section.getAttribute(frontendDataAttr("steps-group")) || "")) return;
  section.querySelectorAll<HTMLElement>(DISCLOSURE_SELECTOR).forEach((root) => createDisclosure(root)?.open(false));
}

function renderSharedSteps(
  doc: Document,
  container: HTMLElement,
  stepsInput: unknown,
) {
  const openKeys = openCardGroupKeys(container);
  container.innerHTML = "";

  const steps = normalizeSharedSteps(stepsInput);
  const groupedEntries = steps.filter(
    (entry) => entry.groupKey || entry.groupLabel,
  );
  const ungroupedEntries = steps.filter(
    (entry) => !entry.groupKey && !entry.groupLabel,
  );
  const grouped = groupSharedSteps(groupedEntries);
  if (grouped.length > 0) {
    ungroupedEntries
    .slice()
    .reverse()
    .forEach((entry) => {
        const card = createSharedStepCard(doc, entry);
        if (card) container.appendChild(card);
    });
    const sections = grouped.map((group) => createSharedStepGroup(doc, group, container));
    sections.forEach((section) => container.appendChild(section));
    sections.filter((section) => section.hasAttribute(CARD_GROUP_ATTR)).forEach((section) => rebindInserted(section, openKeys));
    return;
  }

  steps
  .slice()
  .reverse()
  .forEach((entry) => {
      const card = createSharedStepCard(doc, entry);
      if (card) container.appendChild(card);
  });
}

export type { SharedStepCardInput };
export { bindStepLinks, createSharedStepCard, groupSharedSteps, renderSharedSteps };
