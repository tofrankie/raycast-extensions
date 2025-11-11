import { showFailureToast } from "@raycast/utils";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData, QueryKey } from "@tanstack/react-query";

import { PAGINATION_SIZE } from "@/constants";
import {
  getConfluenceContents,
  addConfluenceContentToFavorite,
  removeConfluenceContentFromFavorite,
  processConfluenceContentSearchResult,
} from "@/utils";
import type {
  ConfluenceContentSearchResponse,
  InfiniteQueryOptions,
  InfiniteQueryPageParam,
  ProcessedConfluenceContent,
} from "@/types";

export const useConfluenceContentsSearchInfiniteQuery = <
  TSelect = { list: ProcessedConfluenceContent[]; total: number },
>(
  cql: string,
  options?: InfiniteQueryOptions<ConfluenceContentSearchResponse, TSelect>,
) => {
  return useInfiniteQuery<ConfluenceContentSearchResponse, Error, TSelect, QueryKey, InfiniteQueryPageParam>({
    queryKey: ["confluence-search-content", { cql, pageSize: PAGINATION_SIZE }],
    queryFn: async ({ pageParam }) => {
      const { offset, limit } = pageParam;
      return await getConfluenceContents({ cql, limit, offset });
    },
    select: (data) => {
      const list = data.pages.flatMap((page) => processConfluenceContentSearchResult(page.results));
      const total = data.pages[0]?.totalCount || data.pages[0]?.totalSize || 0;

      return {
        list,
        total,
      } as TSelect;
    },
    initialPageParam: { offset: 0, limit: PAGINATION_SIZE },
    getNextPageParam: (lastPage, allPages) => {
      const hasNextLink = !!lastPage._links?.next;
      if (hasNextLink) {
        return { offset: allPages.length * PAGINATION_SIZE, limit: PAGINATION_SIZE };
      }
      return undefined;
    },
    ...options,
  });
};

export const useToggleConfluenceContentFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentId, isFavorited }: { contentId: string; isFavorited: boolean }) => {
      if (isFavorited) {
        await removeConfluenceContentFromFavorite({ contentId });
      } else {
        await addConfluenceContentToFavorite({ contentId });
      }
    },
    onMutate: async ({ contentId, isFavorited }) => {
      const queryKey = ["confluence-search-content"];

      // Cancel all ongoing queries to avoid conflicts
      await queryClient.cancelQueries({ queryKey });

      // Get the current cached data of the query
      const previousData = queryClient.getQueriesData({ queryKey });

      // Optimistically update all related query caches
      queryClient.setQueriesData({ queryKey }, (old: InfiniteData<ConfluenceContentSearchResponse> | undefined) => {
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
      });

      // Return context for error rollback
      return { previousData };
    },
    onError: (error, _variables, context) => {
      showFailureToast(error, { title: "Failed to Update Favorite" });

      // Rollback to previous state on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Re-fetch data to ensure consistency regardless of success or failure
      queryClient.invalidateQueries({ queryKey: ["confluence-search-content"] });
    },
  });
};
