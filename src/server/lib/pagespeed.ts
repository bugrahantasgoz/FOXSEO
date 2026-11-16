import {
  buildStoredLighthousePayload,
  lighthouseResponseSchema,
  type LighthouseStrategy,
} from "@/server/lib/dataforseoLighthousePayload";
import type { StoredLighthousePayload } from "@/server/lib/lighthouseStoredPayload";
import { getOptionalEnvValue } from "@/server/lib/runtime-env";

// Google PageSpeed Insights runs the same Lighthouse report for free. A key
// (PAGESPEED_API_KEY) is optional; without one Google allows a small daily
// quota, which is enough for a personal site.
const PAGESPEED_URL =
  "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const REQUEST_TIMEOUT_MS = 90_000;
const CATEGORIES = ["PERFORMANCE", "ACCESSIBILITY", "BEST_PRACTICES", "SEO"];

export async function fetchPageSpeedLighthouse(input: {
  url: string;
  strategy: LighthouseStrategy;
}): Promise<StoredLighthousePayload> {
  const params = new URLSearchParams({ url: input.url, strategy: input.strategy });
  for (const category of CATEGORIES) params.append("category", category);
  const key = await getOptionalEnvValue("PAGESPEED_API_KEY");
  if (key) params.set("key", key);

  const response = await fetch(`${PAGESPEED_URL}?${params}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "object" &&
      body.error !== null &&
      "message" in body.error
        ? String(body.error.message)
        : `HTTP ${response.status}`;
    throw new Error(`PageSpeed Insights failed: ${message}`);
  }

  const report =
    typeof body === "object" && body !== null && "lighthouseResult" in body
      ? lighthouseResponseSchema.parse(body.lighthouseResult)
      : null;
  if (!report) {
    throw new Error("PageSpeed Insights response missing lighthouseResult");
  }

  return buildStoredLighthousePayload(report, {
    url: input.url,
    strategy: input.strategy,
    source: "pagespeed-insights",
    providerLabel: "PageSpeed Insights",
    taskId: null,
    cost: null,
  });
}
