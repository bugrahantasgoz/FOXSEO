import { useQuery } from "@tanstack/react-query";
import { QueryError } from "@/client/components/QueryState";
import { DataTableTabs } from "@/client/components/table/DataTableToolbar";
import type { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/client/components/table/SortableHeader";
import { DashboardDataTable } from "./DashboardDataTable";
import { useState, type ComponentProps } from "react";
import { TabsTrigger } from "@/client/components/ui/tabs";
import { getDashboardBacklinks } from "@/serverFunctions/dashboard";
import { Freshness, ExternalPage } from "./siteTabParts";
const KINDS = ["new", "lost", "all"] as const;
type Kind = (typeof KINDS)[number];

const DESCRIPTIONS: Record<Kind, string> = {
  new: "Son bir haftada bulunan, sitene verilen linkler. Bir link, bulunduğu tarihten daha eski olabilir.",
  lost: "Daha önce bulunup artık yerinde olmayan linkler. Son kontrol, linkin kaybolduğu değil en son kontrol edildiği tarihtir.",
  all: "Yakın zamanda bulunan ve hâlâ sitene yönlenen linkler.",
};

export function DashboardBacklinks({
  projectId,
  domain,
}: {
  projectId: string;
  domain: string;
}) {
  const [kind, setKind] = useState<Kind>("new");
  const query = useQuery({
    queryKey: ["dashboardBacklinks", projectId, domain, kind],
    queryFn: () => getDashboardBacklinks({ data: { projectId, kind } }),
    staleTime: 86400_000,
    retry: false,
  });
  return (
    <DashboardBacklinkTable
      rows={query.data?.value ?? []}
      kind={kind}
      isLoading={query.isPending}
      error={
        query.isError ? (
          <QueryError
            error={query.error}
            fallback="Backlinkler yüklenemedi"
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : null
      }
      tabs={
        <DataTableTabs
          value={kind}
          onValueChange={(value) => {
            const next = KINDS.find((item) => item === value);
            if (next) setKind(next);
          }}
          description={
            <>
              {DESCRIPTIONS[kind]}
              {query.data ? <Freshness {...query.data} /> : null}
            </>
          }
        >
          <TabsTrigger value="new">Bu hafta yeni</TabsTrigger>
          <TabsTrigger value="lost">Kaybedilen linkler</TabsTrigger>
          <TabsTrigger value="all">Aktif linkler</TabsTrigger>
        </DataTableTabs>
      }
    />
  );
}

type Backlink = Awaited<
  ReturnType<typeof getDashboardBacklinks>
>["value"][number];
function DashboardBacklinkTable({
  rows,
  kind,
  ...tableProps
}: {
  rows: Backlink[];
  kind: Kind;
} & Pick<
  ComponentProps<typeof DashboardDataTable>,
  "tabs" | "isLoading" | "error"
>) {
  const columns: ColumnDef<Backlink>[] = [
    {
      id: "urlFrom",
      accessorFn: (row) => `${row.domainFrom ?? ""} ${row.urlFrom ?? ""}`,
      header: ({ column }) => (
        <SortableHeader column={column} label="Link veren sayfa" />
      ),
      cell: ({ row }) => (
        <ExternalPage
          url={row.original.urlFrom}
          label={row.original.domainFrom}
        />
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "anchor",
      header: "Bağlantı metni",
      cell: ({ row }) => (
        <span
          className="block max-w-48 truncate"
          title={row.original.anchor ?? undefined}
        >
          {row.original.anchor || "—"}
        </span>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "urlTo",
      header: "Hedef sayfa",
      cell: ({ row }) => <ExternalPage url={row.original.urlTo} />,
      filterFn: "includesString",
    },
    {
      id: "follow",
      accessorFn: (row) => (row.isDofollow ? "Follow" : "Nofollow"),
      header: "Link türü",
      filterFn: "equalsString",
    },
    {
      accessorKey: "domainFromRank",
      header: ({ column }) => (
        <SortableHeader column={column} label="Alan adı puanı" />
      ),
      filterFn: "inNumberRange",
      cell: ({ getValue }) => getValue() ?? "—",
    },
    {
      accessorKey: "spamScore",
      header: ({ column }) => (
        <SortableHeader column={column} label="Spam puanı" />
      ),
      filterFn: "inNumberRange",
      cell: ({ getValue }) => getValue() ?? "—",
    },
    {
      id: "date",
      accessorFn: (row) =>
        (kind === "lost" ? row.lastSeen : row.firstSeen)?.slice(0, 10) ?? "—",
      header: ({ column }) => (
        <SortableHeader
          column={column}
          label={kind === "lost" ? "Son kontrol" : "İlk bulunma"}
        />
      ),
    },
  ];
  return (
    <DashboardDataTable
      {...tableProps}
      resetKey={kind}
      rows={rows}
      empty={{
        title:
          kind === "new"
            ? "Bu hafta yeni backlink yok"
            : kind === "lost"
              ? "Kaybedilen backlink bulunmadı"
              : "Henüz aktif backlink bulunmadı",
      }}
      columns={columns}
      filters={[
        { id: "urlFrom", label: "Link veren sayfa", kind: "text" },
        { id: "anchor", label: "Bağlantı metni", kind: "text" },
        { id: "urlTo", label: "Hedef sayfa", kind: "text" },
        { id: "follow", label: "Link türü", kind: "follow" },
        { id: "domainFromRank", label: "Alan adı puanı", kind: "number" },
        { id: "spamScore", label: "Spam puanı", kind: "number" },
      ]}
    />
  );
}
