import { FileDown, Save, Sheet } from "lucide-react";
import { ExportMenu } from "@/client/components/ExportMenu";
import { Alert, AlertDescription } from "@/client/components/ui/alert";
import {
  DataTableFilterPanel,
  DataTableFilterToggle,
  DataTableToolbar,
} from "@/client/components/table/DataTableToolbar";
import type { KeywordResearchControllerState } from "./types";
import {
  FilterIntentSelect,
  FilterRangeInputs,
  FilterTextInput,
} from "./keywordResearchFilters";
import { KeywordResearchTable } from "./KeywordResearchTable";
import {
  KEYWORD_RESEARCH_PAGE_SIZES,
  useKeywordResearchPagination,
} from "./KeywordResearchPagination";
import { TablePagination } from "@/client/components/table/TablePagination";
import {
  TableBulkActionBar,
  TableBulkActionButton,
  TableBulkExportMenu,
} from "@/client/components/table/TableBulkActionBar";

type Props = {
  controller: KeywordResearchControllerState;
};

// Below md the page shows one panel at a time behind tabs, and hides the
// keyword overview. From xl the table is the list and the panel beside it
// follows the selected row. The table sets the height of both, so their edges
// line up, and the panel stays in view while a table taller than the screen
// scrolls.
export function KeywordResearchResults({ controller }: Props) {
  return (
    <div className="flex w-full min-w-0 flex-col">
      <KeywordPanel controller={controller} />
    </div>
  );
}

function KeywordPanel({ controller }: Props) {
  const { searchedKeyword, showApproximateMatchNotice } = controller;

  return (
    <div className="flex min-w-0 flex-col gap-2 xl:min-h-[32rem]">
      {showApproximateMatchNotice ? (
        <Alert variant="warning" role="status">
          <AlertDescription className="text-foreground">
            <span className="font-medium">"{searchedKeyword}"</span> için tam
            eşleşme yok. Bunun yerine en yakın ilgili kelimeler gösteriliyor.
          </AlertDescription>
        </Alert>
      ) : null}
      <TableCard controller={controller} />
    </div>
  );
}

function TableCard({ controller }: Props) {
  const {
    activeFilterCount,
    filteredRows,
    rows,
    selectedKeywordRows,
    showFilters,
  } = controller;
  const { page, pageSize, pageRange, pageRows, setPage, setPageSize } =
    useKeywordResearchPagination(filteredRows);
  const keywordCount = filteredRows.length;

  const keywordCountLabel =
    selectedKeywordRows.length > 0
      ? `${selectedKeywordRows.length} seçili`
      : activeFilterCount > 0
        ? `${rows.length} kelimeden ${keywordCount} tanesi gösteriliyor`
        : `${keywordCount} kelime gösteriliyor`;

  return (
    <>
      <TableBulkActionBar
        selectedCount={selectedKeywordRows.length}
        onClear={() => controller.setSelectedRows(new Set())}
        actions={
          <div className="flex items-center px-1.5">
            <TableBulkActionButton
              icon={<Save className="size-3.5" />}
              onClick={controller.handleSaveKeywords}
            >
              Kaydet
            </TableBulkActionButton>
            <TableBulkExportMenu
              actions={[
                {
                  label: "Sheets'e aktar",
                  icon: <Sheet className="size-4" />,
                  onClick: () => controller.exportSelection("sheets"),
                },
                {
                  label: "CSV olarak dışa aktar",
                  icon: <FileDown className="size-4" />,
                  onClick: () => controller.exportSelection("csv"),
                },
              ]}
            />
          </div>
        }
      />
      <KeywordResearchTable
        filteredRows={pageRows}
        overviewKeyword={controller.overviewKeyword}
        selectedRows={controller.selectedRows}
        setSelectedRows={controller.setSelectedRows}
        sortDir={controller.sortDir}
        sortField={controller.sortField}
        toggleSort={controller.toggleSort}
        isFiltered={activeFilterCount > 0}
        resetFilters={controller.resetFilters}
        handleRowClick={controller.handleRowClick}
        serpLoadingKeyword={
          controller.serpLoading ? controller.activeSerpKeyword : null
        }
        toolbar={
          <>
            <DataTableToolbar
              actions={
                <ExportMenu
                  actions={["sheets", "csv"]}
                  onExport={controller.exportAll}
                  disabled={filteredRows.length === 0}
                />
              }
            >
              <DataTableFilterToggle
                open={showFilters}
                activeCount={activeFilterCount}
                onToggle={() =>
                  controller.setShowFilters((current) => !current)
                }
              />
              <span className="text-xs text-muted-foreground md:text-sm">
                {keywordCountLabel}
              </span>
            </DataTableToolbar>
            {showFilters ? <TableFilters controller={controller} /> : null}
          </>
        }
        footer={
          filteredRows.length > 0 ? (
            <div className="mt-auto">
              <TablePagination
                page={page}
                pageSize={pageSize}
                pageSizes={KEYWORD_RESEARCH_PAGE_SIZES}
                pageRange={pageRange}
                totalCount={filteredRows.length}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          ) : null
        }
      />
    </>
  );
}

function TableFilters({ controller }: Props) {
  const { activeFilterCount, filtersForm } = controller;

  return (
    <DataTableFilterPanel
      activeCount={activeFilterCount}
      onReset={controller.resetFilters}
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <FilterTextInput
          form={filtersForm}
          name="include"
          label="İçeren kelimeler"
          placeholder="analiz, kontrol, şablon"
        />
        <FilterTextInput
          form={filtersForm}
          name="exclude"
          label="Hariç tutulan kelimeler"
          placeholder="iş ilanı, maaş, kurs"
        />
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
        <FilterRangeInputs
          form={filtersForm}
          title="Arama hacmi"
          minName="minVol"
          maxName="maxVol"
        />
        <FilterRangeInputs
          form={filtersForm}
          title="CPC (USD)"
          minName="minCpc"
          maxName="maxCpc"
          step="0.01"
        />
        <FilterRangeInputs
          form={filtersForm}
          title="Zorluk"
          minName="minKd"
          maxName="maxKd"
        />
      </div>

      <FilterIntentSelect form={filtersForm} />
    </DataTableFilterPanel>
  );
}
