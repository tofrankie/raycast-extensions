import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";

import { JIRA_API } from "@/constants";
import { getJiraIssue, getJiraIssueTransitions, transitionJiraIssue, transformURL } from "@/utils";
import type { JiraSearchIssue, JiraTransitionResponse } from "@/types";

export function useJiraIssueQuery<TData = JiraSearchIssue>(
  issueKey: string,
  queryOptions?: Partial<UseQueryOptions<JiraSearchIssue, Error, TData>>,
) {
  return useQuery<JiraSearchIssue, Error, TData>({
    queryKey: ["jira-issue", issueKey],
    queryFn: () => {
      const url = transformURL(JIRA_API.ISSUE, { issueIdOrKey: issueKey });
      return getJiraIssue(url);
    },
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
    queryFn: () => {
      const url = transformURL(JIRA_API.ISSUE_TRANSITIONS, { issueIdOrKey: issueKey });
      return getJiraIssueTransitions(url);
    },
    enabled: !!issueKey,
    staleTime: 0,
    gcTime: 20 * 1000,
    ...queryOptions,
  });
}

export function useJiraIssueTransitionMutation(
  mutationOptions?: Partial<UseMutationOptions<void, Error, { issueKey: string; transitionId: string }>>,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { issueKey: string; transitionId: string }>({
    mutationFn: async ({ issueKey, transitionId }) => {
      const url = transformURL(JIRA_API.ISSUE_TRANSITIONS, { issueIdOrKey: issueKey });
      const params = { transition: { id: transitionId } };
      await transitionJiraIssue(url, params);
    },
    onSuccess: (_, { issueKey }) => {
      queryClient.invalidateQueries({ queryKey: ["jira-issue", issueKey] });
      queryClient.invalidateQueries({ queryKey: ["jira-issue-transitions", issueKey] });
      queryClient.invalidateQueries({ queryKey: ["jira-search-issue"] });
    },
    ...mutationOptions,
  });
}
