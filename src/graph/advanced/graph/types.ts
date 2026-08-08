type point = {
  label?: string;
  value?: number;
};

type key_value_row = {
  attrs?: Record<string, unknown>;
  label?: unknown;
  unit?: string;
  value?: unknown;
  value_attrs?: Record<string, unknown>;
  value_html?: string;
};

type key_value_group = {
  rows?: key_value_row[];
  title?: unknown;
};

type dataset = {
  borderDash?: number[];
  borderWidth?: number;
  fill?: string;
  fillArea?: boolean;
  label?: string;
  points?: point[];
  stroke?: string;
};

type legend_item = {
  color?: string;
  label?: string;
};

type graph_props = {
  bottomDetails?: any[];
  bodyClassName?: string;
  datasets?: dataset[];
  description?: string;
  extendGroup?: string;
  extendId?: string;
  fill?: string;
  groups?: key_value_group[];
  id?: string;
  legend?: legend_item[];
  lang?: string;
  loading?: boolean;
  max?: number | null;
  min?: number | null;
  nonce?: string;
  points?: point[];
  precision?: number | null;
  rightDetails?: any[];
  rootAttrs?: Record<string, unknown>;
  rootClassName?: string;
  rows?: key_value_row[];
  scroll?: boolean;
  state?: string;
  stateIcon?: string;
  stateTone?: string;
  stroke?: string;
  subtitle?: string;
  title?: string;
  toolbarContent?: any;
  type?: string;
  unit_default_scale?: string;
  unit_of_measurement?: string;
  unit_selectable?: boolean;
};

export type { dataset, graph_props, key_value_group, key_value_row, legend_item, point };
