import { createFileRoute } from "@tanstack/react-router";
import { CopyButton } from "@/client/components/CopyButton";
import { PageHeader } from "@/client/components/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { SUPPORT_EMAIL } from "@/client/lib/support";
import { pageHead } from "@/client/lib/pageHead";

const DISCORD_URL = "https://discord.gg/c9uGs3cFXr";
const GITHUB_URL = "https://github.com/every-app/open-seo";

export const Route = createFileRoute("/_app/support")({
  head: () => pageHead("Yardım ve Topluluk"),
  component: SupportPage,
});

function SupportPage() {
  return (
    <div className="h-full overflow-auto px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Yardım ve Topluluk
          </p>
          <PageHeader
            title="Yardım mı lazım?"
            description="FOXSEO, açık kaynaklı OpenSEO üzerine kurulu. Takıldığın bir yer olursa OpenSEO ekibine ve topluluğuna buradan ulaşabilirsin (yazışmalar İngilizce)."
          />
        </div>

        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>E-posta</h2>
              </CardTitle>
              <CardDescription>
                Fikir, sorun, soru veya geri bildirimlerini doğrudan gönder.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CopyButton
                value={SUPPORT_EMAIL}
                label={SUPPORT_EMAIL}
                successMessage="E-posta adresi panoya kopyalandı"
                size="sm"
              />
            </CardContent>
          </Card>

          <SupportLinkCard
            href={DISCORD_URL}
            title="Discord"
            description="Yardım iste, fikirlerini paylaş ve topluluktan öğren."
            cta="Discord'a katıl"
          />

          <SupportLinkCard
            href={`${GITHUB_URL}/issues`}
            title="GitHub Issues"
            description="GitHub'da hata bildir veya özellik iste."
            cta="Kayıt (issue) aç"
          />
        </div>
      </div>
    </div>
  );
}

function SupportLinkCard({
  href,
  title,
  description,
  cta,
}: {
  href: string;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="group block">
      <Card className="transition-colors group-hover:border-foreground/20">
        <CardHeader>
          <CardTitle>
            <h2>{title}</h2>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="font-medium">
          {cta} <span aria-hidden="true">&rarr;</span>
        </CardContent>
      </Card>
    </a>
  );
}
