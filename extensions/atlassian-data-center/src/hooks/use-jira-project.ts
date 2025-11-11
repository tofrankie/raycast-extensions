import { useQuery } from "@tanstack/react-query";

import { getJiraProjects } from "@/utils";
import type { JiraIssueProject, QueryOptions } from "@/types";

export function useJiraProjectsQuery<TSelect = JiraIssueProject[]>(
  options?: QueryOptions<JiraIssueProject[], TSelect>,
) {
  return useQuery<JiraIssueProject[], Error, TSelect>({
    queryKey: ["jira-projects"],
    queryFn: getJiraProjects,
    staleTime: Infinity,
    gcTime: Infinity,
    ...options,
  });
}
