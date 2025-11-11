import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseMutationOptions, QueryKey } from "@tanstack/react-query";

import { PAGINATION_SIZE } from "@/constants";
import {
  getJiraNotifications,
  processJiraNotificationView,
  markJiraNotificationAsRead,
  markJiraAllNotificationsAsRead,
  setJiraNotificationState,
} from "@/utils";
import type {
  InfiniteQueryOptions,
  JiraNotificationsResponse,
  InfiniteQueryPageParam,
  ProcessedJiraNotification,
  QueryOptions,
} from "@/types";

export function useJiraUnreadNotificationsQuery(options?: QueryOptions<JiraNotificationsResponse, number>) {
  return useQuery<JiraNotificationsResponse, Error, number>({
    queryKey: ["jira-unread-notification"],
    queryFn: () => getJiraNotifications({ offset: 0, limit: 1 }),
    select: (data) => data.unreadNotificationsCount,
    staleTime: 15 * 1000,
    ...options,
  });
}

export function useJiraNotificationsInfiniteQuery<TSelect = { list: ProcessedJiraNotification[]; total: number }>(
  options?: InfiniteQueryOptions<JiraNotificationsResponse, TSelect>,
) {
  return useInfiniteQuery<JiraNotificationsResponse, Error, TSelect, QueryKey, InfiniteQueryPageParam>({
    queryKey: ["jira-notification-view", { pageSize: PAGINATION_SIZE }],
    queryFn: async ({ pageParam }) => {
      return await getJiraNotifications(pageParam);
    },
    select: (data) => {
      const allNotifications = data.pages.flatMap((page) => page.notificationsList);
      const processedNotifications: ProcessedJiraNotification[] = processJiraNotificationView(allNotifications);

      return {
        list: processedNotifications,
        total: data.pages[0]?.count ?? 0,
      } as TSelect;
    },
    initialPageParam: { offset: 0, limit: PAGINATION_SIZE },
    getNextPageParam: (lastPage, allPages) => {
      const fetchedCount = allPages.reduce((sum, page) => sum + page.notificationsList.length, 0);
      const totalCount = lastPage.count || 0;

      if (fetchedCount < totalCount) {
        return { offset: fetchedCount, limit: PAGINATION_SIZE };
      }
      return undefined;
    },
    ...options,
  });
}

export function useMarkJiraNotificationAsReadMutation(options?: Partial<UseMutationOptions<void, Error, number>>) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (notificationId) => markJiraNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jira-notification-view"] });
    },
    ...options,
  });
}

export function useSetJiraNotificationStateMutation(options?: Partial<UseMutationOptions<void, Error, number>>) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (notificationId) => setJiraNotificationState(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jira-notification-view"] });
    },
    ...options,
  });
}

export function useMarkJiraAllNotificationsAsReadMutation(options?: Partial<UseMutationOptions<void, Error, void>>) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => markJiraAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jira-notification-view"] });
    },
    ...options,
  });
}
