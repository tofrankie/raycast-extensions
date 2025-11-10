import { useInfiniteQuery } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";

import { PAGINATION_SIZE } from "@/constants";
import { searchSpaces, processConfluenceSearchSpaces } from "@/utils";
import type {
  ConfluenceSearchResponse,
  InfiniteQueryOptions,
  InfiniteQueryPageParam,
  ProcessedConfluenceSpace,
} from "@/types";

export const useConfluenceSearchSpacesInfiniteQuery = <TSelect = { list: ProcessedConfluenceSpace[]; total: number }>(
  cql: string,
  options?: InfiniteQueryOptions<ConfluenceSearchResponse, TSelect>,
) => {
  return useInfiniteQuery<ConfluenceSearchResponse, Error, TSelect, QueryKey, InfiniteQueryPageParam>({
    queryKey: ["confluence-search-spaces", { cql, pageSize: PAGINATION_SIZE }],
    queryFn: async ({ pageParam }) => {
      const { offset, limit } = pageParam;
      return await searchSpaces({ cql, limit, offset });
    },
    select: (data) => {
      const allResults = data.pages.flatMap((page) => page.results.filter((result) => result.space));

      // Note: The API may return duplicate space, so we filter by space key to ensure uniqueness
      const uniqueResults = allResults.filter(
        (result, index, self) => index === self.findIndex((r) => r.space?.key === result.space?.key),
      );

      const processedSpaces = processConfluenceSearchSpaces(uniqueResults);

      const total = data.pages[0]?.totalCount || data.pages[0]?.totalSize || 0;

      return {
        list: processedSpaces,
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
