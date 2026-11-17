import { beforeEach, describe, expect, it, vi } from "vitest";

const getPerformance = vi.hoisted(() => vi.fn());

vi.mock("@/server/features/gsc/services/GscService", async () => ({
  GscNotConnectedError: (await import("@/server/lib/gscErrors"))
    .GscNotConnectedError,
  GscService: { getPerformance },
}));

import { GscNotConnectedError } from "@/server/lib/gscErrors";
import { fetchGscQueryMetrics } from "./research-gsc";

const input = {
  projectId: "project_1",
  keywords: ["Adana Sürücü Kursu"],
  locationCode: 2792,
  languageCode: "tr",
  resultLimit: 150 as const,
  mode: "ideas" as const,
  clickstream: false,
  groupKeywords: true,
};

describe("fetchGscQueryMetrics", () => {
  beforeEach(() => {
    getPerformance.mockResolvedValue({
      rows: [
        {
          keys: ["adana sürücü kursu fiyatları"],
          impressions: 120,
          clicks: 9,
          ctr: 0.075,
          position: 6.43,
        },
      ],
    });
  });

  it("asks Search Console for queries containing the seed's main word", async () => {
    const metrics = await fetchGscQueryMetrics(input);
    expect(getPerformance).toHaveBeenCalledWith(
      expect.objectContaining({
        dimensions: ["query"],
        filters: [
          { dimension: "query", operator: "contains", expression: "sürücü" },
        ],
      }),
    );
    expect(metrics.get("adana sürücü kursu fiyatları")).toEqual({
      impressions: 120,
      clicks: 9,
      position: 6.4,
    });
  });

  it("returns nothing when Search Console is not connected", async () => {
    getPerformance.mockRejectedValueOnce(new GscNotConnectedError("project_1"));
    expect((await fetchGscQueryMetrics(input)).size).toBe(0);
  });
});
