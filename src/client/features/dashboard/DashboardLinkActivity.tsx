import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/client/components/ui/table";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link2 } from "lucide-react";
import { CardShell } from "@/client/components/CardShell";
import { EmptyState } from "@/client/components/EmptyState";
import { Button } from "@/client/components/ui/button";
import { QueryState } from "@/client/components/QueryState";
import { getDashboardLinkActivity } from "@/serverFunctions/dashboard";
import { DashboardInfo, ExternalPage, Freshness } from "./siteTabParts";
import { cardTableClass, moreDetailsClass } from "./cardParts";
export function DashboardLinkActivity({
  projectId,
  domain,
}: {
  projectId: string;
  domain: string;
}) {
  const query = useQuery({
    queryKey: ["dashboardLinkActivity", projectId, domain],
    queryFn: () => getDashboardLinkActivity({ data: { projectId } }),
    staleTime: 86400_000,
    retry: false,
  });
  return (
    <QueryState query={query} errorFallback="Yeni linkler yüklenemedi">
      {(data) => (
        <CardShell
          title="Yeni backlinkler"
          icon={<Link2 className="size-5" />}
          titleInfo={
            <DashboardInfo label="Yeni linkler hakkında">
              <p>
                Son bir haftada bulunan, sitene verilen linkler. Yeni link veren
                siteler önce gösterilir.
              </p>
              <p className="mt-2">
                Bir link, bulunduğu tarihten daha eski olabilir.
              </p>
            </DashboardInfo>
          }
          action={
            <Link
              to="/p/$projectId"
              params={{ projectId }}
              search={{ tab: "backlinks" }}
              className={moreDetailsClass}
              aria-label="Tüm yeni backlinkleri gör"
            >
              Tümünü gör
            </Link>
          }
        >
          <Freshness {...data} />
          {data.value.length ? (
            <Table className={cardTableClass}>
              <TableHeader>
                <TableRow>
                  <TableHead>Referans alan adı</TableHead>
                  <TableHead className="text-right">Backlinkler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.value.slice(0, 5).map((row, index) => (
                  <TableRow key={row.domain ?? index}>
                    <TableCell className="font-medium">
                      <ExternalPage
                        url={row.domain ? `https://${row.domain}` : null}
                        label={row.domain}
                      />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.backlinks?.toLocaleString("tr-TR") ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : data.links.length ? (
            <Table className={cardTableClass}>
              <TableHeader>
                <TableRow>
                  <TableHead>Link veren sayfa</TableHead>
                  <TableHead>Bağlantı metni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.links.slice(0, 5).map((row, index) => (
                  <TableRow key={`${row.urlFrom}:${index}`}>
                    <TableCell>
                      <ExternalPage url={row.urlFrom} label={row.domainFrom} />
                    </TableCell>
                    <TableCell
                      className="max-w-48 truncate"
                      title={row.anchor ?? undefined}
                    >
                      {row.anchor || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              variant="plain"
              icon={Link2}
              title="Bu hafta yeni link yok"
              description="Sana zaten link veren sitelere göz at."
              action={
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={
                    <Link
                      to="/p/$projectId"
                      params={{ projectId }}
                      search={{ tab: "backlinks" }}
                    />
                  }
                >
                  Backlinkleri gör
                </Button>
              }
            />
          )}
        </CardShell>
      )}
    </QueryState>
  );
}
