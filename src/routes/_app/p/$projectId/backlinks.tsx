import { createFileRoute } from "@tanstack/react-router";
import { BingBacklinksPage } from "@/client/features/backlinks/BingBacklinksPage";
import { pageHead } from "@/client/lib/pageHead";

export const Route = createFileRoute("/_app/p/$projectId/backlinks")({
  head: () => pageHead("Backlinkler"),
  component: BacklinksRoute,
});

function BacklinksRoute() {
  const { projectId } = Route.useParams();
  return <BingBacklinksPage projectId={projectId} />;
}
