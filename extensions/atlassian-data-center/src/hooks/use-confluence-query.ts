import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData, UseInfiniteQueryOptions, UseQueryOptions } from "@tanstack/react-query";

import { COMMAND_NAME, PAGINATION_SIZE } from "@/constants";
import {
  searchContent,
  searchUser,
  searchSpace,
  addToFavorite,
  removeFromFavorite,
  getConfluenceCurrentUser,
  processConfluenceSearchUserItems,
  processConfluenceSearchSpaceItems,
  processConfluenceSearchContentItems,
} from "@/utils";
import type {
  ConfluenceSearchContentResponse,
  ConfluenceSearchResponse,
  ConfluenceCurrentUser,
  ProcessedConfluenceContentItem,
  ProcessedConfluenceUserItem,
  ProcessedConfluenceSpaceItem,
} from "@/types";

export const useConfluenceSearchContentInfiniteQuery = <
  TData = { items: ProcessedConfluenceContentItem[]; hasMore: boolean; totalCount: number },
>(
  cql: string,
  queryOptions?: Partial<UseInfiniteQueryOptions<ConfluenceSearchContentResponse, Error, TData>>,
) => {
  return useInfiniteQuery<ConfluenceSearchContentResponse, Error, TData>({
    enabled: cql.length >= 2,
    queryKey: [COMMAND_NAME.CONFLUENCE_SEARCH_CONTENT, { cql, pageSize: PAGINATION_SIZE }],
    queryFn: async ({ pageParam }) => {
      const start = pageParam as number;
      const response = await searchContent(cql, PAGINATION_SIZE, start);
      return response;
    },
    select: (data) => {
      const items = data.pages.flatMap((page) => processConfluenceSearchContentItems(page.results));
      const hasMore = data.pages.length > 0 ? !!data.pages[data.pages.length - 1]?._links?.next : false;
      const totalCount = data.pages[0]?.totalCount || data.pages[0]?.totalSize || 0;

      return {
        items,
        hasMore,
        totalCount,
      } as TData;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const hasNextLink = !!lastPage._links?.next;
      const nextPageParam = hasNextLink ? allPages.length * PAGINATION_SIZE : undefined;
      return nextPageParam;
    },
    staleTime: 60 * 1000,
    ...queryOptions,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentId, isFavorited }: { contentId: string; isFavorited: boolean }) => {
      if (isFavorited) {
        await removeFromFavorite(contentId);
      } else {
        await addToFavorite(contentId);
      }
    },
    onMutate: async ({ contentId, isFavorited }) => {
      // Cancel all ongoing queries to avoid conflicts
      await queryClient.cancelQueries({ queryKey: [COMMAND_NAME.CONFLUENCE_SEARCH_CONTENT] });

      // Get the current cached data of the query
      const previousData = queryClient.getQueriesData({ queryKey: [COMMAND_NAME.CONFLUENCE_SEARCH_CONTENT] });

      // Optimistically update all related query caches
      queryClient.setQueriesData(
        { queryKey: [COMMAND_NAME.CONFLUENCE_SEARCH_CONTENT] },
        (old: InfiniteData<ConfluenceSearchContentResponse> | undefined) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              results: page.results.map((item) =>
                item.id === contentId
                  ? {
                      ...item,
                      metadata: {
                        ...item.metadata,
                        currentuser: {
                          ...item.metadata.currentuser,
                          favourited: {
                            isFavourite: !isFavorited,
                            favouritedDate: !isFavorited ? Date.now() : 0,
                          },
                        },
                      },
                    }
                  : item,
              ),
            })),
          };
        },
      );

      // Return context for error rollback
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback to previous state on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Re-fetch data to ensure consistency regardless of success or failure
      queryClient.invalidateQueries({ queryKey: [COMMAND_NAME.CONFLUENCE_SEARCH_CONTENT] });
    },
  });
};

