import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { UseQueryOptions, UseInfiniteQueryOptions } from "@tanstack/react-query";

import { COMMAND_NAME, PAGINATION_SIZE, JIRA_SEARCH_ISSUE_FIELDS } from "@/constants";
import {
  searchJiraIssue,
  processJiraSearchIssue,
  processJiraFieldItem,
  getJiraField,
  getJiraProject,
  getJiraCurrentUser,
  getJiraWorklogs,
  processJiraWorklog,
  getSelectedFields,
  getSelectedFieldIds,
} from "@/utils";
import type {
  JiraSearchIssueResponse,
  JiraField,
  JiraProject,
  JiraCurrentUser,
  JiraWorklog,
  ProcessedJiraIssue,
  ProcessedJiraField,
  WorklogGroup,
} from "@/types";

export function useJiraSearchIssueInfiniteQuery<
  TData = { issues: ProcessedJiraIssue[]; hasMore: boolean; totalCount: number },
>(jql: string, queryOptions?: Partial<UseInfiniteQueryOptions<JiraSearchIssueResponse, Error, TData>>) {
  return useInfiniteQuery<JiraSearchIssueResponse, Error, TData>({
    queryKey: [COMMAND_NAME.JIRA_SEARCH_ISSUE, { jql, pageSize: PAGINATION_SIZE }],
    queryFn: async ({ pageParam = 0 }) => {
      const selectedFieldIds = getSelectedFieldIds();

      const params = {
        jql,
        startAt: pageParam as number,
        maxResults: PAGINATION_SIZE,
        validateQuery: false,
        fields: [...JIRA_SEARCH_ISSUE_FIELDS, ...selectedFieldIds],
        expand: ["names"],
      };

      const response = await searchJiraIssue(params);
      return response;
    },
    select: (data) => {
      const allIssue = data.pages.flatMap((page) => page.issues);
      const fieldsNameMap = data.pages[0]?.names;
      const totalCount = data.pages[0]?.total;
      const selectedFields = getSelectedFields();
      const processedIssues: ProcessedJiraIssue[] = allIssue.map((issue) =>
        processJiraSearchIssue(issue, selectedFields, fieldsNameMap),
      );

      const hasMore =
        data.pages.length > 0
          ? data.pages[data.pages.length - 1].startAt + data.pages[data.pages.length - 1].issues.length <
            data.pages[data.pages.length - 1].total
          : false;

      return {
        issues: processedIssues,
        totalCount,
        hasMore,
      } as TData;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.startAt + lastPage.issues.length < lastPage.total) {
        return lastPage.startAt + lastPage.issues.length;
      }
      return undefined;
    },
    enabled: !!jql,
    staleTime: 60 * 1000,
    gcTime: 2 * 60 * 1000,
    ...queryOptions,
  });
}

export function useJiraFieldQuery<TData = ProcessedJiraField[]>(
  queryOptions?: Partial<UseQueryOptions<JiraField[], Error, TData>>,
) {
  return useQuery<JiraField[], Error, TData>({
    queryKey: [COMMAND_NAME.JIRA_MANAGE_FIELD],
    queryFn: getJiraField,
    select: (data) => {
      return data.map((field) => processJiraFieldItem(field, false)) as TData;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    ...queryOptions,
  });
}

export function useJiraProjectQuery<TData = JiraProject[]>(
  queryOptions?: Partial<UseQueryOptions<JiraProject[], Error, TData>>,
) {
  return useQuery<JiraProject[], Error, TData>({
    queryKey: ["jira-project"],
    queryFn: getJiraProject,
    staleTime: Infinity,
    gcTime: Infinity,
    ...queryOptions,
  });
}

export function useJiraCurrentUserQuery<TData = JiraCurrentUser | null>(
  queryOptions?: Partial<UseQueryOptions<JiraCurrentUser | null, Error, TData>>,
) {
  return useQuery<JiraCurrentUser | null, Error, TData>({
    queryKey: ["jira-current-user"],
    queryFn: getJiraCurrentUser,
    ...queryOptions,
  });
}

export function useJiraWorklogsQuery<TData = WorklogGroup[]>(
  { userKey, from, to }: { userKey: string | undefined; from: string; to: string },
  queryOptions?: Partial<UseQueryOptions<JiraWorklog[], Error, TData>>,
) {
  return useQuery<JiraWorklog[], Error, TData>({
    queryKey: [COMMAND_NAME.JIRA_WORKLOG_VIEW, { userKey, from, to }],
    queryFn: async () => {
      if (!userKey) return [];
      return await getJiraWorklogs({ from, to, worker: [userKey] });
    },
    enabled: !!userKey,
    select: (data) => processJiraWorklog(data) as TData,
    staleTime: Infinity,
    gcTime: Infinity,
    ...queryOptions,
  });
}
