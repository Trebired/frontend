import React from "react";
import { resolveFrontendLogger } from "#mhi409n0a05q";
import type { contribution_summary } from "./types.js";

function logContributionGraph(
  level: "info" | "warn" | "error",
  message: string,
  metadata: Record<string, unknown>,
) {
  try {
    const logger = resolveFrontendLogger();
    const writer =
    level === "error"
    ? logger.error
    : level === "warn"
    ? logger.warn
    : logger.info;
    writer("profile.contributions.graph", message, metadata);
  } catch {}
}

function useContributionGraphLogging(data: contribution_summary, model: any) {
  React.useEffect(() => {
      logContributionGraph("info", "graph-rendered", {
          activeDays: Number(data.active_days) || 0,
          columnCount: model.columnCount,
          endDate: data.end_date,
          hasContributionData: model.hasContributionData,
          hasInvalidContributionPayload: model.hasInvalidContributionPayload,
          inputDayCount: Array.isArray(data.days) ? data.days.length : 0,
          maxCount: model.maxCount,
          normalizedDayCount: model.normalizedDays.length,
          parsedEndDateValid: !Number.isNaN(model.parsedEndDate.getTime()),
          parsedStartDateValid: !Number.isNaN(model.parsedStartDate.getTime()),
          repoCount: Number(data.repo_count) || 0,
          startDate: data.start_date,
          totalCommits: Number(data.total_commits) || 0,
          userId: data.user_id,
      });
      if (model.hasInvalidContributionPayload) {
        logContributionGraph("warn", "graph-invalid-payload", {
            sampleDays: (Array.isArray(data.days) ? data.days : []).slice(0, 5),
            totalCommits: Number(data.total_commits) || 0,
            userId: data.user_id,
        });
      }
    }, [
      data.active_days,
      data.days,
      data.end_date,
      data.repo_count,
      data.start_date,
      data.total_commits,
      data.user_id,
      model.columnCount,
      model.hasContributionData,
      model.hasInvalidContributionPayload,
      model.maxCount,
      model.normalizedDays.length,
      model.parsedEndDate,
      model.parsedStartDate,
  ]);
}

export { useContributionGraphLogging };
