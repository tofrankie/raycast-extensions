import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";

import { JIRA_BOARD_ISSUE_FIELDS, JIRA_API, PAGINATION_SIZE, JIRA_SEARCH_ISSUE_FIELDS } from "@/constants";
import {
  getJiraBoards,
  getJiraBoardSprints,
  getJiraBoardConfiguration,
  getJiraIssuesBySprint,
  getJiraIssuesByBoard,
  processActiveSprint,
  processBoards,
  transformURL,
  getSelectedFieldIds,
  getSelectedFields,
  processJiraBoardIssue,
} from "@/utils";
import type {
  InfiniteQueryOptions,
  JiraBoardsResponse,
  JiraBoardConfiguration,
  JiraSprintsResponse,
  JiraBoardIssuesResponse,
  InfiniteQueryPageParam,
  ProcessedJiraKanbanBoardIssue,
  QueryOptions,
} from "@/types";

export function useJiraBoardsQuery<TSelect = JiraBoardsResponse["values"]>(
  options?: QueryOptions<JiraBoardsResponse, TSelect>,
) {
  return useQuery<JiraBoardsResponse, Error, TSelect>({
    queryKey: ["jira-boards"],
    queryFn: getJiraBoards,
    select: (data) => processBoards(data) as TSelect,
    staleTime: Infinity,
    gcTime: Infinity,
    ...options,
  });
}

export function useJiraBoardConfigurationQuery<TSelect = JiraBoardConfiguration>(
  boardId: number,
  options?: QueryOptions<JiraBoardConfiguration, TSelect>,
) {
  return useQuery<JiraBoardConfiguration, Error, TSelect>({
    queryKey: ["jira-board-configuration", boardId],
    queryFn: () => {
      const url = transformURL(JIRA_API.BOARD_CONFIGURATION, { boardId });
      return getJiraBoardConfiguration(url);
    },
    staleTime: Infinity,
    gcTime: Infinity,
    ...options,
  });
}

export function useJiraBoardActiveSprintQuery<TSelect = JiraSprintsResponse["values"][number] | null>(
  boardId: number,
  options?: QueryOptions<JiraSprintsResponse, TSelect>,
) {
  return useQuery<JiraSprintsResponse, Error, TSelect>({
    queryKey: ["jira-board-sprints", boardId],
    queryFn: () => {
      const url = transformURL(JIRA_API.BOARD_SPRINT, { boardId });
      const params = { state: "active" };
      return getJiraBoardSprints(url, params);
    },
    select: (data) => processActiveSprint(data) as TSelect,
    ...options,
  });
}

export function useJiraBoardSprintIssuesQuery<TSelect = JiraBoardIssuesResponse>(
  boardId: number,
  sprintId: number,
  options?: QueryOptions<JiraBoardIssuesResponse, TSelect>,
) {
  return useQuery<JiraBoardIssuesResponse, Error, TSelect>({
    queryKey: ["jira-board-sprint-issues", boardId, sprintId],
    queryFn: () => {
      const selectedFieldIds = getSelectedFieldIds();
      const url = transformURL(JIRA_API.BOARD_SPRINT_ISSUE, { boardId, sprintId });
      const params = {
        jql: "order by priority DESC, updated DESC, created DESC",
        fields: [...JIRA_BOARD_ISSUE_FIELDS, ...selectedFieldIds],
        maxResults: 200,
      };
      return getJiraIssuesBySprint(url, params);
    },
    ...options,
  });
}

export function useJiraBoardIssuesInfiniteQuery<TSelect = { list: ProcessedJiraKanbanBoardIssue[]; total: number }>(
  boardId: number,
  options?: InfiniteQueryOptions<JiraBoardIssuesResponse, TSelect>,
) {
  return useInfiniteQuery<JiraBoardIssuesResponse, Error, TSelect, QueryKey, InfiniteQueryPageParam>({
    queryKey: ["jira-board-issues", { boardId, pageSize: PAGINATION_SIZE }],
    queryFn: async ({ pageParam }) => {
      const { offset, limit } = pageParam;
      const selectedFieldIds = getSelectedFieldIds();
      const url = transformURL(JIRA_API.BOARD_ISSUE, { boardId });
      return getJiraIssuesByBoard(url, {
        expand: ["names"],
        offset,
        jql: "order by updated DESC, priority DESC, created DESC",
        limit,
        fields: [...JIRA_SEARCH_ISSUE_FIELDS, ...selectedFieldIds],
      });
    },
    select: (data) => {
      const allIssues = data.pages.flatMap((page) => page.issues);
      const fieldsNameMap = data.pages[0]?.names;
      const selectedFields = getSelectedFields();
      const processedIssues: ProcessedJiraKanbanBoardIssue[] = allIssues.map((issue) =>
        processJiraBoardIssue(issue, selectedFields, fieldsNameMap),
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
