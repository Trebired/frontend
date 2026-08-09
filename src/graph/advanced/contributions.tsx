import { createLocalTranslator } from "./_shared.js";
import React from "react";
import {
  buildContributionGraphModel,
  contributionCountText,
} from "./contributions_heatmap/model.js";
import { emptyCard, heatmapCard } from "./contributions_heatmap/render.js";
import { useContributionGraphLogging } from "./contributions_heatmap/logging.js";
import { pill } from "./_shared.js";
import { InlineRow, Stack } from "#hzrmwbvgt2ax";
import type {
  contribution_day,
  contribution_summary,
  contributions_graph_props,
  heatmap_tooltip_state,
} from "./contributions_heatmap/types.js";

function useHeatmapTooltip() {
  const [tooltip, setTooltip] = React.useState<heatmap_tooltip_state | null>(
    null,
  );

  function showTooltipAtClientPosition(
    label: string,
    clientX: number,
    clientY: number,
  ) {
    setTooltip({
        label,
        left: clientX,
        top: clientY - 12,
    });
  }

  function showTooltipForRect(label: string, rect: DOMRect) {
    setTooltip({
        label,
        left: rect.left + rect.width / 2,
        top: rect.top - 8,
    });
  }

  function hideTooltip() {
    setTooltip(null);
  }

  return {
    controls: { hideTooltip, showTooltipAtClientPosition, showTooltipForRect },
    tooltip,
  };
}

function contributionStatsPills(
  data: contributions_graph_props["data"],
  t: ReturnType<typeof createLocalTranslator>,
) {
  const totalCommits = Number(data.total_commits) || 0;
  const activeDays = Number(data.active_days) || 0;
  const repoCount = Number(data.repo_count) || 0;
  return (
    <InlineRow gap="xs2" wrap>
    {pill({
          children: (
            <>
            {contributionCountText(
                t,
                totalCommits,
                "contributionCommitCount",
                "contributionCommitsCount",
            )}
            </>
          ),
    })}
    {pill({
          children: (
            <>
            {contributionCountText(
                t,
                activeDays,
                "contributionActiveDayCount",
                "contributionActiveDaysCount",
            )}
            </>
          ),
    })}
    {pill({
          children: (
            <>
            {contributionCountText(
                t,
                repoCount,
                "contributionRepoCount",
                "contributionReposCount",
            )}
            </>
          ),
    })}
    </InlineRow>
  );
}

function contributions_graph(props: contributions_graph_props) {
  const data = props.data;
  const localT = createLocalTranslator(import.meta.url, props.lang);
  const model = buildContributionGraphModel(data, localT);
  const { controls, tooltip } = useHeatmapTooltip();

  useContributionGraphLogging(data, model);

  return (
    <Stack gap="sm">
    {contributionStatsPills(data, localT)}

    {model.hasContributionData
      ? heatmapCard(model, tooltip, controls, localT)
      : emptyCard(props, model)}
    </Stack>
  );
}

export default contributions_graph;
export type { contribution_day, contribution_summary };
