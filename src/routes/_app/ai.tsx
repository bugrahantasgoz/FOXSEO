import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { everyAppAccountQueryOptions } from "@/client/features/every-app/everyAppAccountQueries";
import { z } from "zod";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/client/components/ui/tabs";
import { Alert, AlertDescription } from "@/client/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { PageHeader } from "@/client/components/PageHeader";
import { ArrowUpRight, Info } from "lucide-react";
import { getClientAuthMode } from "@/lib/auth-mode";
import { captureClientEvent } from "@/client/lib/posthog";
import {
  agentUpdatePrompt,
  getAgentSetupPrompt,
} from "@/client/features/ai-mcp/agentSetupPrompt";
import { CopyButton } from "@/client/components/CopyButton";
import { AgentList } from "@/client/features/ai-mcp/AgentList";
import { pageHead } from "@/client/lib/pageHead";

const DOCS_URL = "https://openseo.so/docs/agent-setup";

const COACH_DOCS_URL = "https://openseo.so/docs/skills/seo-coach";
const LINK_CLASS =
  "text-foreground underline decoration-foreground/25 underline-offset-4 hover:decoration-foreground";
const MUTED_LINK_CLASS =
  "inline-flex items-center gap-1 text-sm text-muted-foreground underline decoration-foreground/25 underline-offset-4 hover:text-foreground";
const SKILLS = [
  ["seo-coach", "Nerede olduğunu anlatır ve bir sonraki adımını seçer."],
  [
    "seo-project-setup",
    "Hedeflerini, rakiplerini ve önemli sayfalarını ortak bağlam olarak kaydeder.",
  ],
  [
    "seo-audit",
    "Bu hafta yapılacak tek bir işe odaklanan, tek sayfalık site denetimi.",
  ],
  [
    "ai-visibility-audit",
    "Yapay zekâ yanıtlarında anılma şansını en çok artıracak birkaç değişikliği bulur.",
  ],
  [
    "ai-prompt-research",
    "İnsanların ChatGPT'ye pazarın hakkında ne sorduğunu ve kimlerin anıldığını bulur.",
  ],
  ["keyword-research", "Birkaç başlangıç konusundan anahtar kelime fırsatları bulur."],
  ["keyword-clustering", "Anahtar kelimeleri amaca göre gruplar ve sayfalarla eşleştirir."],
  ["competitive-landscape", "Pazarında kimin kazandığını ve nedenini çıkarır."],
  [
    "competitor-analysis",
    "Bir rakibin anahtar kelimelerini, içeriğini ve backlinklerini inceler.",
  ],
  ["link-prospecting", "Link alınabilecek siteleri bulur ve iletişim taslağı hazırlar."],
  ["local-seo", "Google İşletme Profilini ve Haritalar görünürlüğünü denetler."],
  ["seo-report", "Yukarıdakilerden herhangi birini Raporlar sayfana rapor olarak kaydeder."],
];

const aiSearchSchema = z.object({
  // Active tab. Omitted for the default "setup" tab.
  tab: z.enum(["skills"]).optional().catch(undefined),
});

export const Route = createFileRoute("/_app/ai")({
  head: () => pageHead("Yapay zekâ ajanı kurulumu"),
  validateSearch: aiSearchSchema,
  component: AiPage,
});

const everyApp = getClientAuthMode() === "everyapp";

