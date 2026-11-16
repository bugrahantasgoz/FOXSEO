import { Button } from "@/client/components/ui/button";
import type { GooglePickerAccount } from "./GooglePropertyPicker";

export function GscPropertySetupHelp({
  accounts,
  loading,
  busy,
  linking,
  onRetry,
  onReconnect,
}: {
  accounts: GooglePickerAccount[];
  loading: boolean;
  busy: boolean;
  linking: boolean;
  onRetry: () => void;
  onReconnect: () => void;
}) {
  return (
    <>
      <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4 text-sm">
        <h2 className="font-semibold">Siteni bulamadık</h2>
        <p className="break-words text-muted-foreground">
          Kontrol edilen hesaplar:{" "}
          {accounts
            .map(
              (account) =>
                account.email ??
                `Google hesabı · ${account.accountId.slice(-6)}`,
            )
            .join(", ")}
          .
        </p>
        <p className="text-muted-foreground">
          Siteni Google Search Console&apos;a ekle ya da siteyi yöneten kişiden
          {accounts.length === 1
            ? " bu hesaba"
            : " bu hesaplardan birine"}{" "}
          erişim vermesini iste.
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            Search Console&apos;u aç ↗
          </a>
          <a
            href="https://openseo.so/blogs/google-search-console-setup"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            Kurulum rehberi
          </a>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={loading || busy}
        >
          {loading ? "Yenileniyor…" : "Yenile"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReconnect}
          disabled={loading || busy}
          pending={linking}
        >
          {linking ? "Google açılıyor…" : "Başka bir Google hesabı kullan"}
        </Button>
      </div>
    </>
  );
}

export function hasNoGscWebsites(
  accounts: GooglePickerAccount[],
  loading: boolean,
  error: boolean,
) {
  return (
    !loading &&
    !error &&
    accounts.length > 0 &&
    accounts.every(
      (account) =>
        !account.requiresReconnect &&
        !account.unavailable &&
        account.properties.length === 0,
    )
  );
}
