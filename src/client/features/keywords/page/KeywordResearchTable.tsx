import { useMemo } from "react";
import {
  createColumnHelper,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import {
  DataTable,
  makeSelectionColumn,
  useDataTable,
  useSelectionAnchor,
} from "@/client/components/table/DataTable";
import {
  IntentBadge,
  type SortDir,
  type SortField,
} from "@/client/features/keywords/components";
import { SortableHeader } from "@/client/components/table/SortableHeader";
import { Spinner } from "@/client/components/ui/spinner";
import { formatNumber } from "@/client/features/keywords/utils";
import type { KeywordResearchDisplayRow } from "@/client/features/keywords/groupSharedVolumeRows";
import type { KeywordResearchRow } from "@/types/keywords";

type Props = {
  filteredRows: KeywordResearchDisplayRow[];
  overviewKeyword: KeywordResearchRow | null;
  selectedRows: Set<string>;
  setSelectedRows: (rows: Set<string>) => void;
  sortDir: SortDir;
  sortField: SortField;
  toggleSort: (field: SortField) => void;
  isFiltered: boolean;
  resetFilters: () => void;
  handleRowClick: (row: KeywordResearchRow) => void;
  /** The keyword whose SERP is loading, marked on its row. */
  serpLoadingKeyword: string | null;
  toolbar: ReactNode;
  footer: ReactNode;
};

const keywordColumnHelper = createColumnHelper<KeywordResearchDisplayRow>();

export function KeywordResearchTable({
  filteredRows,
  overviewKeyword,
  selectedRows,
  setSelectedRows,
  sortDir,
  sortField,
  toggleSort,
  isFiltered,
  resetFilters,
  handleRowClick,
  serpLoadingKeyword,
  toolbar,
  footer,
}: Props) {
  const selectAnchorRef = useSelectionAnchor();
  const rowSelection = useMemo<RowSelectionState>(
    () =>
      Object.fromEntries(
        [...selectedRows].map((keyword) => [keyword, true]),
      ) as RowSelectionState,
    [selectedRows],
  );
  const columns = useMemo<ColumnDef<KeywordResearchDisplayRow>[]>(() => {
    // The controller sorts the rows, so each header reads and sets its sort.
    const sortColumn = (field: SortField) => ({
      getIsSorted: () => (field === sortField ? sortDir : false),
      getToggleSortingHandler: () => () => toggleSort(field),
    });
    return [
      makeSelectionColumn<KeywordResearchDisplayRow>(selectAnchorRef),
      keywordColumnHelper.accessor("keyword", {
        header: () => (
          <SortableHeader
            column={sortColumn("keyword")}
            label="Anahtar kelime"
            className="min-w-48 md:min-w-0"
          />
        ),
        cell: ({ row }) => (
          <div
            className={`flex min-w-48 items-center gap-1.5 md:min-w-0 ${row.original.parentKeyword ? "pl-4" : ""}`}
          >
            <span
              className={`block min-w-0 whitespace-normal break-words capitalize md:truncate ${row.original.parentKeyword ? "font-normal" : "font-medium"}`}
              title={
                row.original.parentKeyword
                  ? `${row.original.keyword}: ${row.original.parentKeyword} ile aynı hacim bildirildi. Ortak hacimler çakışabilir.`
                  : row.original.keyword
              }
            >
              {row.original.keyword}
            </span>
            {row.original.keyword === serpLoadingKeyword ? (
              <Spinner
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-label="Arama sonuçları yükleniyor"
              />
            ) : null}
          </div>
        ),
        // From md, the keyword column takes the free width and truncates, so
        // the metric columns stay in view.
        meta: {
          headerClassName: "min-w-48 md:w-full md:max-w-0 md:min-w-0",
          cellClassName: "min-w-48 md:w-full md:max-w-0 md:min-w-0",
        },
      }),
      keywordColumnHelper.accessor("searchVolume", {
        header: () => (
          <SortableHeader
            column={sortColumn("searchVolume")}
            label="Hacim (Bing)"
            helpText="Bing'de son 30 gündeki gösterim sayısı. Türkçe yerel aramalarda çoğu zaman boştur; Google verisi için Gösterim sütununa bak."
            align="right"
          />
        ),
        cell: ({ row, getValue }) =>
          row.original.parentKeyword ? null : formatNumber(getValue()),
        meta: {
          headerClassName: "text-right",
          cellClassName:
            "whitespace-nowrap text-right tabular-nums text-muted-foreground",
        },
      }),
      keywordColumnHelper.accessor((row) => row.gsc?.impressions ?? null, {
        id: "gscImpressions",
        header: () => (
          <SortableHeader
            column={sortColumn("gscImpressions")}
            label="Gösterim"
            helpText="Search Console: son 3 ayda sitenin bu aramada Google'da kaç kez göründüğü. Boşsa siten bu aramada henüz çıkmamış."
            align="right"
          />
        ),
        cell: ({ row, getValue }) =>
          row.original.parentKeyword ? null : formatNumber(getValue()),
        meta: {
          headerClassName: "text-right",
          cellClassName:
            "whitespace-nowrap text-right tabular-nums text-muted-foreground",
        },
      }),
      keywordColumnHelper.accessor((row) => row.gsc?.clicks ?? null, {
        id: "gscClicks",
        header: () => (
          <SortableHeader
            column={sortColumn("gscClicks")}
            label="Tıklama"
            helpText="Search Console: son 3 ayda bu aramadan sitene gelen tıklama sayısı."
            align="right"
          />
        ),
        cell: ({ row, getValue }) =>
          row.original.parentKeyword ? null : formatNumber(getValue()),
        meta: {
          headerClassName: "text-right",
          cellClassName:
            "whitespace-nowrap text-right tabular-nums text-muted-foreground",
        },
      }),
      keywordColumnHelper.accessor((row) => row.gsc?.position ?? null, {
        id: "gscPosition",
        header: () => (
          <SortableHeader
            column={sortColumn("gscPosition")}
            label="Pozisyon"
            helpText="Search Console: sitenin bu aramada Google'daki ortalama sırası. 1-10 ilk sayfa."
            align="right"
          />
        ),
        cell: ({ row, getValue }) => {
          if (row.original.parentKeyword) return null;
          const value = getValue();
          return value == null ? "-" : value.toLocaleString("tr-TR");
        },
        meta: {
          headerClassName: "text-right",
          cellClassName:
            "whitespace-nowrap text-right tabular-nums text-muted-foreground",
        },
      }),
      keywordColumnHelper.accessor("intent", {
        header: "Arama amacı",
        cell: ({ getValue }) => <IntentBadge intent={getValue()} />,
        meta: {
          headerClassName: "text-center",
          cellClassName: "whitespace-nowrap text-center",
        },
      }),
    ];
  }, [selectAnchorRef, serpLoadingKeyword, sortDir, sortField, toggleSort]);
  const table = useDataTable({
    data: filteredRows,
    columns,
    state: { rowSelection },
    onRowSelectionChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setSelectedRows(
        new Set(
          Object.entries(next)
            .filter(([, selected]) => selected)
            .map(([keyword]) => keyword),
        ),
      );
    },
    getRowId: (row) => row.keyword,
    enableRowSelection: true,
  });

  return (
    <DataTable
      table={table}
      className="flex flex-1 flex-col"
      toolbar={toolbar}
      footer={footer}
      empty={{ title: "Anahtar kelime yok" }}
      isFiltered={isFiltered}
      onClearFilters={resetFilters}
      onRowClick={(row) => handleRowClick(row.original)}
      activeRowId={overviewKeyword?.keyword}
    />
  );
}
