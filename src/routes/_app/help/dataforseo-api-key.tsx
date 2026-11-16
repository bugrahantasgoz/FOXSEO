import { createFileRoute } from "@tanstack/react-router";
import {
  CommandBlock,
  helpLinkClassName,
  SecretHelpPage,
} from "@/client/features/help/SecretHelpPage";
import { pageHead } from "@/client/lib/pageHead";

const DATAFORSEO_API_ACCESS_URL = "https://app.dataforseo.com/api-access";

export const Route = createFileRoute("/_app/help/dataforseo-api-key")({
  head: () => pageHead("DataForSEO API anahtarı"),
  component: DataforseoApiKeyHelpPage,
});

function DataforseoApiKeyHelpPage() {
  const requestStep = (
    <li>
      Önce{" "}
      <a
        className={helpLinkClassName}
        href={DATAFORSEO_API_ACCESS_URL}
        target="_blank"
        rel="noreferrer"
      >
        DataForSEO API Access
      </a>{" "}
      sayfasına git ve API kimlik bilgilerini e-postayla iste.
    </li>
  );
  const encodeStep = (
    <li>
      DataForSEO giriş bilgini ve API şifreni bu biçimde base64 ile kodla:
      <CommandBlock command="printf '%s' 'YOUR_LOGIN:YOUR_PASSWORD' | base64" />
    </li>
  );
  return (
    <SecretHelpPage
      title="DataForSEO API anahtarını kur"
      intro={
        <>
          Anahtar kelime, alan adı ve SEO veri akışlarının çalışması için
          FOXSEO&apos;nun <code>DATAFORSEO_API_KEY</code> gizli değerine
          ihtiyacı var.
        </>
      }
      everyAppIntro="FOXSEO'nun anahtar kelime, alan adı, backlink ve sıralama verileri DataForSEO'dan gelir. Every App'te anahtar gateway'de bir kez, tüm uygulamalar için tutulur."
      secretName="DATAFORSEO_API_KEY"
      steps={
        <>
          {requestStep}
          {encodeStep}
          <li>
            Çıktıyı ortamında <code>DATAFORSEO_API_KEY</code> gizli değeri
            olarak kaydet.
          </li>
        </>
      }
      everyAppSteps={
        <>
          {requestStep}
          {encodeStep}
          <li>
            Every App klasöründe bunu çalıştır ve değeri yapıştır:
            <CommandBlock command="pnpm everyapp secret set DATAFORSEO_API_KEY" />
          </li>
          <li>FOXSEO&apos;yu yenile: anahtarı bir sonraki istekte kullanır.</li>
        </>
      }
      dashboardPasteStep="Yukarıdaki terminal komutunun verdiği base64 değerini yapıştır ve kaydet."
      terminalPromptHint={
        <>
          Sorulduğunda <code>login:password</code> bilgisinin base64 değerini
          gir.
        </>
      }
    />
  );
}
