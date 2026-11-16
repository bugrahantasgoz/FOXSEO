import { createFileRoute } from "@tanstack/react-router";
import {
  CommandBlock,
  helpLinkClassName,
  SecretHelpPage,
} from "@/client/features/help/SecretHelpPage";
import { pageHead } from "@/client/lib/pageHead";

const OPENROUTER_KEYS_URL = "https://openrouter.ai/settings/keys";

export const Route = createFileRoute("/_app/help/openrouter-api-key")({
  head: () => pageHead("OpenRouter API anahtarı"),
  component: OpenrouterApiKeyHelpPage,
});

function OpenrouterApiKeyHelpPage() {
  const accountStep = (
    <li>
      Önce{" "}
      <a
        className={helpLinkClassName}
        href="https://openrouter.ai"
        target="_blank"
        rel="noreferrer"
      >
        openrouter.ai
      </a>{" "}
      adresinde hesap aç ve bakiye yükle (DataForSEO gibi kullandıkça öde).
    </li>
  );
  const keyStep = (
    <li>
      Sonra{" "}
      <a
        className={helpLinkClassName}
        href={OPENROUTER_KEYS_URL}
        target="_blank"
        rel="noreferrer"
      >
        OpenRouter API Keys
      </a>{" "}
      sayfasına git ve "Create API Key" düğmesine tıkla.
    </li>
  );
  return (
    <SecretHelpPage
      title="OpenRouter API anahtarını kur"
      intro={
        <>
          Uygulama içi SEO ajanı SAM gibi yapay zekâ özelliklerinin çalışması
          için FOXSEO&apos;nun <code>OPENROUTER_API_KEY</code> gizli değerine
          ihtiyacı var. İsteğe bağlıdır; FOXSEO&apos;nun geri kalanı onsuz da
          çalışır.
        </>
      }
      everyAppIntro="SAM, prompt önerileri ve site incelemesi OpenRouter üzerinde çalışır. Every App'te anahtar gateway'de bir kez, tüm uygulamalar için tutulur."
      secretName="OPENROUTER_API_KEY"
      steps={
        <>
          {accountStep}
          {keyStep}
          <li>
            Anahtarı ortamında <code>OPENROUTER_API_KEY</code> gizli değeri
            olarak kaydet:
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Docker ile kendi sunucunda: <code>.env</code>
              </li>
              <li>Cloudflare: Workers arayüzünden ayarla (aşağıya bak)</li>
              <li>
                Yerel geliştirme: <code>.env.local</code>
              </li>
            </ul>
          </li>
          <li>FOXSEO&apos;yu yeniden başlat.</li>
        </>
      }
      everyAppSteps={
        <>
          {accountStep}
          {keyStep}
          <li>
            Every App klasöründe bunu çalıştır ve anahtarı yapıştır:
            <CommandBlock command="pnpm everyapp secret set OPENROUTER_API_KEY" />
          </li>
          <li>FOXSEO&apos;yu yenile.</li>
        </>
      }
      dashboardPasteStep="OpenRouter API anahtarını yapıştır ve kaydet."
      terminalPromptHint="Sorulduğunda OpenRouter API anahtarını yapıştır."
    />
  );
}
