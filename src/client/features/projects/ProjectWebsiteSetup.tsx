import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/client/components/ui/card";
import { WebsiteResearchProgress } from "./WebsiteResearchProgress";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Field, FieldLabel } from "@/client/components/ui/field";
import { Alert, AlertDescription } from "@/client/components/ui/alert";
import { InsufficientCreditsError } from "@/client/features/billing/InsufficientCreditsError";
import { getErrorCode } from "@/client/lib/error-messages";
import { isEveryAppClientAuthMode } from "@/lib/auth-mode";
import { projectsQueryOptions } from "@/client/features/projects/projectQueries";
import { projectContextQueryKey } from "@/client/features/projects/project-context/shared";
import { getProjectContext } from "@/serverFunctions/projectContext";
import { WebsiteSetupReview } from "@/client/features/projects/WebsiteSetupReview";
import {
  researchProjectWebsite,
  saveProjectWebsiteSetup,
} from "@/serverFunctions/projectWebsite";
import type {
  WebsiteResearch,
  SaveProjectWebsiteSetup,
} from "@/types/schemas/projectWebsite";

export function ProjectWebsiteSetup({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [website, setWebsite] = useState("");
  const [research, setResearch] = useState<WebsiteResearch | null>(null);
  // Saved context decides which research steps run.
  const context = useQuery({
    queryKey: projectContextQueryKey(projectId),
    queryFn: () => getProjectContext({ data: { projectId } }),
  });
  const researchMutation = useMutation({
    mutationFn: () => researchProjectWebsite({ data: { projectId, website } }),
    onSuccess: setResearch,
  });
  const saveMutation = useMutation({
    mutationFn: (accepted: Omit<SaveProjectWebsiteSetup, "projectId">) =>
      saveProjectWebsiteSetup({ data: { ...accepted, projectId } }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: projectsQueryOptions().queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: ["projectAccess", projectId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["projectContext", projectId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["aiVisibility", projectId],
        }),
      ]);
      toast.success("Proje bağlamı kaydedildi");
    },
  });
  if (research)
    return (
      <WebsiteSetupReview
        projectId={projectId}
        research={research}
        saving={saveMutation.isPending}
        error={saveMutation.isError}
        onSave={(accepted) => saveMutation.mutate(accepted)}
        onBack={() => {
          setResearch(null);
          saveMutation.reset();
        }}
      />
    );
  if (researchMutation.isPending)
    return (
      <WebsiteResearchProgress
        missingOverview={
          !context.data?.sections.some(
            (section) => section.key === "business_overview",
          )
        }
        missingCompetitors={!context.data?.competitors.length}
      />
    );
  return (
    <Card className="w-full max-w-2xl py-6 md:py-8">
      <CardContent className="px-6 md:px-8">
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            researchMutation.mutate();
          }}
        >
          <div>
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg border border-border bg-muted">
              <Sparkles className="size-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Yapay zekâ görünürlüğünü kur
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Markanı inceleyip takip edilecek en uygun konuları bulacağız.
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="project-website">Site URL&apos;si</FieldLabel>
            <Input
              id="project-website"
              inputMode="url"
              autoComplete="url"
              placeholder="Sitenin URL'sini gir"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              required
            />
          </Field>
          {getErrorCode(researchMutation.error) === "INSUFFICIENT_CREDITS" ? (
            <InsufficientCreditsError title="Bu site incelenemedi" />
          ) : (
            researchMutation.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  Bu site incelenemedi. URL&apos;yi ve sağlayıcı ayarlarını
                  kontrol edip tekrar dene.
                </AlertDescription>
              </Alert>
            )
          )}
          <div className="space-y-3">
            <Button
              type="submit"
              size="lg"
              disabled={!website.trim()}
              className="w-full"
            >
              İncelemeyi başlat
            </Button>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {isEveryAppClientAuthMode()
                ? "İnceleme ve promptlarının ilk çalıştırması Every App gateway'indeki DataForSEO ve OpenRouter anahtarlarını kullanır."
                : "İnceleme ve promptlarının ilk çalıştırması, bağlı veri sağlayıcılarının kullanım hakkından biraz harcar."}
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
