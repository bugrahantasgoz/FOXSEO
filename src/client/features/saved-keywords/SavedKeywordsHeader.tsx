import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { ConfirmDialog } from "@/client/components/ConfirmDialog";
import { ExportMenu } from "@/client/components/ExportMenu";
import { PageHeader } from "@/client/components/PageHeader";
import { Button } from "@/client/components/ui/button";
import { ImportKeywordsButton } from "./ImportKeywordsDialog";

export function SavedKeywordsHeader({
  projectId,
  totalCount,
  exporting,
  metricsRefreshing,
  onExportCsv,
  onExportSheets,
  onRefreshMetrics,
}: {
  projectId: string;
  totalCount: number;
  exporting: "csv" | "sheets" | null;
  metricsRefreshing: boolean;
  onExportCsv: () => void;
  onExportSheets: () => void;
  onRefreshMetrics: () => void;
}) {
  const [confirmingRefresh, setConfirmingRefresh] = useState(false);
  const disabled = totalCount === 0 || exporting != null;

  return (
    <>
      <PageHeader
        title="Kayıtlı Kelimeler"
        description="Araştırmada bulduğun kelimeleri kaydet, etiketlerle düzenle ve hazır olduğunda geri dön."
        actions={
          <>
            <ImportKeywordsButton projectId={projectId} />
            <Button
              variant="outline"
              size="sm"
              title="Güncel arama hacmini getir"
              disabled={disabled || metricsRefreshing}
              onClick={() => setConfirmingRefresh(true)}
            >
              <RefreshCw
                data-icon="inline-start"
                className={metricsRefreshing ? "animate-spin" : ""}
              />
              {metricsRefreshing
                ? "Güncelleniyor..."
                : "Kelime verilerini güncelle"}
            </Button>

            <ExportMenu
              actions={["sheets", "csv"]}
              busy={exporting != null}
              disabled={disabled}
              onExport={(action) =>
                action === "sheets" ? onExportSheets() : onExportCsv()
              }
            />
          </>
        }
      />

      {confirmingRefresh ? (
        <ConfirmDialog
          title="Kelime verileri güncellensin mi?"
          confirmLabel="Güncelle"
          onConfirm={() => {
            setConfirmingRefresh(false);
            onRefreshMetrics();
          }}
          onClose={() => setConfirmingRefresh(false)}
        >
          Bu projedeki tüm kayıtlı kelimeler için güncel arama hacmi Bing'den
          getirilir.
        </ConfirmDialog>
      ) : null}
    </>
  );
}
