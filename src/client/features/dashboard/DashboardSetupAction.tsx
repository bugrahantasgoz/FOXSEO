import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAgentSetupPrompt } from "@/client/features/ai-mcp/agentSetupPrompt";
import {
  AgentSetupPanel,
  AGENT_SETUP_DESCRIPTION,
} from "@/client/features/ai-mcp/AgentSetupPanel";
import { CopyButton } from "@/client/components/CopyButton";
import { CreateProjectModal } from "@/client/features/projects/CreateProjectModal";
import { InviteTeammateModal } from "@/client/features/team/InviteTeammateModal";
import { PermissionHint } from "@/client/components/PermissionHint";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/client/components/ui/collapsible";
import { organizationContextQueryOptions } from "@/client/features/team/organizationQueries";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { captureClientEvent } from "@/client/lib/posthog";
import { hasOrgPermission } from "@/lib/org-permissions";
import type { DashboardSetupStep } from "@/types/schemas/dashboard";
import { parseResearchTarget } from "@/shared/researchScope";

const projectPrompt = `FOXSEO'yu kullanarak aşağıdaki her site için ayrı bir proje kur. Önce mevcut projelerimi listele ve eşleşenleri yeniden kullan, böylece kopya oluşmasın. Her site için ülke ve dili ayarla, eksik bir şey varsa bana sor.

Bu listeyi kendi sitelerimle değiştir:
- Proje adı — site — ülke — dil`;

export function DashboardSetupAction({
  step,
  projectId,
  domain,
  onComplete,
}: {
  step: DashboardSetupStep;
  projectId: string;
  domain: string | null;
  onComplete: () => void;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const org = useQuery(organizationContextQueryOptions());
  // Research steps open the page with the user's input already applied, so
  // the research runs on arrival and completes the step.
  if (step === "competitor")
    return (
      <StepInputForm
        description="Bir rakibin alan adını incele; hangi konularda sıralandığını ve ona link veren siteleri keşfet."
        label="Rakip site"
        placeholder="rakip.com"
        submitLabel="Rakibi incele"
        validate={validateDomain}
        onSubmit={(value) => {
          onComplete();
          void navigate({
            to: "/p/$projectId/domain",
            params: { projectId },
            search: { domain: parseDomain(value) },
          });
        }}
      />
    );
  if (step === "keywords")
    return (
      <StepInputForm
        description="Sunduğun şeyi anlatan tek bir kelimeyle başla. İlgili aramaları ve arama hacimlerini göreceksin."
        label="Başlangıç kelimesi"
        placeholder="örn. koşu ayakkabısı"
        submitLabel="Kelime fikirleri al"
        validate={(value) =>
          value.trim() ? undefined : "Başlamak için bir kelime yaz"
        }
        onSubmit={(value) => {
          onComplete();
          void navigate({
            to: "/p/$projectId/keywords",
            params: { projectId },
            search: { q: value.trim() },
          });
        }}
      />
    );
  if (step === "audit")
    return (
      <StepInputForm
        description="Kırık linkleri, eksik etiketleri ve arama motorlarının dizine ekleyemediği sayfaları bulmak için siteni tara. Taramanın boyutunu başlamadan önce ayarlayabilirsin."
        label="Site adresi"
        placeholder="https://example.com"
        defaultValue={domain ? `https://${domain}` : ""}
        submitLabel="Taramayı hazırla"
        validate={validateDomain}
        onSubmit={(value) => {
          onComplete();
          void navigate({
            to: "/p/$projectId/audit",
            params: { projectId },
            search: { url: value.trim() },
          });
        }}
      />
    );
  if (step === "mcp")
    return (
      <div className="max-w-2xl space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {AGENT_SETUP_DESCRIPTION}
        </p>
        <AgentSetupPanel
          prompt={getAgentSetupPrompt(
            typeof window === "undefined"
              ? "https://app.openseo.so"
              : window.location.origin,
          )}
          onCopy={() =>
            captureClientEvent("onboarding:setup_prompt_copy", {
              source: "dashboard",
            })
          }
        />
      </div>
    );

  const canManage =
    org.data &&
    hasOrgPermission(
      org.data.role,
      step === "project" ? { project: ["create"] } : { invitation: ["create"] },
    );
  if (!canManage)
    return org.isPending ? (
      <p className="text-sm text-muted-foreground">
        Çalışma alanı izinleri kontrol ediliyor…
      </p>
    ) : org.isError ? (
      <p className="text-sm text-muted-foreground">
        {getStandardErrorMessage(org.error)}
      </p>
    ) : (
      <PermissionHint action="help with this step" />
    );
  if (step === "project")
    return (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Her sitenin araştırmalarını, sıralamalarını ve bağlantılarını ayrı bir
          projede tut. İstediğin zaman kenar çubuğundaki proje seçici → Yeni
          proje yolunu kullanabilirsin.
        </p>
        <Button onClick={() => setShowModal(true)}>Yeni proje oluştur</Button>
        <Collapsible className="rounded-lg border border-border p-4">
          <CollapsibleTrigger className="cursor-pointer text-sm font-medium">
            Elinde bir site listesi mi var? Asistanın kursun.
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-3">
            <p className="text-sm text-muted-foreground">
              <Link
                to="/ai"
                className="text-primary underline-offset-4 hover:underline"
              >
                Asistanını bağla
              </Link>
              , sonra bu komutu site listenle birlikte yapıştır.
            </p>
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-muted-foreground">
              {projectPrompt}
            </pre>
            <CopyButton
              value={projectPrompt}
              label="Proje komutunu kopyala"
              successMessage="Proje komutu kopyalandı"
            />
          </CollapsibleContent>
        </Collapsible>
        {showModal && (
          <CreateProjectModal onClose={() => setShowModal(false)} />
        )}
      </div>
    );
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Bu adım tek kullanıcılı FOXSEO'da gerekli değil.
      </p>
      <Button onClick={() => setShowModal(true)}>Davet et</Button>
      {showModal && (
        <InviteTeammateModal
          onClose={() => setShowModal(false)}
          onInvited={() => {
            void queryClient.invalidateQueries({
              queryKey: ["organization-team"],
            });
            void queryClient.invalidateQueries({
              queryKey: ["dashboardActivation"],
            });
          }}
        />
      )}
    </div>
  );
}

