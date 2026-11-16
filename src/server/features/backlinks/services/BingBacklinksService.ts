import { AppError } from "@/server/lib/errors";
import {
  findBingSiteUrl,
  getBingLinkCounts,
  getBingUrlLinks,
  hasBingWebmasterKey,
} from "@/server/lib/bing-webmaster";

// Bing only reports links for sites verified in the same Bing Webmaster
// account as the API key, so this is "who links to my site", not a lookup
// for any domain.
const MAX_LINK_COUNT_PAGES = 5;

async function siteUrlFor(domain: string | null | undefined): Promise<string> {
  if (!domain) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Önce Proje ayarları'ndan sitenin adresini ekle.",
    );
  }
  return findBingSiteUrl(domain);
}

async function getOverview(project: { domain: string | null }) {
  if (!(await hasBingWebmasterKey())) {
    return { configured: false as const };
  }
  const siteUrl = await siteUrlFor(project.domain);
  const pages: { url: string; count: number }[] = [];
  let totalPages = 1;
  for (
    let page = 0;
    page < Math.min(totalPages, MAX_LINK_COUNT_PAGES);
    page++
  ) {
    const result = await getBingLinkCounts(siteUrl, page);
    totalPages = result.totalPages;
    pages.push(...result.links.map((l) => ({ url: l.Url, count: l.Count })));
  }
  pages.sort((a, b) => b.count - a.count);
  return {
    configured: true as const,
    siteUrl,
    totalLinks: pages.reduce((sum, p) => sum + p.count, 0),
    pages,
  };
}

async function getLinksToUrl(
  project: { domain: string | null },
  url: string,
  page: number,
) {
  const siteUrl = await siteUrlFor(project.domain);
  const result = await getBingUrlLinks(siteUrl, url, page);
  return {
    links: result.details.map((d) => ({
      sourceUrl: d.Url,
      sourceDomain: safeHostname(d.Url),
      anchorText: d.AnchorText ?? "",
    })),
    totalPages: result.totalPages,
  };
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export const BingBacklinksService = { getOverview, getLinksToUrl } as const;
