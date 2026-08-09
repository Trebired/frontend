import dropdown from "./manager.js";
import {
  readDropdownRootConfigScript,
  registerDropdownOptions,
  setDropdownRootConfig,
} from "./registry.js";

function bindDropdownElement(root: HTMLElement | null) {
  if (!(root instanceof HTMLElement)) return null;
  setDropdownRootConfig(root, readDropdownRootConfigScript(root));
  registerDropdownOptions(root);
  dropdown.bind(root);
  return root;
}

function defineDropdownElement() {}

export { bindDropdownElement, defineDropdownElement };
