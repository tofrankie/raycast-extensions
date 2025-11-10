import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationOptions } from "@tanstack/react-query";

import { getJiraWorklogById, createJiraWorklog, updateJiraWorklog, getJiraWorklogs, processJiraWorklog } from "@/utils";
import type {
  JiraWorklog,
  JiraWorklogCreateParams,
  JiraWorklogUpdateParams,
  WorklogGroup,
  QueryOptions,
} from "@/types";

export function useJiraWorklogQuery<TSelect = JiraWorklog>(
  worklogId: number,
  options?: QueryOptions<JiraWorklog, TSelect>,
) {
  return useQuery<JiraWorklog, Error, TSelect>({
    queryKey: ["jira-worklog", worklogId],
    queryFn: () => getJiraWorklogById(worklogId),
    staleTime: 0,
    gcTime: 30 * 1000,
    ...options,
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

export function useJiraWorklogsQuery<TSelect = WorklogGroup[]>(
  { userKey, from, to }: { userKey: string | undefined; from: string; to: string },
  options?: QueryOptions<JiraWorklog[], TSelect>,
) {
  return useQuery<JiraWorklog[], Error, TSelect>({
    queryKey: ["jira-worklog-view", { userKey, from, to }],
    queryFn: async () => {
      if (!userKey) return [];
      return await getJiraWorklogs({ from, to, worker: [userKey] });
    },
    select: (data) => processJiraWorklog(data) as TSelect,
    staleTime: Infinity,
    gcTime: Infinity,
    ...options,
  });
}
