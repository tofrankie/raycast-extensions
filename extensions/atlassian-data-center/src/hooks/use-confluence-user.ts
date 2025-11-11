import { useEffect } from "react";
import { useCachedState } from "@raycast/utils";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";

import { getConfluenceCurrentUser, getConfluenceUsers, processConfluenceUserSearchResult } from "@/utils";
import { CACHE_KEY, PAGINATION_SIZE } from "@/constants";
import type {
  ConfluenceCurrentUser,
  ConfluenceSearchResponse,
  QueryOptions,
  InfiniteQueryOptions,
  InfiniteQueryPageParam,
  ProcessedConfluenceUser,
} from "@/types";

export function useConfluenceCurrentUser() {
  const [currentUser, setCurrentUser] = useCachedState<ConfluenceCurrentUser | null>(
    CACHE_KEY.CONFLUENCE_CURRENT_USER,
    null,
  );

  const queryResult = useConfluenceCurrentUserQuery({
    enabled: !currentUser,
    meta: { errorMessage: "Failed to Load User" },
  });

  useEffect(() => {
    if (queryResult.data) {
      setCurrentUser(queryResult.data);
    }
  }, [queryResult.data]);

  return {
    ...queryResult,
    currentUser,
  };
}

function useConfluenceCurrentUserQuery<TSelect = ConfluenceCurrentUser | null>(
  options?: QueryOptions<ConfluenceCurrentUser | null, TSelect>,
) {
  return useQuery<ConfluenceCurrentUser | null, Error, TSelect>({
    queryKey: ["confluence-current-user"],
    queryFn: getConfluenceCurrentUser,
    staleTime: Infinity,
    gcTime: Infinity,
    ...options,
  });
}

export const useConfluenceUsersSearchInfiniteQuery = <TSelect = { list: ProcessedConfluenceUser[]; total: number }>(
  cql: string,
  options?: InfiniteQueryOptions<ConfluenceSearchResponse, TSelect>,
) => {
  return useInfiniteQuery<ConfluenceSearchResponse, Error, TSelect, QueryKey, InfiniteQueryPageParam>({
    queryKey: ["confluence-search-users", { cql, pageSize: PAGINATION_SIZE }],
    queryFn: async ({ pageParam }) => {
      const { offset, limit } = pageParam;
      return await getConfluenceUsers({ cql, limit, offset });
    },
    select: (data) => {
      const allResults = data.pages.flatMap((page) => page.results.filter((result) => result.user));

      // Note: The API may return duplicate user, so we filter by userKey to ensure uniqueness
      const uniqueResults = allResults.filter(
        (result, index, self) => index === self.findIndex((r) => r.user?.userKey === result.user?.userKey),
      );

      const processedUsers = processConfluenceUserSearchResult(uniqueResults);

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
