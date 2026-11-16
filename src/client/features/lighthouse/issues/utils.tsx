import type { CsvValue } from "@/client/lib/csv";
import type { CategoryTab, LighthouseIssue } from "./types";

const ISSUE_HEADERS = [
  "Kategori",
  "Önem",
  "Puan",
  "Başlık",
  "Görünen değer",
  "Açıklama",
  "Etki (ms)",
  "Etki (bayt)",
  "Etkilenen öğeler",
];

function issuesToRows(issues: LighthouseIssue[]): CsvValue[][] {
  return issues.map((issue) => [
    categoryLabel(issue.category),
    SEVERITY_LABELS[issue.severity],
    issue.score ?? "",
    issue.title,
    issue.displayValue ?? "",
    issue.description ?? "",
    issue.impactMs ?? "",
    issue.impactBytes ?? "",
    issue.items.length,
  ]);
}

export function issuesToTable(issues: LighthouseIssue[]) {
  return { headers: ISSUE_HEADERS, rows: issuesToRows(issues) };
}

const CATEGORY_LABELS: Record<CategoryTab, string> = {
  all: "Tümü",
  performance: "Performans",
  accessibility: "Erişilebilirlik",
  "best-practices": "En iyi uygulamalar",
  seo: "SEO",
};

export const SEVERITY_LABELS: Record<LighthouseIssue["severity"], string> = {
  critical: "Kritik",
  warning: "Uyarı",
  info: "Bilgi",
};

export function categoryLabel(category: CategoryTab) {
  return CATEGORY_LABELS[category];
}
