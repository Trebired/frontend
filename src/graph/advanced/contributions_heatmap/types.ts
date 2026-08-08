type contribution_day = {
  count: number;
  date: string;
};

type contribution_summary = {
  active_days: number;
  days: contribution_day[];
  end_date: string;
  repo_count: number;
  start_date: string;
  total_commits: number;
  user_id: string;
};

type contributions_graph_props = {
  data: contribution_summary;
  emptyDescription?: string;
  lang?: string;
};

type heatmap_tooltip_state = {
  label: string;
  left: number;
  top: number;
};

type ContributionTranslator = (
  key: string,
  variables?: Record<string, unknown>,
) => string;

export type {
  ContributionTranslator,
  contribution_day,
  contribution_summary,
  contributions_graph_props,
  heatmap_tooltip_state,
};
