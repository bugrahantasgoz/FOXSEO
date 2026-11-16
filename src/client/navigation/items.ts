import {
  Bookmark,
  Bot,
  Brain,
  ChartLine,
  ClipboardCheck,
  FileText,
  Globe,
  LayoutDashboard,
  Link2,
  MapPin,
  MessageSquare,
  Search,
  TrendingUp,
} from "lucide-react";
import { linkOptions } from "@tanstack/react-router";
import { GoogleGlyphMuted } from "@/client/features/gsc/GoogleGlyph";

const projectNavItems = [
  {
    to: "/p/$projectId" as const,
    label: "Pano",
    icon: LayoutDashboard,
    // Without exact matching, the index path is a prefix of every project
    // route and the Dashboard item would render active everywhere.
    activeOptions: { exact: true, includeSearch: false },
  },
  {
    to: "/p/$projectId/keywords" as const,
    label: "Anahtar Kelime Araştırması",
    icon: Search,
  },
  {
    to: "/p/$projectId/saved" as const,
    label: "Kayıtlı Kelimeler",
    icon: Bookmark,
  },
  {
    to: "/p/$projectId/rank-tracking" as const,
    label: "Sıralama Takibi",
    icon: TrendingUp,
  },
  {
    to: "/p/$projectId/local-seo" as const,
    label: "Yerel SEO",
    icon: MapPin,
  },
  {
    to: "/p/$projectId/search-performance" as const,
    label: "Arama Performansı (GSC)",
    icon: GoogleGlyphMuted,
  },
  {
    to: "/p/$projectId/domain" as const,
    label: "Alan Adı Genel Bakışı",
    icon: Globe,
  },
  {
    to: "/p/$projectId/backlinks" as const,
    label: "Backlinkler",
    icon: Link2,
  },
  {
    to: "/p/$projectId/audit" as const,
    label: "Site Denetimi",
    icon: ClipboardCheck,
  },
  {
    to: "/p/$projectId/ai-visibility" as const,
    label: "Prompt Takibi",
    icon: ChartLine,
    activeOptions: { exact: true, includeSearch: false },
  },
  {
    to: "/p/$projectId/ai-visibility/research" as const,
    label: "Prompt Araştırması",
    icon: Search,
  },
  {
    to: "/p/$projectId/prompt-explorer" as const,
    label: "Prompt Gezgini",
    icon: MessageSquare,
  },
  {
    to: "/p/$projectId/reports" as const,
    label: "Raporlar",
    icon: FileText,
  },
  {
    to: "/p/$projectId/context" as const,
    label: "Bağlam",
    icon: Brain,
  },
] as const;

// Project-independent. Rendered inside the project "AI Tools" group when a project
// is selected, and on its own (connectNavGroup) when none is.
const aiNavItem = linkOptions({
  to: "/ai" as const,
  label: "Yapay zekâ ajanı kurulumu",
  icon: Bot,
});

// Shown only when no project is selected; with a project, Agent setup lives in
// the "AI Tools" group below.
export const connectNavGroup = {
  label: "Yapay Zekâ Araçları",
  items: [aiNavItem],
};

function getProjectNavItems(projectId: string) {
  return linkOptions(
    projectNavItems.map((item) => ({
      ...item,
      params: { projectId },
      search: {},
    })),
  );
}

// Grouped by scope: "My Site" is the project's own domain (tracked data),
// "Research" is point-at-anything lookup tools.
export function getProjectNavGroups(projectId: string) {
  const all = getProjectNavItems(projectId);
  const byPath = (path: (typeof projectNavItems)[number]["to"]) =>
    all.find((i) => i.to === path)!;

  return [
    {
      label: "Genel bakış",
      items: [byPath("/p/$projectId")],
    },
    // FOXSEO shows only features that run on free data sources. Domain
    // overview, AI visibility, local SEO and paid rank checks need DataForSEO,
    // so they are left out of the menu.
    {
      label: "Sitem",
      items: [
        byPath("/p/$projectId/audit"),
        byPath("/p/$projectId/search-performance"),
        byPath("/p/$projectId/keywords"),
        byPath("/p/$projectId/backlinks"),
        byPath("/p/$projectId/saved"),
      ],
    },
    {
      label: "Yapay Zekâ Araçları",
      items: [
        byPath("/p/$projectId/reports"),
        byPath("/p/$projectId/context"),
        aiNavItem,
      ],
    },
  ];
}

export const dataforseoHelpLinkOptions = linkOptions({
  to: "/help/dataforseo-api-key",
});
