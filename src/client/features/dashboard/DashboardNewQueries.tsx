import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Tag } from "lucide-react";
import { CardShell } from "@/client/components/CardShell";
import { EmptyState } from "@/client/components/EmptyState";
import { Button } from "@/client/components/ui/button";
import { QueryState } from "@/client/components/QueryState";
import { GoogleConnectionCard } from "@/client/features/integrations/GoogleConnectionCard";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/client/components/ui/table";
import { getDashboardEmergingQueries } from "@/serverFunctions/dashboard";
import { Freshness, DashboardInfo } from "./siteTabParts";
import { cardTableClass, moreDetailsClass } from "./cardParts";

export function DashboardNewQueries({
  projectId,
  connected,
  siteUrl,
}: {
  projectId: string;
  connected: boolean;
  siteUrl: string | null;
}) {
  const query = useQuery({
    queryKey: ["dashboardEmergingQueries", projectId, siteUrl],
    queryFn: () => getDashboardEmergingQueries({ data: { projectId } }),
    enabled: connected,
    staleTime: 10 * 60_000,
    retry: false,
  });
  if (!connected) return null;
  return (
    <QueryState query={query} errorFallback="Yeni sorgular yüklenemedi">
      {(data) =>
        !data.value.connected ? (
          <GoogleConnectionCard
            provider="gsc"
            projectId={projectId}
            prominent
          />
        ) : (
          <CardShell
            title="Yeni sorgular"
            icon={<Tag className="size-5" />}
            titleInfo={
              <DashboardInfo label="Yeni sorgular hakkında">
                <p>
                  Sitenin Google'da yakın zamanda görünmeye başladığı aramalar.
                </p>
                <p className="mt-2">
                  Bunlar Search Console verilerinin son haftasında var, önceki
                  dört haftada yoktu.
                </p>
              </DashboardInfo>
            }
            action={
              <Link
                to="/p/$projectId"
                params={{ projectId }}
                search={{ tab: "keywords" }}
                className={moreDetailsClass}
                aria-label="Tüm yeni sorguları gör"
              >
                Tümünü gör
              </Link>
            }
          >
            <Freshness {...data} />
            {data.value.rows.length ? (
              <Table className={cardTableClass}>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sorgu</TableHead>
                    <TableHead className="text-right">Gösterim</TableHead>
                    <TableHead className="text-right">Tıklama</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.value.rows.slice(0, 5).map((row) => (
                    <TableRow key={row.query}>
                      <TableCell className="font-medium">{row.query}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.impressions.toLocaleString("tr-TR")}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.clicks.toLocaleString("tr-TR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                variant="plain"
                icon={Search}
                title={
                  data.value.hasSearchData
                    ? "Bu hafta yeni sorgu yok"
                    : "Henüz arama verisi yok"
                }
                description={
                  data.value.hasSearchData
                    ? "Mevcut sorguların hâlâ tıklama kazanıyor olabilir. Nasıl gittiklerine bak."
                    : "Google henüz siten için arama verisi bildirmedi. Search Console'da bağlı mülkünü kontrol et."
                }
                action={
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={
                      <Link
                        to="/p/$projectId/search-performance"
                        params={{ projectId }}
                      />
                    }
                  >
                    Arama Performansı'nı aç
                  </Button>
                }
              />
            )}
          </CardShell>
        )
      }
    </QueryState>
  );
}
