import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { revalidateLogic } from "@tanstack/react-form";
import { useAppForm } from "@/client/components/form/useAppForm";
import { useAuditCapabilities } from "@/client/features/audit/shared";
import { isEveryAppClientAuthMode } from "@/lib/auth-mode";
import { saveCrawlerCredential } from "@/serverFunctions/crawlerAccess";
import {
  isCrawlerAccessExpired,
  parseSignatureExpiry,
} from "@/shared/crawler-access";

export const crawlerCredentialsQueryKey = ["crawler-credentials"];
export const saveCrawlerCredentialMutationKey = ["save-crawler-credential"];

/**
 * CRAWLER_ACCESS_SECRET is optional on Every App and on self-hosts, so the form
 * and the Shopify crawl warning say how to set it instead of failing on save.
 */
export function CrawlerAccessSetupHint() {
  if (isEveryAppClientAuthMode()) {
    return (
      <>
        <code>CRAWLER_ACCESS_SECRET</code> değerini şu komutla ayarla:{" "}
        <code>
          pnpm everyapp secret set CRAWLER_ACCESS_SECRET --app openseo
        </code>
        .
      </>
    );
  }
  return (
    <>
      Ortam değişkenlerinde <code>CRAWLER_ACCESS_SECRET</code> değerini en az
      32 rastgele karakter olarak ayarla, sonra uygulamayı yeniden başlat.
    </>
  );
}

/** Whether to show the setup hint, once the server has said. */
export function useCrawlerAccessNeedsSetup(projectId: string) {
  return useAuditCapabilities(projectId).data?.canStoreCrawlerAccess === false;
}

const signatureSchema = z.object({
  host: z.string().trim().min(1, "Bir alan adı gir."),
  signatureInput: z
    .string()
    .trim()
    .min(1, "Signature-Input değerini gir.")
    .refine(
      (value) => !isCrawlerAccessExpired(parseSignatureExpiry(value)),
      "Bu imzanın süresi dolmuş. Shopify yönetim panelinde yenisini oluştur.",
    ),
  signature: z.string().trim().min(1, "Signature değerini gir."),
});

/**
 * The two values a merchant copies out of Shopify admin. `Signature-Agent` is
 * a constant we add ourselves, so it is not asked for here.
 */
export function CrawlerAccessForm({
  projectId,
  initialHost,
  lockHost = false,
  onSaved,
}: {
  /** The project (website) the signature is stored on. */
  projectId: string;
  initialHost: string;
  lockHost?: boolean;
  onSaved?: () => void;
}) {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationKey: saveCrawlerCredentialMutationKey,
    mutationFn: (values: z.infer<typeof signatureSchema>) =>
      saveCrawlerCredential({
        data: { projectId, ...values },
      }),
    onSuccess: async (result) => {
      if ("problem" in result) return;
      await queryClient.invalidateQueries({
        queryKey: crawlerCredentialsQueryKey,
      });
      toast.success(`${result.credential.host} için tarayıcı erişimi kaydedildi`);
      onSaved?.();
    },
  });

  const form = useAppForm({
    defaultValues: { host: initialHost, signatureInput: "", signature: "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: signatureSchema },
    onSubmit: async ({ value, formApi }) => {
      const result = await saveMutation.mutateAsync(value);
      if ("problem" in result) {
        const { problem } = result;
        formApi.setErrorMap({
          onSubmit: {
            fields: {
              signatureInput:
                problem.reason === "wrong_domain"
                  ? `Bu imza ${problem.host} için değil, ${problem.signedHost} için oluşturulmuş. Shopify yönetim panelinde ${problem.host} için bir imza oluştur.`
                  : `Shopify bu imzayı ${problem.host} için kabul etmiyor. İmzayı ${problem.host} için oluşturduğunu ve iki değeri de eksiksiz kopyaladığını kontrol et.`,
            },
          },
        });
        return;
      }
      formApi.reset({ ...value, signatureInput: "", signature: "" });
    },
  });

  if (useCrawlerAccessNeedsSetup(projectId)) {
    return (
      <p className="text-sm text-muted-foreground">
        Tarayıcı erişimi henüz kurulmadı. <CrawlerAccessSetupHint />
      </p>
    );
  }

  return (
    <form.AppForm>
      <form.Form className="space-y-3">
        {!lockHost ? (
          <form.AppField name="host">
            {(field) => (
              <field.TextField
                label="Alan adı"
                placeholder="store.example.com"
                className="font-mono"
                required
              />
            )}
          </form.AppField>
        ) : null}
        <form.AppField name="signatureInput">
          {(field) => (
            <field.TextField
              label="Signature-Input"
              type="password"
              autoComplete="off"
              data-ph-mask
              className="font-mono"
              placeholder="sig1=(...);expires=..."
              required
            />
          )}
        </form.AppField>
        <form.AppField name="signature">
          {(field) => (
            <field.TextField
              label="Signature"
              description="Shopify bir de Signature-Agent değeri gösterir. Onu yapıştırmana gerek yok: FOXSEO her istekle bunu kendisi gönderir."
              type="password"
              autoComplete="off"
              data-ph-mask
              className="font-mono"
              placeholder="sig1=:...:"
              required
            />
          )}
        </form.AppField>
        <form.SubmitButton disabled={!projectId}>
          İmzayı kaydet
        </form.SubmitButton>
      </form.Form>
    </form.AppForm>
  );
}
