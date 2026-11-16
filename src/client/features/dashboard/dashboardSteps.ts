import { Bot, ClipboardCheck, FolderPlus, Lightbulb } from "lucide-react";
import type { Globe } from "lucide-react";
import type { DashboardActivation } from "@/server/features/dashboard/services/DashboardService";
import type { DashboardSetupStep } from "@/types/schemas/dashboard";

export const setupSteps: {
  id: DashboardSetupStep;
  label: string;
  detail: string;
  icon: typeof Globe;
  skipLabel: string;
}[] = [
  {
    id: "keywords",
    label: "Anahtar kelime fikirleri bul",
    detail: "Tek bir kelimeyle başla ve insanların neler aradığını gör.",
    icon: Lightbulb,
    skipLabel: "Şimdilik atla",
  },
  {
    id: "audit",
    label: "Siteni tara",
    detail:
      "Kırık linkleri, eksik etiketleri ve dizine eklenme sorunlarını bul.",
    icon: ClipboardCheck,
    skipLabel: "Şimdilik atla",
  },
  {
    id: "mcp",
    label: "Yapay zekâ asistanını bağla",
    detail:
      "FOXSEO'yu Claude ya da sevdiğin başka bir asistanın içinde kullan.",
    icon: Bot,
    skipLabel: "Şimdilik atla",
  },
  {
    id: "project",
    label: "Birden fazla site mi yönetiyorsun?",
    detail:
      "Yeni bir proje oluştur ya da site listeni yapay zekâ asistanına kurdur.",
    icon: FolderPlus,
    skipLabel: "Tek proje yeterli",
  },
];

export function getStepStatus(
  activation: DashboardActivation,
  step: DashboardSetupStep,
): "done" | "skipped" | "todo" {
  const completed: Record<DashboardSetupStep, boolean> = {
    competitor: activation.competitorResearchedAt !== null,
    keywords: activation.keywordsResearchedAt !== null,
    audit: activation.hasAudit,
    mcp:
      activation.mcp.authorizedAt !== null ||
      activation.mcp.firstToolCallAt !== null,
    team: activation.hasTeammate,
    project: activation.hasMultipleProjects,
  };
  if (completed[step]) return "done";
  if (!activation.dismissedSteps.includes(step)) return "todo";
  return completeWhenSkipped.has(step) ? "done" : "skipped";
}

// Skipping these marks them complete, so they never wait in "saved for later".
const completeWhenSkipped = new Set<DashboardSetupStep>(["team", "project"]);
