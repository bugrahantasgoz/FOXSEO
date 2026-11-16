import {
  GSC_DEVICES,
  SEARCH_PERFORMANCE_RANGES,
  SEARCH_PERFORMANCE_TYPES,
  type SearchPerformanceType,
  type SearchPerformanceDateRange,
  type SearchPerformanceDevice,
  type SearchPerformanceSearch,
} from "@/types/schemas/search-performance";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";

const RANGE_LABELS: Record<SearchPerformanceDateRange, string> = {
  last_7_days: "Son 7 gün",
  last_28_days: "Son 28 gün",
  last_3_months: "Son 3 ay",
};
const RANGE_OPTIONS = SEARCH_PERFORMANCE_RANGES.map((value) => ({
  value,
  label: RANGE_LABELS[value],
}));

const TYPE_LABELS: Record<SearchPerformanceType, string> = {
  web: "Web araması",
  discover: "Discover",
  googleNews: "Google News",
};
const TYPE_OPTIONS = SEARCH_PERFORMANCE_TYPES.map((value) => ({
  value,
  label: TYPE_LABELS[value],
}));

function isSearchType(value: string): value is SearchPerformanceType {
  return SEARCH_PERFORMANCE_TYPES.some((option) => option === value);
}

const DEVICE_LABELS: Record<SearchPerformanceDevice, string> = {
  DESKTOP: "Masaüstü",
  MOBILE: "Mobil",
  TABLET: "Tablet",
};
const DEVICE_OPTIONS = GSC_DEVICES.map((value) => ({
  value,
  label: DEVICE_LABELS[value],
}));

// Sentinel for "no filter" in the selects; never written to the URL.
const ALL = "ALL";
const DEVICE_ITEMS = [{ value: ALL, label: "Tüm cihazlar" }, ...DEVICE_OPTIONS];

function isDateRange(value: string): value is SearchPerformanceDateRange {
  return SEARCH_PERFORMANCE_RANGES.some((option) => option === value);
}

function isDevice(value: string): value is SearchPerformanceDevice {
  return GSC_DEVICES.some((option) => option === value);
}

/** Search type, device, country, and date range selects of the table toolbar. */
export function SearchPerformanceSelects({
  search,
  countries,
  onSearchChange,
}: {
  search: SearchPerformanceSearch;
  countries: { key: string }[];
  onSearchChange: (update: Partial<SearchPerformanceSearch>) => void;
}) {
  const device = search.device ?? ALL;
  const country = search.country ?? ALL;
  const range = search.range ?? "last_28_days";
  const countryItems = [
    { value: ALL, label: "Tüm ülkeler" },
    ...(country !== ALL && !countries.some((row) => row.key === country)
      ? [{ value: country, label: country.toUpperCase() }]
      : []),
    ...countries.map((row) => ({
      value: row.key,
      label: row.key.toUpperCase(),
    })),
  ];
  return (
    <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
      <Select
        items={TYPE_OPTIONS}
        value={search.type ?? "web"}
        onValueChange={(value) => {
          if (value == null || !isSearchType(value)) return;
          // Discover and Google News have no queries: drop the query filter
          // and the query tabs along with the switch.
          onSearchChange({
            type: value === "web" ? undefined : value,
            tab: undefined,
            page: undefined,
            queryText: undefined,
            queryMatch: undefined,
          });
        }}
      >
        <SelectTrigger size="sm" className="w-36" aria-label="Arama türü">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        items={DEVICE_ITEMS}
        value={device}
        onValueChange={(value) => {
          if (value == null) return;
          onSearchChange({
            page: undefined,
            device: isDevice(value) ? value : undefined,
          });
        }}
      >
        <SelectTrigger size="sm" className="w-36" aria-label="Cihaz filtresi">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DEVICE_ITEMS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        items={countryItems}
        value={country}
        onValueChange={(value) => {
          if (value == null) return;
          onSearchChange({
            page: undefined,
            country: value === ALL ? undefined : value,
          });
        }}
      >
        <SelectTrigger size="sm" className="w-36" aria-label="Ülke filtresi">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {countryItems.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DateRangeSelect
        value={range}
        onChange={(value) => onSearchChange({ page: undefined, range: value })}
        triggerClassName="w-36"
      />
    </div>
  );
}

export function DateRangeSelect({
  value,
  onChange,
  triggerClassName,
}: {
  value: SearchPerformanceDateRange;
  onChange: (value: SearchPerformanceDateRange) => void;
  triggerClassName?: string;
}) {
  return (
    <Select
      items={RANGE_OPTIONS}
      value={value}
      onValueChange={(next) => {
        if (next != null && isDateRange(next)) onChange(next);
      }}
    >
      <SelectTrigger
        size="sm"
        className={triggerClassName}
        aria-label="Tarih aralığı"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {RANGE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
