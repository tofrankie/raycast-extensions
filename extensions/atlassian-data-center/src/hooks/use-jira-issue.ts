import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import type { UseMutationOptions, QueryKey } from "@tanstack/react-query";

import { JIRA_API, PAGINATION_SIZE, JIRA_SEARCH_ISSUE_FIELDS } from "@/constants";
import {
  getJiraIssueByKey,
  getJiraIssuesByJQL,
  getJiraIssueTransitions,
  transitionJiraIssue,
  transformURL,
  processJiraSearchIssue,
  getSelectedFields,
  getSelectedFieldIds,
} from "@/utils";
import type {
  JiraIssueResponse,
  JiraIssueTransitionsResponse,
  JiraSearchResponse,
  ProcessedJiraIssue,
  QueryOptions,
  InfiniteQueryOptions,
  InfiniteQueryPageParam,
} from "@/types";

export function useJiraIssueQuery<TSelect = JiraIssueResponse>(
  issueKey: string,
  options?: QueryOptions<JiraIssueResponse, TSelect>,
) {
  return useQuery<JiraIssueResponse, Error, TSelect>({
    queryKey: ["jira-issue", issueKey],
    queryFn: () => {
      const url = transformURL(JIRA_API.ISSUE, { issueIdOrKey: issueKey });
      return getJiraIssueByKey(url);
    },
    staleTime: 0,
    gcTime: 30 * 1000,
    ...options,
  });
}

export function useJiraSearchInfiniteQuery<TSelect = { list: ProcessedJiraIssue[]; total: number }>(
  jql: string,
  options?: InfiniteQueryOptions<JiraSearchResponse, TSelect>,
) {
  return useInfiniteQuery<JiraSearchResponse, Error, TSelect, QueryKey, InfiniteQueryPageParam>({
    queryKey: ["jira-search-issues", { jql, pageSize: PAGINATION_SIZE }],
    queryFn: async ({ pageParam }) => {
      const { offset, limit } = pageParam;
      const selectedFieldIds = getSelectedFieldIds();

      return await getJiraIssuesByJQL({
        jql,
        offset,
        limit,
        validateQuery: false,
        fields: [...JIRA_SEARCH_ISSUE_FIELDS, ...selectedFieldIds],
        expand: ["names"],
      });
    },
    select: (data) => {
      const allIssue = data.pages.flatMap((page) => page.issues);
      const fieldsNameMap = data.pages[0]?.names;
      const selectedFields = getSelectedFields();
      const processedIssues: ProcessedJiraIssue[] = allIssue.map((issue) =>
        processJiraSearchIssue(issue, selectedFields, fieldsNameMap),
      );

      return {
        list: processedIssues,
        total: data.pages[0]?.total ?? 0,
      } as TSelect;
    },
    initialPageParam: { offset: 0, limit: PAGINATION_SIZE },
    getNextPageParam: (lastPage) => {
      if (lastPage.startAt + lastPage.issues.length < lastPage.total) {
        return { offset: lastPage.startAt + lastPage.issues.length, limit: PAGINATION_SIZE };
      }
      return undefined;
    },
    ...options,
  });
}

export function useJiraIssueTransitionsQuery<TSelect = JiraIssueTransitionsResponse>(
  issueKey: string,
  options?: QueryOptions<JiraIssueTransitionsResponse, TSelect>,
) {
  return useQuery<JiraIssueTransitionsResponse, Error, TSelect>({
    queryKey: ["jira-issue-transitions", issueKey],
    queryFn: () => {
      const url = transformURL(JIRA_API.ISSUE_TRANSITIONS, { issueIdOrKey: issueKey });
      return getJiraIssueTransitions(url);
    },
    staleTime: 0,
    gcTime: 30 * 1000,
    ...options,
  });
}

export function useJiraIssueTransitionMutation(
  options?: Partial<UseMutationOptions<void, Error, { issueKey: string; transitionId: string }>>,
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
      queryClient.invalidateQueries({ queryKey: ["jira-search-issues"] });
    },
    ...options,
  });
}
