import {
  GscNotConnectedError,
  GscService,
} from "@/server/features/gsc/services/GscService";
import type { KeywordResearchRow } from "@/types/keywords";
import type { ResolvedResearchKeywordsInput } from "@/types/schemas/keywords";
import { normalizeKeyword } from "./helpers";

/**
 * The project's own Search Console numbers (last 3 months) for queries around
 * the seed keyword, keyed by normalized query. Empty when Search Console is
 * not connected or the request fails.
 */
export async function fetchGscQueryMetrics(
  input: ResolvedResearchKeywordsInput,
): Promise<Map<string, NonNullable<KeywordResearchRow["gsc"]>>> {
  const metrics = new Map<string, NonNullable<KeywordResearchRow["gsc"]>>();
  const seed = normalizeKeyword(input.keywords[0] ?? "");
  // Only the seed's most distinctive word filters the query list, so related
  // ideas ("adana sürücü kursu fiyatları") still match.
  const anchor = seed
    .split(" ")
    .reduce(
      (longest, word) => (word.length > longest.length ? word : longest),
      "",
    );
  if (!anchor) return metrics;
  try {
    const report = await GscService.getPerformance({
      projectId: input.projectId,
      dimensions: ["query"],
      dateRange: "last_3_months",
      filters: [
        { dimension: "query", operator: "contains", expression: anchor },
      ],
      rowLimit: 5000,
    });
    for (const row of report.rows) {
      const query = row.keys?.[0];
      if (!query) continue;
      metrics.set(normalizeKeyword(query), {
        impressions: row.impressions,
        clicks: row.clicks,
        position: Math.round(row.position * 10) / 10,
      });
    }
  } catch (error) {
    if (!(error instanceof GscNotConnectedError)) {
      console.warn("keywords.research.gsc-metrics failed:", error);
    }
  }
  return metrics;
}
