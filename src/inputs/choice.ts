import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { frontendDataAttr, frontendDataSelector, frontendEventName } from "#5vbaqj4pirp3";

const CHECKBOX_GROUP_SELECTOR = frontendDataSelector("checkbox-group");
const CHECKBOX_ALL_SELECTOR = frontendDataSelector("checkbox-all");
const RADIO_GROUP_SELECTOR = frontendDataSelector("radio-group");
const CHOICE_EVENT = frontendEventName("choice");

function checkboxInputs(root: HTMLElement) {
  return queryAll<HTMLInputElement>(root, "input[type='checkbox']").filter((input) => !input.matches(CHECKBOX_ALL_SELECTOR));
}

function syncCheckboxAll(root: HTMLElement) {
  const inputs = checkboxInputs(root);
  const checked = inputs.filter((input) => input.checked).length;
  queryAll<HTMLInputElement>(root, CHECKBOX_ALL_SELECTOR).forEach((input) => {
      input.checked = inputs.length > 0 && checked === inputs.length;
      input.indeterminate = checked > 0 && checked < inputs.length;
  });
  root.dispatchEvent(new CustomEvent(CHOICE_EVENT, { bubbles: true, detail: { checked, root, total: inputs.length } }));
}

function bindCheckboxGroup(root: HTMLElement | null) {
  if (!(root instanceof HTMLElement) || root.hasAttribute(frontendDataAttr("checkbox-bound"))) return null;
  root.setAttribute(frontendDataAttr("checkbox-bound"), "true");
  checkboxInputs(root).forEach((input) => input.addEventListener("change", () => syncCheckboxAll(root)));
  queryAll<HTMLInputElement>(root, CHECKBOX_ALL_SELECTOR).forEach((input) => {
      input.addEventListener("change", () => {
          checkboxInputs(root).forEach((item) => {
              item.checked = input.checked;
              item.dispatchEvent(new Event("change", { bubbles: true }));
          });
          syncCheckboxAll(root);
      });
  });
  syncCheckboxAll(root);
  return root;
}

function moveRadioFocus(root: HTMLElement, input: HTMLInputElement, direction: number) {
  const radios = queryAll<HTMLInputElement>(root, "input[type='radio']");
  const index = radios.indexOf(input);
  const next = radios[(index + direction + radios.length) % radios.length];
  if (!next) return;
  next.checked = true;
  next.focus();
  next.dispatchEvent(new Event("change", { bubbles: true }));
}

function bindRadioGroup(root: HTMLElement | null) {
  if (!(root instanceof HTMLElement) || root.hasAttribute(frontendDataAttr("radio-bound"))) return null;
  root.setAttribute(frontendDataAttr("radio-bound"), "true");
  queryAll<HTMLInputElement>(root, "input[type='radio']").forEach((input) => {
      input.addEventListener("keydown", (event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowDown") moveRadioFocus(root, input, 1);
          else if (event.key === "ArrowLeft" || event.key === "ArrowUp") moveRadioFocus(root, input, -1);
          else return;
          event.preventDefault();
      });
  });
  return root;
}

function bindChoiceControls(root: BindRoot = document) {
  queryAll<HTMLElement>(root, CHECKBOX_GROUP_SELECTOR).forEach(bindCheckboxGroup);
  queryAll<HTMLElement>(root, RADIO_GROUP_SELECTOR).forEach(bindRadioGroup);
}

export {
  CHECKBOX_ALL_SELECTOR,
  CHECKBOX_GROUP_SELECTOR,
  CHOICE_EVENT,
  RADIO_GROUP_SELECTOR,
  bindCheckboxGroup,
  bindChoiceControls,
  bindRadioGroup,
  syncCheckboxAll,
};
