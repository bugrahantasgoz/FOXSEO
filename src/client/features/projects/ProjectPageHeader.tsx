import { useQuery } from "@tanstack/react-query";
import { BackLink, PageHeader } from "@/client/components/PageHeader";
import { projectsQueryOptions } from "./projectQueries";
import type { PageHelpTopic } from "@/client/features/help/pageHelpContent";

export function ProjectPageHeader({
  projectId,
  title,
  showBackLink = false,
  help,
}: {
  projectId: string;
  title: string;
  showBackLink?: boolean;
  help?: PageHelpTopic;
}) {
  const projectsQuery = useQuery(projectsQueryOptions());
  const project = projectsQuery.data?.find((entry) => entry.id === projectId);

  return (
    <PageHeader
      title={title}
      help={help}
      description={project?.name ?? " "}
      backLink={
        showBackLink ? <BackLink to="/projects">Projects</BackLink> : undefined
      }
    />
  );
}
