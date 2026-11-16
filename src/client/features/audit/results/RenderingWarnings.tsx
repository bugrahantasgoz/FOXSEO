import { ShieldAlert } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/client/components/ui/alert";
import type { AuditResultsData } from "@/client/features/audit/results/types";

/** Report notices about JavaScript: app shells, and pages a render missed. */
export function RenderingWarnings({ data }: { data: AuditResultsData }) {
  const rendered = data.audit.config.renderJavaScript;
  const hasShells = data.issueGroups.some(
    (group) => group.issueType === "javascript-rendering-suspected",
  );
  const unreadCount = data.fetchClassCounts.error;

  return (
    <>
      {hasShells && (
        <Alert variant="warning">
          <ShieldAlert />
          <AlertTitle>
            Bazı sayfaların içeriğini göstermek için JavaScript gerekebilir.
          </AlertTitle>
          <AlertDescription>
            {rendered
              ? "İşlendikten sonra hâlâ yükleniyorlardı, bu yüzden kontrol edemedik."
              : 'Kontrol etmek için "JavaScript\'i işle" seçeneğini aç ve denetimi yeniden çalıştır.'}
          </AlertDescription>
        </Alert>
      )}

      {rendered && unreadCount > 0 && (
        <Alert variant="warning">
          <ShieldAlert />
          <AlertTitle>{unreadCount} sayfayı okuyamadık.</AlertTitle>
          <AlertDescription>
            Görmek için Sayfalar sekmesini aç ve Tarama sonucu filtresinde
            Başarısız seç.
          </AlertDescription>
        </Alert>
      )}

      {rendered && (
        <p className="text-sm text-muted-foreground">
          Bu denetimde JavaScript işleme açıktı.
        </p>
      )}
    </>
  );
}
