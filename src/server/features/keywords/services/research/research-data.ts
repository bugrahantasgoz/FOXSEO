import type { AdsKeywordIdeaItem } from "@/server/lib/dataforseo";
import type { BillingCustomerContext } from "@/server/billing/subscription";
import type { CreditFeature } from "@/shared/billing-credit-features";
import { getBingRelatedKeywords } from "@/server/lib/bing-webmaster";
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
 * FOXSEO keyword research runs on the free Bing Webmaster API. Volume is the
 * keyword's Bing impressions over the last 30 days; CPC, difficulty and intent
 * have no free source, so they stay empty.
 */
async function fetchBingRows(
  params: Omit<FetchResearchRowsParams, "source">,
): Promise<EnrichedKeyword[]> {
  const country = getIsoCountryCode(params.locationCode);
  const items = await getBingRelatedKeywords({
    keyword: params.seedKeyword,
    country,
    language: `${params.languageCode}-${country.toUpperCase()}`,
  });

  const rows: EnrichedKeyword[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const keyword = normalizeKeyword(item.Query);
    if (!keyword || seen.has(keyword)) continue;
    seen.add(keyword);
    rows.push({
      keyword,
      searchVolume: item.Impressions ?? null,
      trend: [],
      cpc: null,
      competition: null,
      keywordDifficulty: null,
      intent: "unknown",
    });
    if (rows.length >= params.resultLimit) break;
  }
  return rows;
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
  return fetchBingRows(params);
}

export async function fetchResearchRowsBySource(
  params: FetchResearchRowsParams,
  _billingCustomer: BillingCustomerContext,
): Promise<EnrichedKeyword[]> {
  return fetchBingRows(params);
}
