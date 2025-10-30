import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";

import { getJiraWorklogById, createJiraWorklog, updateJiraWorklog } from "@/utils";
import type { JiraWorklog, JiraWorklogCreateParams, JiraWorklogUpdateParams } from "@/types";

export function useJiraWorklogQuery<TData = JiraWorklog>(
  worklogId: number,
  queryOptions?: Partial<UseQueryOptions<JiraWorklog, Error, TData>>,
) {
  return useQuery<JiraWorklog, Error, TData>({
    queryKey: ["jira-worklog", worklogId],
    queryFn: () => getJiraWorklogById(worklogId),
    enabled: !!worklogId,
    staleTime: 0,
    gcTime: 20 * 1000,
    ...queryOptions,
  });
}

export function useJiraWorklogCreateMutation(
  mutationOptions?: Partial<UseMutationOptions<JiraWorklog, Error, JiraWorklogCreateParams>>,
) {
  const queryClient = useQueryClient();

  return useMutation<JiraWorklog, Error, JiraWorklogCreateParams>({
    mutationFn: createJiraWorklog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jira-worklog"] });
      queryClient.invalidateQueries({ queryKey: ["jira-search-issue"] });
    },
    ...mutationOptions,
  });
}

export function useJiraWorklogUpdateMutation(
  mutationOptions?: Partial<
    UseMutationOptions<JiraWorklog, Error, { worklogId: number; params: JiraWorklogUpdateParams }>
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<JiraWorklog, Error, { worklogId: number; params: JiraWorklogUpdateParams }>({
    mutationFn: ({ worklogId, params }) => updateJiraWorklog(worklogId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jira-worklog"] });
      queryClient.invalidateQueries({ queryKey: ["jira-search-issue"] });
    },
    ...mutationOptions,
  });
}
