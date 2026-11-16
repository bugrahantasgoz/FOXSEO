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
  "Bing Webmaster API anahtarı eksik. FOXSEO → Ayarlar (API anahtarları) ile BING_WEBMASTER_API_KEY ekle.";

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
  let response: Response;
  let text: string;
  try {
    response = await fetch(`${BASE_URL}/${method}?${query}`, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    text = await response.text();
  } catch (error) {
    throw bingFailure(
      method,
      error instanceof Error ? error.message : String(error),
    );
  }
  if (!response.ok) {
    // Bing returns an ApiFault with a Message; never echo the key back.
    const message = /"Message"\s*:\s*"([^"]+)"/.exec(text)?.[1];
    throw bingFailure(method, message ?? `HTTP ${response.status}`);
  }
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    throw bingFailure(method, "yanıt JSON değil");
  }
  const parsed = z.object({ d: z.unknown() }).safeParse(body);
  if (!parsed.success) throw bingFailure(method, "beklenmeyen yanıt");
  return parsed.data.d;
}

function bingFailure(method: string, reason: string): AppError {
  const detail = `Bing Webmaster API ${method} failed: ${reason}`;
  console.warn(detail);
  return new AppError("BING_REQUEST_FAILED", detail);
}

/** Parses a Bing payload; an unexpected shape is a Bing failure, not a crash. */
function parseBing<T>(method: string, schema: z.ZodType<T>, data: unknown): T {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw bingFailure(
      method,
      `beklenmeyen veri: ${parsed.error.issues[0]?.message ?? ""}`,
    );
  }
  return parsed.data;
}

function hostKey(url: string): string {
  return url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");
}

const userSitesSchema = z
  .array(
    z.object({
      Url: z.string(),
      IsVerified: z.boolean().optional(),
    }),
  )
  .nullable();

/**
 * The site's address exactly as it is registered in the user's Bing
 * Webmaster account (http/https and www must match for the link APIs).
 */
export async function findBingSiteUrl(domain: string): Promise<string> {
  const sites =
    parseBing(
      "GetUserSites",
      userSitesSchema,
      await bingGet("GetUserSites", {}),
    ) ?? [];
  const wanted = hostKey(domain);
  const matches = sites.filter((site) => hostKey(site.Url) === wanted);
  const site = matches.find((m) => m.IsVerified !== false) ?? matches[0];
  if (!site) {
    throw new AppError(
      "BING_SITE_NOT_FOUND",
      `${domain} Bing Webmaster hesabında bulunamadı.`,
    );
  }
  return site.Url;
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
  const rows =
    parseBing(
      "GetRelatedKeywords",
      z.array(keywordSchema).nullable(),
      related,
    ) ?? [];
  const seedRow = keywordSchema.safeParse(seed);
  return seedRow.success ? [seedRow.data, ...rows] : rows;
}

const linkCountsSchema = z
  .object({
    Links: z
      .array(z.object({ Url: z.string(), Count: z.number() }))
      .nullable()
      .optional(),
    TotalPages: z.number().optional(),
  })
  .nullable();

/** Pages of a verified site with how many inbound links Bing knows for each. */
export async function getBingLinkCounts(siteUrl: string, page = 0) {
  const data = parseBing(
    "GetLinkCounts",
    linkCountsSchema,
    await bingGet("GetLinkCounts", { siteUrl, page: String(page) }),
  );
  return { links: data?.Links ?? [], totalPages: data?.TotalPages ?? 0 };
}

const linkDetailsSchema = z
  .object({
    Details: z
      .array(z.object({ Url: z.string(), AnchorText: z.string().nullable() }))
      .nullable()
      .optional(),
    TotalPages: z.number().optional(),
  })
  .nullable();

/** Linking pages (with anchor text) for one URL of a verified site. */
export async function getBingUrlLinks(siteUrl: string, link: string, page = 0) {
  const data = parseBing(
    "GetUrlLinks",
    linkDetailsSchema,
    await bingGet("GetUrlLinks", { siteUrl, link, page: String(page) }),
  );
  return { details: data?.Details ?? [], totalPages: data?.TotalPages ?? 0 };
}
