import { revalidateLogic } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { useAppForm } from "@/client/components/form/useAppForm";
import { Button } from "@/client/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog";
import { captureClientEvent } from "@/client/lib/posthog";
import { saveReportTemplate } from "@/serverFunctions/reportTemplates";
import type { ReportTemplate } from "@/types/schemas/report-templates";

// One form for create and edit. Shape only, as at every other boundary: the
// caps come back from the service with their copy and show in a toast.
const formSchema = z.object({
  name: z.string().trim().min(1, "Şablona bir ad ver."),
  description: z
    .string()
    .trim()
    .min(1, "Bu şablonun ne zaman kullanılacağını tek satırda yaz."),
  instructions: z
    .string()
    .trim()
    .min(1, "Raporun kimin için olduğunu ve hangi bölümleri içerdiğini yaz."),
});

const INSTRUCTIONS_PLACEHOLDER = `Okuyucu: teknik bilgisi olmayan pazarlama sorumlusu.
Bölümler, sırayla: Neredeyiz / Bu ay ne yaptık / Neler değişti / Sırada ne var.
Üslup: sade ve kendinden emin. Her SEO terimini açıkla. Ünlem işareti yok.
İmza: Acme SEO
Vurgu rengi: #1C4ED8`;

export function ReportTemplateForm({
  projectId,
  template,
  onClose,
  onSaved,
}: {
  projectId: string;
  /** The template being edited, or undefined when creating one. */
  template?: ReportTemplate;
  onClose: () => void;
  onSaved: () => void;
}) {
  const saveMutation = useMutation({
    // A refusal (duplicate name, the cap) comes back as `{ ok: false }` rather
    // than an error, because thrown errors reach the client stripped to their
    // code. Rethrowing it here lets the mutation cache toast its message.
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const result = await saveReportTemplate({
        data: { projectId, templateId: template?.id, ...values },
      });
      if (!result.ok) throw new Error(result.message);
      return result;
    },
    onSuccess: (result) => {
      captureClientEvent("report_template:saved", {
        project_id: projectId,
        is_update: !result.created,
        source: "app",
      });
      toast.success(result.created ? "Şablon oluşturuldu" : "Şablon kaydedildi");
      onSaved();
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: template?.name ?? "",
      description: template?.description ?? "",
      instructions: template?.instructions ?? "",
    },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: formSchema },
    onSubmit: ({ value }) => saveMutation.mutateAsync(value),
  });

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !saveMutation.isPending) onClose();
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-2xl">
        <form.AppForm>
          <form.Form className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>
                {template ? "Şablonu düzenle" : "Yeni şablon"}
              </DialogTitle>
            </DialogHeader>

            <form.AppField name="name">
              {(field) => (
                <field.TextField
                  label="Ad"
                  placeholder="Aylık durum raporu"
                  required
                />
              )}
            </form.AppField>

            <form.AppField name="description">
              {(field) => (
                <field.TextField
                  label="Açıklama"
                  description="Ne zaman kullanılacağını anlatan tek satır. Ajan buna bakarak karar verir."
                  placeholder="Her ay hazırladığım site durum özeti."
                  required
                />
              )}
            </form.AppField>

            <form.AppField name="instructions">
              {(field) => (
                <field.TextareaField
                  label="Talimatlar"
                  description="Projenin genel marka üslubu Bağlam › Yazım tercihleri bölümünde durur."
                  className="h-56 font-mono leading-relaxed md:text-xs"
                  placeholder={INSTRUCTIONS_PLACEHOLDER}
                  required
                />
              )}
            </form.AppField>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={saveMutation.isPending}
              >
                Vazgeç
              </Button>
              <form.SubmitButton>
                {template ? "Değişiklikleri kaydet" : "Şablon oluştur"}
              </form.SubmitButton>
            </DialogFooter>
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
