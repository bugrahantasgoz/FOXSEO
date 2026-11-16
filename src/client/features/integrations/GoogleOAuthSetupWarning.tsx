import { AlertTriangle, Info } from "lucide-react";
import { SafeExternalLink } from "@/client/components/SafeExternalLink";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/client/components/ui/alert";
import { isEveryAppClientAuthMode } from "@/lib/auth-mode";

const EVERY_APP_GOOGLE_SETUP_URL =
  "https://everyapp.com/docs/providers/google#connect-accounts";

export function GoogleOAuthSetupWarning({
  integrationName,
  docsUrl,
}: {
  integrationName: string;
  docsUrl: string;
}) {
  if (isEveryAppClientAuthMode()) {
    // Google connects through the gateway, which holds the Google client;
    // FOXSEO holds none here (server/features/google/googleAccess.ts).
    return (
      <Alert variant="info">
        <Info className="size-4" />
        <AlertTitle>Önce Google&apos;ı Every App&apos;e ekle</AlertTitle>
        <AlertDescription>
          <p>
            Bu bir kez yapılır: yönlendirme URI&apos;si{" "}
            <code>
              https://&lt;your gateway&gt;/connect/google-workspace/callback
            </code>
            {" "}olan bir Google OAuth istemcisi oluştur, sonra istemci kimliğini
            ve gizli anahtarını Every App&apos;te Manage workspace → Providers
            altına yapıştır ya da şunu çalıştır:{" "}
            <code>
              pnpm everyapp secret set GOOGLE_WORKSPACE_CLIENT_ID
              GOOGLE_WORKSPACE_CLIENT_SECRET
            </code>
            . Ardından {integrationName} bağlantısını burada kur.
          </p>
          <SafeExternalLink
            url={EVERY_APP_GOOGLE_SETUP_URL}
            label="Sağlayıcı nasıl eklenir"
            className="inline-flex items-center gap-1 font-medium underline underline-offset-2"
          />
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <Alert variant="warning">
      <AlertTriangle className="size-4" />
      <AlertTitle>Google OAuth istemcisi ayarlanmamış</AlertTitle>
      <AlertDescription>
        <p>
          {integrationName} bağlantısını kurmadan önce Google istemci kimliğini
          ve gizli anahtarını FOXSEO kurulumuna ekle.
        </p>
        <SafeExternalLink
          url={docsUrl}
          label="Kurulum rehberini aç"
          className="inline-flex items-center gap-1 font-medium underline underline-offset-2"
        />
      </AlertDescription>
    </Alert>
  );
}
