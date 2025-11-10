import { useQuery } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";

import { getJiraField, processJiraFieldItem } from "@/utils";
import type { JiraField, ProcessedJiraField, QueryOptions } from "@/types";

export function useJiraFieldQuery<TSelect = ProcessedJiraField[]>(options?: QueryOptions<JiraField[], TSelect>) {
  return useQuery<JiraField[], Error, TSelect, QueryKey>({
    queryKey: ["jira-manage-fields"],
    queryFn: getJiraField,
    select: (data) => {
      return data.map((field) => processJiraFieldItem(field, false)) as TSelect;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    ...options,
  });
}
