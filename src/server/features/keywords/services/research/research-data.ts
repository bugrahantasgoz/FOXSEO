import type { AdsKeywordIdeaItem } from "@/server/lib/dataforseo";
import type { BillingCustomerContext } from "@/server/billing/subscription";
import type { CreditFeature } from "@/shared/billing-credit-features";
import {
  getBingRelatedKeywords,
  hasBingWebmasterKey,
} from "@/server/lib/bing-webmaster";
import { getGoogleKeywordIdeas } from "@/server/lib/google-suggest";
import { getIsoCountryCode } from "@/shared/keyword-locations";
import { normalizeKeyword, type EnrichedKeyword } from "./helpers";
import type { KeywordSource } from "./selection";

type FetchResearchRowsParams = {
  seedKeyword: string;
  locationCode: number;
  languageCode: string;
  resultLimit: number;
  source: KeywordSource;
  includeClickstreamData?: boolean;
  ignoreSynonyms?: boolean;
  filters?: unknown[];
  creditFeature?: CreditFeature;
};

/**
 * FOXSEO keyword research on free sources:
 * - ideas come from Google's autocomplete suggestions for the country and
 *   language, so they are real Google searches around the seed;
 * - volume is the Bing impressions over the last 30 days where Bing has them
 *   (needs the free Bing Webmaster key; empty otherwise);
 * - CPC, difficulty and intent have no free source and stay empty.
 */
async function fetchFreeRows(
  params: Omit<FetchResearchRowsParams, "source">,
): Promise<EnrichedKeyword[]> {
  const country = getIsoCountryCode(params.locationCode);
  const [ideas, bing] = await Promise.all([
    getGoogleKeywordIdeas({
      keyword: params.seedKeyword,
      language: params.languageCode,
      country,
      limit: params.resultLimit,
    }),
    fetchBingVolumes(params, country),
  ]);

  const rows: EnrichedKeyword[] = [];
  const seen = new Set<string>();
  const add = (raw: string, searchVolume: number | null) => {
    const keyword = normalizeKeyword(raw);
    if (!keyword || seen.has(keyword) || rows.length >= params.resultLimit) {
      return;
    }
    seen.add(keyword);
    rows.push({
      keyword,
      searchVolume,
      trend: [],
      cpc: null,
      competition: null,
      keywordDifficulty: null,
      intent: "unknown",
    });
  };

  add(params.seedKeyword, bing.get(normalizeKeyword(params.seedKeyword)) ?? null);
  for (const idea of ideas) add(idea, bing.get(normalizeKeyword(idea)) ?? null);
  // Bing's related keywords are broad ("en iyi sürücü kursu" brings "en iyi
  // filmler"), so only those containing every word of the seed are kept.
  const seedWords = normalizeKeyword(params.seedKeyword).split(" ");
  for (const [keyword, volume] of bing) {
    if (seedWords.every((word) => keyword.split(" ").includes(word))) {
      add(keyword, volume);
    }
  }
  return rows;
}

/** Bing impressions by normalized keyword; empty without a Bing key or on error. */
async function fetchBingVolumes(
  params: Omit<FetchResearchRowsParams, "source">,
  country: string,
): Promise<Map<string, number>> {
  const volumes = new Map<string, number>();
  if (!(await hasBingWebmasterKey())) return volumes;
  try {
    const items = await getBingRelatedKeywords({
      keyword: params.seedKeyword,
      country,
      language: `${params.languageCode}-${country.toUpperCase()}`,
    });
    for (const item of items) {
      if (item.Impressions != null) {
        volumes.set(normalizeKeyword(item.Query), item.Impressions);
      }
    }
  } catch (error) {
    console.warn("keywords.research.bing-volumes failed:", error);
  }
  return volumes;
}

/**
 * Google Ads items carry volume / CPC / paid competition but no keyword
 * difficulty or search intent. Only the (DataForSEO-backed) local volume path
 * still uses this mapper.
 */
export function mapAdsKeywordItems(
  items: AdsKeywordIdeaItem[],
): EnrichedKeyword[] {
  const rows: EnrichedKeyword[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const keyword = item.keyword;
    if (!keyword) continue;

    const normalized = normalizeKeyword(keyword);
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    rows.push({
      keyword: normalized,
      searchVolume: item.search_volume ?? null,
      trend: (item.monthly_searches ?? []).map((entry) => ({
        year: entry.year ?? 0,
        month: entry.month ?? 0,
        searchVolume: entry.search_volume ?? 0,
      })),
      cpc: item.cpc ?? null,
      competition:
        item.competition_index != null ? item.competition_index / 100 : null,
      keywordDifficulty: null,
      intent: "unknown",
    });
  }

  return rows;
}

export async function fetchGoogleAdsResearchRows(
  params: Omit<FetchResearchRowsParams, "source">,
  _billingCustomer: BillingCustomerContext,
): Promise<EnrichedKeyword[]> {
  return fetchFreeRows(params);
}

export async function fetchResearchRowsBySource(
  params: FetchResearchRowsParams,
  _billingCustomer: BillingCustomerContext,
): Promise<EnrichedKeyword[]> {
  return fetchFreeRows(params);
}
