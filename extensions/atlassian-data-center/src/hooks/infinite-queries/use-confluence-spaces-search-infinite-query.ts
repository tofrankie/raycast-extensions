import { useInfiniteQuery } from "@tanstack/react-query";
import { Icon } from "@raycast/api";

import { PAGINATION_SIZE } from "@/constants";
import { getConfluenceSpaces } from "@/utils/confluence-request";
import { getAvatarIcon } from "@/utils/avatar";
import { CONFLUENCE_SPACE_TYPE_LABEL, CONFLUENCE_BASE_URL } from "@/constants";
import type {
  ConfluenceSearchResponse,
  ConfluenceSpaceType,
  ProcessedConfluenceSpace,
  HookInfiniteQueryOptions,
} from "@/types";

type ConfluenceSearchResult = ConfluenceSearchResponse["results"][number];

export const useConfluenceSpacesSearchInfiniteQuery = (
  cql: string,
  queryOptions?: HookInfiniteQueryOptions<
    ConfluenceSearchResponse,
    { list: ProcessedConfluenceSpace[]; total: number },
    readonly [{ scope: "confluence"; entity: "search"; type: "spaces"; cql: string }]
  >,
) => {
  return useInfiniteQuery({
    queryKey: [{ scope: "confluence", entity: "search", type: "spaces", cql }],
    queryFn: async ({ queryKey, pageParam }) => {
      const [{ cql: query }] = queryKey;
      const { offset, limit } = pageParam;
      return await getConfluenceSpaces({ cql: query, limit, offset });
    },
    initialPageParam: { offset: 0, limit: PAGINATION_SIZE },
    getNextPageParam: (lastPage, allPages) => {
      const hasNextLink = !!lastPage._links?.next;
      if (hasNextLink) {
        return { offset: allPages.length * PAGINATION_SIZE, limit: PAGINATION_SIZE };
      }
      return undefined;
    },
    select: (data) => {
      const allResults = data.pages.flatMap((page) => page.results.filter((result) => result.space));

      // Note: The API may return duplicate space, so we filter by space key to ensure uniqueness
      const uniqueResults = allResults.filter(
        (result, index, self) => index === self.findIndex((r) => r.space?.key === result.space?.key),
      );

      const processedSpaces = processList(uniqueResults);
      const total = data.pages[0]?.totalCount || data.pages[0]?.totalSize || 0;

      return { list: processedSpaces, total };
    },
    ...queryOptions,
  });
};

function processList(results: ConfluenceSearchResult[]): ProcessedConfluenceSpace[] {
  return results.map((result) => processItem(result));
}

function processItem(result: ConfluenceSearchResult): ProcessedConfluenceSpace {
  const space = result.space!;

  const spaceKey = space.key || "";
  const spaceType = space.type || "";

  const url = space._links?.webui ? `${CONFLUENCE_BASE_URL}${space._links.webui}` : "";

  const avatarUrl = space.icon.path ? `${CONFLUENCE_BASE_URL}${space.icon.path}` : "";
  const avatarCacheKey = spaceKey;

  const isFavourited =
    space.metadata?.labels?.results?.some((label) => label.prefix === "my" && label.name === "favourite") ?? false;

  const icon = getAvatarIcon(avatarCacheKey, space.name);

  const description = space.description?.plain?.value || "";
  const subtitle = {
    value: description || spaceKey,
    tooltip: description ? `Space Description: ${description}` : `Space Key: ${spaceKey}`,
  };
  const spaceTypeLabel = CONFLUENCE_SPACE_TYPE_LABEL[spaceType as ConfluenceSpaceType] ?? spaceType;
  const accessories = [
    ...(isFavourited
      ? [
          {
            icon: Icon.Star,
            tooltip: "My Favourite Space",
          },
        ]
      : []),
    {
      text: spaceTypeLabel,
      tooltip: `Space Type: ${spaceTypeLabel}`,
    },
  ];

  return {
    renderKey: space.key,
    title: space.name,
    key: space.key,
    name: space.name,
    icon,
    subtitle,
    accessories,
    url,
    avatarUrl,
    avatarCacheKey,
  };
}
