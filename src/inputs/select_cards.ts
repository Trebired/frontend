import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { frontendDataAttr, frontendEventName } from "#5vbaqj4pirp3";

const SELECT_CARDS_SELECTOR = "[data-select-cards]";
const SELECT_CARD_SELECTOR = "[data-select-card]";
const SELECT_CARDS_INPUT_SELECTOR = "input[data-select-cards-input]";
const SELECT_CARD_EVENT = frontendEventName("select-card");
const INTERACTIVE_SELECTOR = "a[href], button, input, select, textarea, [contenteditable='true']";

function groupCards(group: HTMLElement) {
  return queryAll<HTMLElement>(group, SELECT_CARD_SELECTOR).filter((card) => card.closest(SELECT_CARDS_SELECTOR) === group);
}

function cardDisabled(card: HTMLElement) {
  return card.getAttribute("aria-disabled") === "true";
}

function cardValue(card: HTMLElement | null) {
  return card ? String(card.getAttribute("data-value") || "").trim() : "";
}

function applyCardState(card: HTMLElement, selected: boolean) {
  card.classList.toggle("selected", selected);
  card.classList.toggle("excluded", !selected);
  card.setAttribute("aria-selected", selected ? "true" : "false");
  if (selected) card.setAttribute("data-card-selected", "true");
  else card.removeAttribute("data-card-selected");
  if (selected) card.removeAttribute("data-card-excluded");
  else card.setAttribute("data-card-excluded", "true");
  card.tabIndex = !cardDisabled(card) && selected ? 0 : -1;
}

function selectCard(group: HTMLElement, card: HTMLElement | null, focus = false) {
  if (!card || cardDisabled(card)) return false;
  const changed = card.getAttribute("aria-selected") !== "true";
  groupCards(group).forEach((candidate) => applyCardState(candidate, candidate === card));
  queryAll<HTMLInputElement>(group, SELECT_CARDS_INPUT_SELECTOR).forEach((input) => {
      input.value = cardValue(card);
  });
  if (focus) card.focus();
  if (changed) {
    group.dispatchEvent(new CustomEvent(SELECT_CARD_EVENT, { bubbles: true, detail: { card, group, value: cardValue(card) } }));
  }
  return changed;
}

function moveSelection(group: HTMLElement, card: HTMLElement, direction: number) {
  const enabled = groupCards(group).filter((candidate) => !cardDisabled(candidate));
  if (!enabled.length) return;
  const index = Math.max(0, enabled.indexOf(card));
  selectCard(group, enabled[(index + direction + enabled.length) % enabled.length], true);
}

function cardFromEvent(group: HTMLElement, event: Event) {
  const target = event.target instanceof Element ? event.target : null;
  const card = target ? target.closest<HTMLElement>(SELECT_CARD_SELECTOR) : null;
  if (!card || !groupCards(group).includes(card)) return null;
  const interactive = target ? target.closest(INTERACTIVE_SELECTOR) : null;
  return interactive && card.contains(interactive) && interactive !== card ? null : card;
}

function handleKey(group: HTMLElement, event: KeyboardEvent) {
  const card = cardFromEvent(group, event);
  if (!card) return;
  if (event.key === "Enter" || event.key === " ") selectCard(group, card);
  else if (event.key === "ArrowRight" || event.key === "ArrowDown") moveSelection(group, card, 1);
  else if (event.key === "ArrowLeft" || event.key === "ArrowUp") moveSelection(group, card, -1);
  else return;
  event.preventDefault();
}

function bindSelectCardGroup(group: HTMLElement | null) {
  if (!(group instanceof HTMLElement) || group.hasAttribute(frontendDataAttr("select-cards-bound"))) return null;
  group.setAttribute(frontendDataAttr("select-cards-bound"), "true");
  group.addEventListener("click", (event) => {
      const card = cardFromEvent(group, event);
      if (card) selectCard(group, card);
  });
  group.addEventListener("keydown", (event) => handleKey(group, event));
  return group;
}

function bindSelectCards(root: BindRoot = document) {
  queryAll<HTMLElement>(root, SELECT_CARDS_SELECTOR).forEach(bindSelectCardGroup);
}

function selectedCardValue(group: HTMLElement | null) {
  if (!(group instanceof HTMLElement)) return "";
  return cardValue(groupCards(group).find((card) => card.getAttribute("aria-selected") === "true") || null);
}

export {
  SELECT_CARD_EVENT,
  SELECT_CARD_SELECTOR,
  SELECT_CARDS_SELECTOR,
  bindSelectCardGroup,
  bindSelectCards,
  selectCard,
  selectedCardValue,
};
