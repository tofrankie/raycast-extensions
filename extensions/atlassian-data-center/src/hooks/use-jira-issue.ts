import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";

import { getJiraIssue, getJiraIssueTransitions, transitionJiraIssue } from "@/utils";
import type { JiraIssue, JiraTransitionResponse } from "@/types";

export function useJiraIssueQuery<TData = JiraIssue>(
  issueKey: string,
  queryOptions?: Partial<UseQueryOptions<JiraIssue, Error, TData>>,
) {
  return useQuery<JiraIssue, Error, TData>({
    queryKey: ["jira-issue", issueKey],
    queryFn: () => getJiraIssue(issueKey),
    enabled: !!issueKey,
    staleTime: 0,
    gcTime: 20 * 1000,
    ...queryOptions,
  });
}

export function useJiraIssueTransitionsQuery<TData = JiraTransitionResponse>(
  issueKey: string,
  queryOptions?: Partial<UseQueryOptions<JiraTransitionResponse, Error, TData>>,
) {
  return useQuery<JiraTransitionResponse, Error, TData>({
    queryKey: ["jira-issue-transitions", issueKey],
    queryFn: () => getJiraIssueTransitions(issueKey),
    enabled: !!issueKey,
    staleTime: 0,
    gcTime: 20 * 1000,
    ...queryOptions,
  });
}

export function useJiraIssueTransitionMutation<TData = void>(
  mutationOptions?: Partial<UseMutationOptions<TData, Error, { issueKey: string; transitionId: string }>>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, { issueKey: string; transitionId: string }>({
    mutationFn: async ({ issueKey, transitionId }) => {
      await transitionJiraIssue(issueKey, transitionId);
      return undefined as TData;
    },
    onSuccess: (_, { issueKey }) => {
      queryClient.invalidateQueries({ queryKey: ["jira-issue", issueKey] });
      queryClient.invalidateQueries({ queryKey: ["jira-issue-transitions", issueKey] });
      queryClient.invalidateQueries({ queryKey: ["jira-search-issue"] });
    },
    ...mutationOptions,
  });
}
