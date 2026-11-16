import { useState } from "react";
import { RotateCcw } from "lucide-react";
import type { z } from "zod";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import type { searchPerformanceInputSchema } from "@/types/schemas/search-performance";

const MATCH_ITEMS = [
  { value: "contains", label: "İçerir" },
  { value: "equals", label: "Tam eşleşir" },
];

export type TextFilters = Pick<
  z.infer<typeof searchPerformanceInputSchema>,
  "pageFilter" | "queryFilter"
>;

export function SearchPerformanceTextFilters({
  value,
  showQuery,
  activeFilterCount,
  onApply,
  onReset,
}: {
  value: TextFilters;
  /** Discover and Google News have no queries to filter on. */
  showQuery: boolean;
  activeFilterCount: number;
  onApply: (filters: TextFilters) => void;
  onReset: () => void;
}) {
  const [page, setPage] = useState(value.pageFilter?.expression ?? "");
  const [query, setQuery] = useState(value.queryFilter?.expression ?? "");
  const [pageOperator, setPageOperator] = useState<"contains" | "equals">(
    value.pageFilter?.operator ?? "contains",
  );
  const [queryOperator, setQueryOperator] = useState<"contains" | "equals">(
    value.queryFilter?.operator ?? "contains",
  );
  const dirtyCount =
    Number(
      page.trim() !== (value.pageFilter?.expression ?? "") ||
        pageOperator !== (value.pageFilter?.operator ?? "contains"),
    ) +
    Number(
      query.trim() !== (value.queryFilter?.expression ?? "") ||
        queryOperator !== (value.queryFilter?.operator ?? "contains"),
    );
  const cancel = () => {
    setPage(value.pageFilter?.expression ?? "");
    setQuery(value.queryFilter?.expression ?? "");
    setPageOperator(value.pageFilter?.operator ?? "contains");
    setQueryOperator(value.queryFilter?.operator ?? "contains");
  };
  return (
    <form
      id="search-performance-filters"
      className="space-y-3 border-b border-border bg-muted/20 px-4 py-3"
      onSubmit={(event) => {
        event.preventDefault();
        setPage(page.trim());
        setQuery(query.trim());
        if (!page.trim()) setPageOperator("contains");
        if (!query.trim()) setQueryOperator("contains");
        onApply({
          pageFilter: page.trim()
            ? { operator: pageOperator, expression: page.trim() }
            : undefined,
          queryFilter: query.trim()
            ? { operator: queryOperator, expression: query.trim() }
            : undefined,
        });
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">Tablo sonuçlarını daralt</p>
          {activeFilterCount > 0 ? (
            <Badge size="sm">{activeFilterCount} etkin</Badge>
          ) : null}
          {dirtyCount > 0 ? (
            <Badge variant="warning" size="sm">
              {dirtyCount} uygulanmadı
            </Badge>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          disabled={activeFilterCount === 0 && dirtyCount === 0}
          onClick={() => {
            setPage("");
            setQuery("");
            setPageOperator("contains");
            setQueryOperator("contains");
            onReset();
          }}
        >
          <RotateCcw data-icon="inline-start" />
          Tümünü temizle
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Sayfa URL'si
          </span>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              items={MATCH_ITEMS}
              value={pageOperator}
              onValueChange={(operator) =>
                setPageOperator(operator === "equals" ? "equals" : "contains")
              }
            >
              <SelectTrigger
                size="sm"
                className="w-full sm:w-44 sm:shrink-0"
                aria-label="Sayfa eşleşme türü"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATCH_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="h-7 w-full min-w-0 sm:flex-1"
              aria-label="Sayfa URL filtresi"
              value={page}
              maxLength={4096}
              onChange={(event) => setPage(event.target.value)}
              placeholder="URL ya da alt klasör"
            />
          </div>
        </div>
        <div className={showQuery ? "space-y-1.5" : "hidden"}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Sorgu
          </span>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              items={MATCH_ITEMS}
              value={queryOperator}
              onValueChange={(operator) =>
                setQueryOperator(operator === "equals" ? "equals" : "contains")
              }
            >
              <SelectTrigger
                size="sm"
                className="w-full sm:w-44 sm:shrink-0"
                aria-label="Sorgu eşleşme türü"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATCH_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="h-7 w-full min-w-0 sm:flex-1"
              aria-label="Sorgu filtresi"
              value={query}
              maxLength={4096}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Arama terimi"
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Tüm filtreler birlikte uygulanır. "İçerir" büyük/küçük harfe bakmaz ve
        metni her yerde (alt klasörler dahil) arar. "Tam eşleşir" URL'nin ya da
        sorgunun tamamını, büyük/küçük harf dahil karşılaştırır.
      </p>
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={cancel}
          disabled={dirtyCount === 0}
        >
          Vazgeç
        </Button>
        <Button size="sm" type="submit" disabled={dirtyCount === 0}>
          Filtreleri uygula
          {dirtyCount > 0 ? (
            <Badge variant="secondary" size="sm" className="ml-1">
              {dirtyCount}
            </Badge>
          ) : null}
        </Button>
      </div>
    </form>
  );
}
