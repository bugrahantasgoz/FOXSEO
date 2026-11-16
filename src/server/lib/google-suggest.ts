// Keyword ideas from Google's autocomplete suggestions: what people type into
// Google, for the chosen country and language. This is the public endpoint
// browsers use for search suggestions, not an official API, so FOXSEO keeps
// the number of requests per search small.

const SUGGEST_URL = "https://suggestqueries.google.com/complete/search";
const REQUEST_TIMEOUT_MS = 10_000;
const CONCURRENCY = 4;

// "seed", then "seed a", "seed b", ... to widen the ideas. Turkish letters
// are included so Turkish searches get their full alphabet.
const EXPANSIONS = [
  "",
  ..."abcdefghijklmnoprstuvyz".split(""),
  "ç",
  "ğ",
  "ı",
  "ö",
  "ş",
  "ü",
];

async function fetchSuggestions(
  query: string,
  language: string,
  country: string,
): Promise<string[]> {
  const params = new URLSearchParams({
    client: "firefox",
    hl: language,
    gl: country,
    ie: "utf-8",
    oe: "utf-8",
    q: query,
  });
  try {
    const response = await fetch(`${SUGGEST_URL}?${params}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) return [];
    const body: unknown = await response.json();
    if (!Array.isArray(body) || !Array.isArray(body[1])) return [];
    return body[1].filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

/**
 * Google autocomplete ideas for a seed keyword, most relevant first, without
 * duplicates. An empty list means Google had no suggestions or could not be
 * reached.
 */
export async function getGoogleKeywordIdeas(input: {
  keyword: string;
  language: string;
  country: string;
  limit: number;
}): Promise<string[]> {
  const seed = input.keyword.trim();
  const queries = EXPANSIONS.map((suffix) =>
    suffix ? `${seed} ${suffix}` : seed,
  );
  const results: string[][] = Array.from({ length: queries.length }, () => []);
  let next = 0;
  async function worker() {
    while (next < queries.length) {
      const index = next++;
      results[index] = await fetchSuggestions(
        queries[index],
        input.language,
        input.country,
      );
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const seen = new Set<string>();
  const ideas: string[] = [];
  for (const suggestion of results.flat()) {
    const key = suggestion.trim().toLocaleLowerCase(input.language);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    ideas.push(suggestion.trim());
    if (ideas.length >= input.limit) break;
  }
  return ideas;
}
