import { readGraphModel } from "./graph/model.js";
import { renderGraphShell } from "./graph/shell.js";
import type {
  dataset,
  graph_props,
  legend_item,
  point,
} from "./graph/types.js";

function graph(props: graph_props) {
  const model = readGraphModel(props);
  return renderGraphShell(props, model);
}

export type { dataset, graph_props, legend_item, point };
export default graph;
