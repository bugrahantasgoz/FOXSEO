import { useState } from "react";
import { PageHelpButton } from "@/client/features/help/PageHelpButton";
import { useQuery } from "@tanstack/react-query";
import { Link2 } from "lucide-react";
import { Card } from "@/client/components/ui/card";
import { Button } from "@/client/components/ui/button";
import { Skeleton } from "@/client/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui/table";
import {
  getBingBacklinksOverview,
  getBingLinksToUrl,
} from "@/serverFunctions/bingBacklinks";

// Backlinks from the free Bing Webmaster API: which pages of your own
// (Bing-verified) site have inbound links, and who links to each one.
export function BingBacklinksPage({ projectId }: { projectId: string }) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const overview = useQuery({
    queryKey: ["bingBacklinksOverview", projectId],
    queryFn: () => getBingBacklinksOverview({ data: { projectId } }),
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-4 md:p-6">
      <div>
        <div className="flex items-center gap-1.5">
          <h1 className="text-2xl font-semibold">Backlinkler</h1>
          <PageHelpButton topic="backlinks" />
        </div>
        <p className="text-sm text-muted-foreground">
          Bing'in bulduğu, sitene verilen linkler. Bing Webmaster Tools'tan,
          ücretsiz.
        </p>
      </div>

      {overview.isPending ? (
        <Card className="space-y-2 p-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-40 w-full" />
        </Card>
      ) : overview.isError ? (
        <Card className="p-4 text-sm text-destructive">
          {overview.error.message}
        </Card>
      ) : !overview.data.configured ? (
        <SetupCard />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Toplam gelen link" value={overview.data.totalLinks} />
            <Stat
              label="Link alan sayfalar"
              value={overview.data.pages.length}
            />
          </div>
          <Card className="gap-0 py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Senin sayfan</TableHead>
                  <TableHead className="w-32 text-right">Link</TableHead>
                  <TableHead className="w-40" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.data.pages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">
                      Bing henüz bu siteye verilen bir link bulmadı.
                    </TableCell>
                  </TableRow>
                ) : (
                  overview.data.pages.map((page) => (
                    <TableRow key={page.url}>
                      <TableCell className="max-w-0 truncate">
                        {page.url}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {page.count.toLocaleString("tr-TR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={
                            selectedUrl === page.url ? "default" : "outline"
                          }
                          onClick={() => setSelectedUrl(page.url)}
                        >
                          Kimler link veriyor
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
          {selectedUrl ? (
            <LinksToUrl projectId={projectId} url={selectedUrl} />
          ) : null}
        </>
      )}
    </div>
  );
}

function LinksToUrl({ projectId, url }: { projectId: string; url: string }) {
  const [page, setPage] = useState(0);
  const links = useQuery({
    queryKey: ["bingLinksToUrl", projectId, url, page],
    queryFn: () => getBingLinksToUrl({ data: { projectId, url, page } }),
  });

  return (
    <Card className="gap-0 py-0">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-medium">{url} adresine verilen linkler</h2>
      </div>
      {links.isPending ? (
        <div className="p-4">
          <Skeleton className="h-24 w-full" />
        </div>
      ) : links.isError ? (
        <div className="p-4 text-sm text-destructive">
          {links.error.message}
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Link veren sayfa</TableHead>
                <TableHead className="w-48">Alan adı</TableHead>
                <TableHead className="w-64">Bağlantı metni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.data.links.map((link) => (
                <TableRow key={`${link.sourceUrl}-${link.anchorText}`}>
                  <TableCell className="max-w-0 truncate">
                    <a
                      href={link.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      {link.sourceUrl}
                    </a>
                  </TableCell>
                  <TableCell className="truncate">
                    {link.sourceDomain}
                  </TableCell>
                  <TableCell className="truncate">
                    {link.anchorText || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {links.data.totalPages > 1 ? (
            <div className="flex items-center justify-end gap-2 px-4 py-3 text-sm">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Önceki
              </Button>
              <span>
                {page + 1} / {links.data.totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page + 1 >= links.data.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Sonraki
              </Button>
            </div>
          ) : null}
        </>
      )}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold tabular-nums">
        {value.toLocaleString("tr-TR")}
      </div>
    </Card>
  );
}

function SetupCard() {
  return (
    <Card className="space-y-3 p-6">
      <div className="flex items-center gap-2 font-medium">
        <Link2 className="size-5" /> Bing Webmaster Tools'u bağla (ücretsiz)
      </div>
      <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
        <li>
          bing.com/webmasters adresinde oturum aç ve siteni ekle (Google Search
          Console'dan içe aktarabilirsin).
        </li>
        <li>
          Bing'de Settings → API Access bölümünü aç ve bir API anahtarı oluştur.
        </li>
        <li>
          Anahtarı FOXSEO → Ayarlar (API anahtarları) menüsünden ekle, sonra
          FOXSEO → Yeniden başlat ile uygulamayı yeniden başlat.
        </li>
      </ol>
    </Card>
  );
}
