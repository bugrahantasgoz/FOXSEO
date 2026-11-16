import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/lib/runtime-env", () => ({
  getOptionalEnvValue: vi.fn(async () => "test-key"),
}));

import { findBingSiteUrl, getBingLinkCounts } from "./bing-webmaster";

function bingReturns(d: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ d }), { status: 200 })),
  );
}

describe("Bing Webmaster client", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("finds the site as registered in Bing, with or without www", async () => {
    bingReturns([
      { Url: "https://www.other.com/", IsVerified: true },
      { Url: "https://www.ulusoysurucukursu.com/", IsVerified: true },
    ]);
    await expect(findBingSiteUrl("ulusoysurucukursu.com")).resolves.toBe(
      "https://www.ulusoysurucukursu.com/",
    );
  });

  it("reports a site missing from the Bing account", async () => {
    bingReturns([{ Url: "https://other.com/", IsVerified: true }]);
    await expect(
      findBingSiteUrl("ulusoysurucukursu.com"),
    ).rejects.toMatchObject({ code: "BING_SITE_NOT_FOUND" });
  });

  it("treats an empty link report as no links", async () => {
    bingReturns(null);
    await expect(getBingLinkCounts("https://example.com/")).resolves.toEqual({
      links: [],
      totalPages: 0,
    });
  });

  it("turns an unexpected payload into a Bing error, not a crash", async () => {
    bingReturns({ Links: "nope" });
    await expect(
      getBingLinkCounts("https://example.com/"),
    ).rejects.toMatchObject({ code: "BING_REQUEST_FAILED" });
  });
});