function AiPage() {
  const { tab = "setup" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const origin = window.location.origin;
  const mcpUrl = `${origin}/mcp`;
  const prompt = getAgentSetupPrompt(origin);

  return (
    <div className="h-full overflow-auto px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Yapay zekâ ajanı kurulumu"
          description="FOXSEO'yu en verimli şekilde, zaten kullandığın yapay zekâ ajanı üzerinden kullanırsın. Bir kez kur, sonra ona istediğini sor."
        />

        <Tabs
          value={tab}
          onValueChange={(value) =>
            void navigate({
              search: { tab: value === "skills" ? "skills" : undefined },
              replace: true,
            })
          }
          className="mt-8"
        >
          <TabsList variant="line">
            <TabsTrigger value="setup">Ajanını kur</TabsTrigger>
            <TabsTrigger value="skills">Beceriler</TabsTrigger>
          </TabsList>
          <TabsContent value="setup">
            {everyApp ? (
              <EveryAppAgentSetup />
            ) : (
              <>
                <div className="mt-6 space-y-5">
                  <Card size="lg">
                    <CardHeader>
                      <CardTitle>
                        <h2>Ajanını kur</h2>
                      </CardTitle>
                      <CardDescription>
                        FOXSEO&apos;yu bağlamak ve SEO becerilerini yüklemek için
                        kurulum promptunu ajanına yapıştır. Elle yapılması
                        gereken adımlarda sana yol gösterir.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AgentList />
                      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                        <CopyButton
                          variant="default"
                          size="lg"
                          value={prompt}
                          label="Kurulum promptunu kopyala"
                          successMessage="Kurulum promptu kopyalandı"
                          onCopy={() =>
                            captureClientEvent("mcp:setup_prompt_copy")
                          }
                        />
                        <a
                          href={`${DOCS_URL}#set-up-your-agent`}
                          target="_blank"
                          rel="noreferrer"
                          className={MUTED_LINK_CLASS}
                        >
                          Kurulum talimatları
                          <ArrowUpRight className="size-3.5" />
                        </a>
                      </div>
                    </CardContent>
                    <CardFooter className="text-muted-foreground">
                      <p>
                        Bağlandıktan sonra ajanından, ne yapacağını seçmene
                        yardım etmesi için{" "}
                        <a
                          href={COACH_DOCS_URL}
                          target="_blank"
                          rel="noreferrer"
                          className={LINK_CLASS}
                        >
                          SEO Coach
                        </a>{" "}
                        becerisini kullanmasını iste.
                      </p>
                    </CardFooter>
                  </Card>

                  <Card size="lg">
                    <CardHeader>
                      <CardTitle>
                        <h2>Becerilerini güncelle</h2>
                      </CardTitle>
                      <CardDescription>
                        Zaten bağlı mısın? Bağlantı ayarlarını ve kendi
                        düzenlemelerini koruyarak en yeni FOXSEO becerilerini
                        almak için güncelleme promptunu ajanına yapıştır.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center gap-x-5 gap-y-3">
                      <CopyButton
                        variant="default"
                        size="lg"
                        value={agentUpdatePrompt}
                        label="Güncelleme promptunu kopyala"
                        successMessage="Güncelleme promptu kopyalandı"
                        onCopy={() =>
                          captureClientEvent("mcp:update_prompt_copy")
                        }
                      />
                      <a
                        href={`${DOCS_URL}#update-your-skills`}
                        target="_blank"
                        rel="noreferrer"
                        className={MUTED_LINK_CLASS}
                      >
                        Güncelleme talimatları
                        <ArrowUpRight className="size-3.5" />
                      </a>
                    </CardContent>
                  </Card>
                </div>

                {getClientAuthMode() === "cloudflare_access" ? (
                  <Alert className="mt-8">
                    <Info />
                    <AlertDescription>
                      Bu kurulum Cloudflare Access arkasında; bu yüzden MCP
                      istemcileri Access uygulamandaki Managed OAuth üzerinden
                      bağlanır. Bir istemci bağlanmak yerine giriş sayfası
                      görüyorsa Managed OAuth&apos;un açık olduğunu kontrol et.{" "}
                      <a
                        href="https://github.com/every-app/open-seo/blob/main/docs/SELF_HOSTING_CLOUDFLARE_OPERATIONS.md#through-cloudflare-access"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium"
                      >
                        Kurulum rehberi
                      </a>
                    </AlertDescription>
                  </Alert>
                ) : null}

                <div className="mt-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border pt-5 text-xs text-muted-foreground">
                  <span>
                    Bu kurulumun MCP sunucu adresi:{" "}
                    <code className="font-mono text-foreground/80">
                      {mcpUrl}
                    </code>
                  </span>
                  <CopyButton
                    value={mcpUrl}
                    successMessage="MCP adresi kopyalandı"
                    onCopy={() => captureClientEvent("mcp:setup_url_copy")}
                  />
                </div>
              </>
            )}
          </TabsContent>
          <TabsContent value="skills">
            <section className="mt-6">
              <p className="text-sm text-muted-foreground">
                {everyApp
                  ? "Bunları npx skills add every-app/open-seo komutuyla yükle."
                  : "Kurulum promptu bunları yükler."}{" "}
                Kısa bir yanıt yerine tam bir rapor istediğinde birini adıyla
                çalıştır.
              </p>
              <ul className="mt-5 space-y-3 text-sm sm:space-y-2">
                {SKILLS.map(([name, blurb]) => (
                  <li
                    key={name}
                    className="flex flex-col gap-0.5 sm:flex-row sm:gap-3"
                  >
                    <a
                      href={`https://openseo.so/docs/skills/${name}`}
                      target="_blank"
                      rel="noreferrer"
                      className={`shrink-0 font-mono text-[13px] sm:w-48 ${LINK_CLASS}`}
                    >
                      /{name}
                    </a>
                    <span className="text-muted-foreground">{blurb}</span>
                  </li>
                ))}
              </ul>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

const EVERY_APP_SKILLS_COMMAND = "npx skills add every-app/open-seo";

/**
 * Behind Every App the agent connects to the gateway's MCP address, which
 * covers every app on it; FOXSEO serves no MCP of its own here. The skills
 * install on their own.
 */
function EveryAppAgentSetup() {
  const gatewayUrl = useQuery(everyAppAccountQueryOptions()).data?.gatewayUrl;
  return (
    <div className="mt-6 space-y-5">
      <Card size="lg">
        <CardHeader>
          <CardTitle>
            <h2>Ajanını Every App&apos;e bağla</h2>
          </CardTitle>
          <CardDescription>
            Every App&apos;te ajanın için tek bir adres var; FOXSEO&apos;yu ve
            diğer uygulamalarını kapsar. Bir kez bağla.
          </CardDescription>
        </CardHeader>
        {gatewayUrl ? (
          <CardContent className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <code className="font-mono text-sm">{gatewayUrl}/mcp</code>
            <CopyButton
              value={`${gatewayUrl}/mcp`}
              successMessage="MCP adresi kopyalandı"
            />
          </CardContent>
        ) : null}
      </Card>

      <Card size="lg">
        <CardHeader>
          <CardTitle>
            <h2>SEO becerilerini yükle</h2>
          </CardTitle>
          <CardDescription>
            FOXSEO becerilerini ajanına eklemek için bunu terminalde çalıştır.
            Beceriler FOXSEO&apos;yu Every App bağlantın üzerinden kullanır.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <code className="font-mono text-sm">{EVERY_APP_SKILLS_COMMAND}</code>
          <CopyButton
            value={EVERY_APP_SKILLS_COMMAND}
            successMessage="Komut kopyalandı"
          />
        </CardContent>
        <CardFooter className="text-muted-foreground">
          <p>
            Bağlandıktan sonra ajanından, ne yapacağını seçmene yardım etmesi
            için{" "}
            <a
              href={COACH_DOCS_URL}
              target="_blank"
              rel="noreferrer"
              className={LINK_CLASS}
            >
              SEO Coach
            </a>{" "}
            becerisini kullanmasını iste.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
