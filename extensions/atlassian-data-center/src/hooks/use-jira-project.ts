import { useQuery } from "@tanstack/react-query";

import { getJiraProject } from "@/utils";
import type { JiraIssueProject, QueryOptions } from "@/types";

export function useJiraProjectQuery<TSelect = JiraIssueProject[]>(options?: QueryOptions<JiraIssueProject[], TSelect>) {
  return useQuery<JiraIssueProject[], Error, TSelect>({
    queryKey: ["jira-project"],
    queryFn: getJiraProject,
    staleTime: Infinity,
    gcTime: Infinity,
    ...options,
  });
}
