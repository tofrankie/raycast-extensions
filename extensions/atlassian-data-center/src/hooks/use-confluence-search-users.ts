import { useInfiniteQuery } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";

import { PAGINATION_SIZE } from "@/constants";
import { searchUsers, processConfluenceSearchUsers } from "@/utils";
import type {
  ConfluenceSearchResponse,
  InfiniteQueryOptions,
  InfiniteQueryPageParam,
  ProcessedConfluenceUser,
} from "@/types";

export const useConfluenceSearchUsersInfiniteQuery = <TSelect = { list: ProcessedConfluenceUser[]; total: number }>(
  cql: string,
  options?: InfiniteQueryOptions<ConfluenceSearchResponse, TSelect>,
) => {
  return useInfiniteQuery<ConfluenceSearchResponse, Error, TSelect, QueryKey, InfiniteQueryPageParam>({
    queryKey: ["confluence-search-users", { cql, pageSize: PAGINATION_SIZE }],
    queryFn: async ({ pageParam }) => {
      const { offset, limit } = pageParam;
      return await searchUsers({ cql, limit, offset });
    },
    select: (data) => {
      const allResults = data.pages.flatMap((page) => page.results.filter((result) => result.user));

      // Note: The API may return duplicate user, so we filter by userKey to ensure uniqueness
      const uniqueResults = allResults.filter(
        (result, index, self) => index === self.findIndex((r) => r.user?.userKey === result.user?.userKey),
      );

      const processedUsers = processConfluenceSearchUsers(uniqueResults);

      const total = data.pages[0]?.totalCount || data.pages[0]?.totalSize || 0;

      return {
        list: processedUsers,
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
