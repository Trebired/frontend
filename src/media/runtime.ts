import type { BindRoot } from "#er0dlx1gtbzh";
import { bindCarousels } from "./carousel/runtime.js";
import { bindEmbedFrames } from "./embed/runtime.js";
import { bindExpandableImages } from "./lightbox-runtime.js";

function bindMedia(root: BindRoot = document) {
  bindCarousels(root);
  bindEmbedFrames(root);
  bindExpandableImages(root);
}

export { bindMedia };