export const useConfluenceSearchUserInfiniteQuery = <
  TData = { items: ProcessedConfluenceUserItem[]; hasMore: boolean; totalCount: number },
>(
  cql: string,
  queryOptions?: Partial<UseInfiniteQueryOptions<ConfluenceSearchResponse, Error, TData>>,
) => {
  return useInfiniteQuery<ConfluenceSearchResponse, Error, TData>({
    enabled: cql.length >= 2,
    queryKey: [COMMAND_NAME.CONFLUENCE_SEARCH_USER, { cql, pageSize: PAGINATION_SIZE }],
    queryFn: async ({ pageParam }) => {
      const start = pageParam as number;
      const response = await searchUser(cql, PAGINATION_SIZE, start);
      return response;
    },
    select: (data) => {
      const allResults = data.pages.flatMap((page) => page.results.filter((result) => result.user));

      // Note: The API may return duplicate user, so we filter by userKey to ensure uniqueness
      const uniqueResults = allResults.filter(
        (result, index, self) => index === self.findIndex((r) => r.user?.userKey === result.user?.userKey),
      );

      const processedUsers = processConfluenceSearchUserItems(uniqueResults);

      const hasMore = data.pages.length > 0 ? !!data.pages[data.pages.length - 1]?._links?.next : false;

      const totalCount = data.pages[0]?.totalCount || data.pages[0]?.totalSize || 0;

      return {
        items: processedUsers,
        hasMore,
        totalCount,
      } as TData;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const hasNextLink = !!lastPage._links?.next;
      const nextPageParam = hasNextLink ? allPages.length * PAGINATION_SIZE : undefined;
      return nextPageParam;
    },
    staleTime: 60 * 1000,
    ...queryOptions,
  });
};

export const useConfluenceSearchSpaceInfiniteQuery = <
  TData = { items: ProcessedConfluenceSpaceItem[]; hasMore: boolean; totalCount: number },
>(
  cql: string,
  queryOptions?: Partial<UseInfiniteQueryOptions<ConfluenceSearchResponse, Error, TData>>,
) => {
  return useInfiniteQuery<ConfluenceSearchResponse, Error, TData>({
    enabled: cql.length >= 2,
    queryKey: [COMMAND_NAME.CONFLUENCE_SEARCH_SPACE, { cql, pageSize: PAGINATION_SIZE }],
    queryFn: async ({ pageParam }) => {
      const start = pageParam as number;
      const response = await searchSpace(cql, PAGINATION_SIZE, start);
      return response;
    },
    select: (data) => {
      const allResults = data.pages.flatMap((page) => page.results.filter((result) => result.space));

      // Note: The API may return duplicate space, so we filter by space key to ensure uniqueness
      const uniqueResults = allResults.filter(
        (result, index, self) => index === self.findIndex((r) => r.space?.key === result.space?.key),
      );

      const processedSpaces = processConfluenceSearchSpaceItems(uniqueResults);

      const hasMore = data.pages.length > 0 ? !!data.pages[data.pages.length - 1]?._links?.next : false;
      const totalCount = data.pages[0]?.totalCount || data.pages[0]?.totalSize || 0;

      return {
        items: processedSpaces,
        hasMore,
        totalCount,
      } as TData;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const hasNextLink = !!lastPage._links?.next;
      const nextPageParam = hasNextLink ? allPages.length * PAGINATION_SIZE : undefined;
      return nextPageParam;
    },
    staleTime: 60 * 1000,
    ...queryOptions,
  });
};

export function useConfluenceCurrentUserQuery<TData = ConfluenceCurrentUser>(
  queryOptions?: Partial<UseQueryOptions<ConfluenceCurrentUser, Error, TData>>,
) {
  return useQuery<ConfluenceCurrentUser, Error, TData>({
    queryKey: ["confluence-current-user"],
    queryFn: getConfluenceCurrentUser,
    staleTime: Infinity,
    gcTime: Infinity,
    ...queryOptions,
  });
}
