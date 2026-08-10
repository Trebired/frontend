import { toText } from "#yrscdg72qcm6";
import { connectedElementsFromSet } from "#er0dlx1gtbzh";

const searchControlsByFamily = new Map<string, Set<HTMLElement>>();
const searchPanelsByFamily = new Map<string, Set<HTMLElement>>();

function registerFamilyElement(
  map: Map<string, Set<HTMLElement>>,
  familyKey: string,
  element: HTMLElement,
) {
  const key = toText(familyKey);
  if (!key || !(element instanceof HTMLElement)) return;
  let elements = map.get(key);
  if (!elements) {
    elements = new Set();
    map.set(key, elements);
  }
  elements.add(element);
}

function registeredFamilyElements(
  map: Map<string, Set<HTMLElement>>,
  familyKey: string,
) {
  const key = toText(familyKey);
  return key ? connectedElementsFromSet(map.get(key)) : [];
}

function allRegisteredSearchPanels() {
  const panels = new Set<HTMLElement>();
  searchPanelsByFamily.forEach((nodes) => {
      connectedElementsFromSet(nodes).forEach((node) => panels.add(node));
  });
  return Array.from(panels);
}

function registeredSearchControls(familyKey: string) {
  return registeredFamilyElements(searchControlsByFamily, familyKey);
}

function registeredSearchPanels(familyKey: string) {
  return registeredFamilyElements(searchPanelsByFamily, familyKey);
}

export {
  allRegisteredSearchPanels,
  registerFamilyElement,
  registeredSearchControls,
  registeredSearchPanels,
  searchControlsByFamily,
  searchPanelsByFamily,
};