function validateDomain(value: string) {
  const parsed = parseResearchTarget(value);
  return parsed.ok ? undefined : parsed.message;
}

function parseDomain(value: string) {
  const parsed = parseResearchTarget(value);
  return parsed.ok ? parsed.target.hostname : value.trim();
}

function StepInputForm({
  description,
  label,
  placeholder,
  defaultValue = "",
  submitLabel,
  validate,
  onSubmit,
}: {
  description: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
  submitLabel: string;
  validate: (value: string) => string | undefined;
  onSubmit: (value: string) => void;
}) {
  const form = useForm({
    defaultValues: { value: defaultValue },
    onSubmit: ({ value }) => onSubmit(value.value),
  });
  return (
    <form
      className="max-w-lg space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <form.Field
        name="value"
        validators={{
          // Stay quiet while the user is still typing; validate on submit, and
          // keep validating live after the first attempt.
          onChange: ({ value, fieldApi }) =>
            fieldApi.form.state.submissionAttempts > 0
              ? validate(value)
              : undefined,
        }}
      >
        {(field) => (
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">{label}</span>
            <Input
              type="text"
              maxLength={255}
              placeholder={placeholder}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              aria-invalid={field.state.meta.errors.length > 0}
              className="h-12 px-4 md:text-base"
            />
            {field.state.meta.errors.length > 0 && (
              <span className="text-xs text-destructive">
                {field.state.meta.errors.join(", ")}
              </span>
            )}
          </label>
        )}
      </form.Field>
      <form.Subscribe selector={(state) => state.canSubmit}>
        {(canSubmit) => (
          <Button type="submit" size="lg" disabled={!canSubmit}>
            {submitLabel}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
