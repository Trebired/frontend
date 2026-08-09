import { Grid, Stack, card } from "#hzrmwbvgt2ax";
import { createLocalTranslator } from "./shared.js";

type stats_breakdown_props = {
  groupStatsId: string;
  lang?: string;
  labels?: {
    groups?: string;
    levels?: string;
  };
  levelStatsId: string;
};

function stats_breakdown(props: stats_breakdown_props) {
  const localT = createLocalTranslator(import.meta.url, props.lang);
  const labels = props.labels || {};
  return (
    <Grid gap="sm">
    {card({
          gap: "xs",
          children: (
            <>
            <span className="label">{labels.levels || localT("levels")}</span>
            <Stack
            className="max-height-lg scroll scroll-min"
            gap="xs"
            id={String(props.levelStatsId || "")}
            />
            </>
          ),
    })}
    {card({
          gap: "xs",
          children: (
            <>
            <span className="label">{labels.groups || localT("groups")}</span>
            <Stack
            className="max-height-lg scroll scroll-min"
            gap="xs"
            id={String(props.groupStatsId || "")}
            />
            </>
          ),
    })}
    </Grid>
  );
}

export type { stats_breakdown_props };
export default stats_breakdown;
