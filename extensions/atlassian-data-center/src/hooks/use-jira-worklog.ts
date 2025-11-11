import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationOptions } from "@tanstack/react-query";

import { getJiraWorklogById, createJiraWorklog, updateJiraWorklog, getJiraWorklogs, processJiraWorklog } from "@/utils";
import type {
  JiraWorklog,
  JiraWorklogCreateParams,
  JiraWorklogUpdateParams,
  JiraWorklogsResponse,
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

type JiraWorklogCreateMutationOptions = UseMutationOptions<JiraWorklog, Error, JiraWorklogCreateParams>;

export function useJiraWorklogCreateMutation(options?: Partial<JiraWorklogCreateMutationOptions>) {
  const queryClient = useQueryClient();

  return useMutation<JiraWorklog, Error, JiraWorklogCreateParams>({
    mutationFn: createJiraWorklog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jira-worklog"] });
      queryClient.invalidateQueries({ queryKey: ["jira-search-issues"] });
    },
    ...options,
  });
}

type JiraWorklogUpdateMutationParams = { worklogId: number; params: JiraWorklogUpdateParams };
type JiraWorklogUpdateMutationOptions = UseMutationOptions<JiraWorklog, Error, JiraWorklogUpdateMutationParams>;

export function useJiraWorklogUpdateMutation(options?: Partial<JiraWorklogUpdateMutationOptions>) {
  const queryClient = useQueryClient();

  return useMutation<JiraWorklog, Error, JiraWorklogUpdateMutationParams>({
    mutationFn: ({ worklogId, params }) => updateJiraWorklog(worklogId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jira-worklog"] });
      queryClient.invalidateQueries({ queryKey: ["jira-search-issues"] });
    },
    ...options,
  });
}

export function useJiraWorklogsQuery<TSelect = WorklogGroup[]>(
  { userKey, from, to }: { userKey: string | undefined; from: string; to: string },
  options?: QueryOptions<JiraWorklogsResponse, TSelect>,
) {
  return useQuery<JiraWorklogsResponse, Error, TSelect>({
    queryKey: ["jira-worklogs", { userKey, from, to }],
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
