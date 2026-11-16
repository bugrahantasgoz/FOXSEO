import { z } from "zod";
import { AppError } from "@/server/lib/errors";
import { getOptionalEnvValue } from "@/server/lib/runtime-env";

// Bing Webmaster Tools API: free, with a personal API key from
// bing.com/webmasters → Settings → API Access. FOXSEO uses it for keyword
// ideas and volumes (Bing search impressions) and for the backlinks of sites
// verified in the same Bing account.
const BASE_URL = "https://ssl.bing.com/webmaster/api.svc/json";
const REQUEST_TIMEOUT_MS = 30_000;

const BING_NOT_SET_UP_MESSAGE =
  "Bing Webmaster API key is missing. Add BING_WEBMASTER_API_KEY to .env.local (see the FOXSEO setup guide).";

export async function hasBingWebmasterKey(): Promise<boolean> {
  return Boolean(await getOptionalEnvValue("BING_WEBMASTER_API_KEY"));
}

async function bingGet(
  method: string,
  params: Record<string, string>,
): Promise<unknown> {
  const apiKey = await getOptionalEnvValue("BING_WEBMASTER_API_KEY");
  if (!apiKey) {
    throw new AppError("BING_NOT_CONFIGURED", BING_NOT_SET_UP_MESSAGE);
  }
  const query = new URLSearchParams({ ...params, apikey: apiKey });
  const response = await fetch(`${BASE_URL}/${method}?${query}`, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const text = await response.text();
  if (!response.ok) {
    // Bing returns an ApiFault with a Message; never echo the key back.
    const message = /"Message"\s*:\s*"([^"]+)"/.exec(text)?.[1];
    const detail = `Bing Webmaster API ${method} failed: ${message ?? `HTTP ${response.status}`}`;
    console.warn(detail);
    throw new AppError("BING_REQUEST_FAILED", detail);
  }
  const body: unknown = JSON.parse(text);
  return z.object({ d: z.unknown() }).parse(body).d;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const keywordSchema = z.object({
  Query: z.string(),
  Impressions: z.number().nullable().optional(),
  BroadImpressions: z.number().nullable().optional(),
});

type BingKeyword = z.infer<typeof keywordSchema>;

/**
 * Related keywords with their exact-match Bing impressions over the last 30
 * days, which is the closest free stand-in for monthly search volume.
 */
export async function getBingRelatedKeywords(input: {
  keyword: string;
  country: string;
  language: string;
}): Promise<BingKeyword[]> {
  const end = new Date();
  const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  const params = {
    q: input.keyword,
    country: input.country,
    language: input.language,
    startDate: isoDate(start),
    endDate: isoDate(end),
  };
  const [related, seed] = await Promise.all([
    bingGet("GetRelatedKeywords", params),
    bingGet("GetKeyword", params).catch(() => null),
  ]);
  const rows = z.array(keywordSchema).parse(related ?? []);
  const seedRow = keywordSchema.safeParse(seed);
  return seedRow.success ? [seedRow.data, ...rows] : rows;
}

const linkCountsSchema = z.object({
  Links: z
    .array(z.object({ Url: z.string(), Count: z.number() }))
    .nullable()
    .optional(),
  TotalPages: z.number().optional(),
});

/** Pages of a verified site with how many inbound links Bing knows for each. */
export async function getBingLinkCounts(siteUrl: string, page = 0) {
  const data = linkCountsSchema.parse(
    await bingGet("GetLinkCounts", { siteUrl, page: String(page) }),
  );
  return { links: data.Links ?? [], totalPages: data.TotalPages ?? 0 };
}

const linkDetailsSchema = z.object({
  Details: z
    .array(z.object({ Url: z.string(), AnchorText: z.string().nullable() }))
    .nullable()
    .optional(),
  TotalPages: z.number().optional(),
});

/** Linking pages (with anchor text) for one URL of a verified site. */
export async function getBingUrlLinks(
  siteUrl: string,
  link: string,
  page = 0,
) {
  const data = linkDetailsSchema.parse(
    await bingGet("GetUrlLinks", { siteUrl, link, page: String(page) }),
  );
  return { details: data.Details ?? [], totalPages: data.TotalPages ?? 0 };
}
