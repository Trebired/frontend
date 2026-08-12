export *from "./components/index.js";
export *from "./content.js";
export *from "./viewer/index.js";

import type { BindRoot } from "#er0dlx1gtbzh";
import { bindEditorContentFields } from "./content.js";

function bindEditors(root: BindRoot = document) {
  bindEditorContentFields(root);
}

export { bindEditors };
