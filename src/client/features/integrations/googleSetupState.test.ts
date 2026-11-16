import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { GoogleConnectionCard } from "@/client/features/integrations/GoogleConnectionCard";
import type { GooglePickerAccount } from "./GooglePropertyPicker";
import { SearchConsoleOnboardingStep } from "@/client/features/onboarding/SearchConsoleOnboardingStep";

vi.mock("@/serverFunctions/gsc", () => ({
  getGscConnection: vi.fn(),
  listGscSites: vi.fn(),
  setGscSite: vi.fn(),
  disconnectGsc: vi.fn(),
}));
vi.mock("@/serverFunctions/ga4", () => ({
  getGa4Connection: vi.fn(),
  listGa4Properties: vi.fn(),
  setGa4Property: vi.fn(),
  disconnectGa4: vi.fn(),
}));
vi.mock("@/serverFunctions/projects", () => ({ getProjects: vi.fn() }));
vi.mock("@/serverFunctions/googleAccounts", () => ({
  getGoogleAccountRemovalImpact: vi.fn(),
  removeGoogleAccount: vi.fn(),
}));
vi.mock("@/client/features/integrations/startGoogleLink", () => ({
  startGoogleLink: vi.fn(),
  useGoogleLinkPending: () => false,
}));
vi.mock("@/client/features/integrations/googleLinkError", () => ({
  getGoogleLinkError: () => null,
  clearGoogleLinkError: vi.fn(),
  reportGoogleLinkErrorOnce: vi.fn(),
}));
vi.mock("@/client/lib/posthog", () => ({ captureClientEvent: vi.fn() }));

function renderSetup(
  surface: "gsc" | "ga4" | "onboarding",
  hasGrant: boolean,
  connected = false,
  canManage = true,
  {
    connectionError,
    accounts,
  }: {
    connectionError?: "initial" | "refetch";
    accounts?: GooglePickerAccount[];
  } = {},
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, retryOnMount: false } },
  });
  client.setQueryData(["projects"], [{ id: "project-a" }]);
  const provider = surface === "ga4" ? "ga4" : "gsc";
  client.setQueryData([`${provider}Connection`, "project-a"], {
    connected,
    currentUserHasGrant: hasGrant,
    canManage,
    googleOAuthConfigured: true,
    property: "https://example.com/",
  });
  if (accounts) {
    client.setQueryData(
      [provider === "gsc" ? "gscSites" : "ga4Properties", "project-a"],
      { accounts },
    );
  }
  if (connectionError) {
    client
      .getQueryCache()
      .find({
        queryKey: [`${provider}Connection`, "project-a"],
      })
      ?.setState({
        status: "error",
        error: new Error("Connection check failed"),
        ...(connectionError === "initial" ? { data: undefined } : {}),
      });
  }
  const component =
    surface === "onboarding"
      ? createElement(SearchConsoleOnboardingStep, {
          onNext: vi.fn(),
          onBack: vi.fn(),
          onSkip: vi.fn(),
        })
      : createElement(GoogleConnectionCard, {
          provider,
          projectId: "project-a",
        });
  const html = renderToStaticMarkup(
    createElement(QueryClientProvider, { client }, component),
  );
  client.clear();
  return html;
}

describe.each(["gsc", "ga4", "onboarding"] as const)(
  "%s setup from persisted authorization",
  (surface) => {
    it("opens property selection without a browser resume flag after authorization", () => {
      const html = renderSetup(surface, true);
      expect(html).toContain("Mülk seç");
      expect(html).toContain("Google hesabı ekle");
      expect(html).not.toContain("Google ile bağla");
    });
  },
);

it.each(["gsc", "ga4"] as const)(
  "does not automatically open property editing for a %s viewer",
  (surface) => {
    const html = renderSetup(surface, true, false, false);
    expect(html).not.toContain("Mülk seç");
    expect(html).not.toContain("Mülkü kaydet");
    expect(html).toContain("Google hesaplarını yönet");
  },
);

describe("onboarding connection actions", () => {
  it("keeps cached property setup and a single footer after a failed refetch", () => {
    const html = renderSetup("onboarding", true, false, true, {
      connectionError: "refetch",
    });
    expect(html).toContain("Mülk seç");
    expect(html).not.toContain("check your Google connection.");
    expect(html.match(/Kaydet ve devam et/g)).toHaveLength(1);
    expect(html.match(/Şimdilik atla/g)).toHaveLength(1);
    expect(html.match(/ Geri<\/button>/g)).toHaveLength(1);
  });

  it("keeps a saved connection usable after a failed refetch", () => {
    const html = renderSetup("onboarding", true, true, true, {
      connectionError: "refetch",
    });
    expect(html).toContain("https://example.com/");
    expect(html).toMatch(/>Devam et[ <]/);
    expect(html).not.toContain("Kaydet ve devam et");
  });

  it("offers retry and disables saving when the initial connection check fails", () => {
    const html = renderSetup("onboarding", false, false, true, {
      connectionError: "initial",
    });
    expect(html).toContain("Google bağlantın kontrol edilemedi.");
    expect(html).toContain("Tekrar dene");
    expect(html).not.toContain("Mülk seç");
    expect(html).toMatch(/disabled=""[^>]*>Kaydet ve devam et/);
  });
});

describe("Search Console website setup guidance", () => {
  const emptyAccount = {
    accountId: "account-a",
    email: "owner@example.com",
    requiresReconnect: false,
    properties: [],
  };

  it.each(["gsc", "onboarding"] as const)(
    "explains empty accounts without opening the %s picker",
    (surface) => {
      const html = renderSetup(surface, true, false, true, {
        accounts: [emptyAccount],
      });
      expect(html).toContain("Siteni bulamadık");
      expect(html).toContain("owner@example.com");
      expect(html).not.toContain("Mülk seç");
      expect(html).toContain("/blogs/google-search-console-setup");
      expect(html).toContain("Yenile");
      expect(html).toContain("Başka bir Google hesabı kullan");
      if (surface === "onboarding") expect(html).toContain("Şimdilik atla");
    },
  );

  it.each([
    { requiresReconnect: true },
    { unavailable: true },
    {
      properties: [
        { id: "https://example.com/", name: "example.com", selectable: true },
      ],
    },
  ])(
    "does not mistake expired, failed, or populated accounts for a new website",
    (patch) => {
      const html = renderSetup("gsc", true, false, true, {
        accounts: [{ ...emptyAccount, ...patch }],
      });
      expect(html).toContain("Mülk seç");
      expect(html).not.toContain("Siteni bulamadık");
    },
  );
});
