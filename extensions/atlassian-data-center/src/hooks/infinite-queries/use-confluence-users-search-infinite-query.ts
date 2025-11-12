import { useInfiniteQuery } from "@tanstack/react-query";

import { PAGINATION_SIZE } from "@/constants";
import { getConfluenceUsers } from "@/utils/confluence-request";
import { getAvatarIcon } from "@/utils/avatar";
import { CONFLUENCE_BASE_URL, CONFLUENCE_USER_STATUS } from "@/constants";
import { useConfluenceCurrentUser } from "../queries/use-confluence-current-user";
import type {
  ConfluenceSearchResponse,
  ProcessedConfluenceUser,
  ConfluenceCurrentUser,
  HookInfiniteQueryOptions,
} from "@/types";

type ConfluenceSearchResult = ConfluenceSearchResponse["results"][number];

export const useConfluenceUsersSearchInfiniteQuery = (
  cql: string,
  queryOptions?: HookInfiniteQueryOptions<
    ConfluenceSearchResponse,
    { list: ProcessedConfluenceUser[]; total: number },
    readonly [{ scope: "confluence"; entity: "search"; type: "users"; cql: string }]
  >,
) => {
  const { currentUser } = useConfluenceCurrentUser();

  return useInfiniteQuery({
    queryKey: [{ scope: "confluence", entity: "search", type: "users", cql }],
    queryFn: async ({ queryKey, pageParam }) => {
      const [{ cql: query }] = queryKey;
      const { offset, limit } = pageParam;
      return await getConfluenceUsers({ cql: query, limit, offset });
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
      const allResults = data.pages.flatMap((page) => page.results.filter((result) => result.user));

      // Note: The API may return duplicate user, so we filter by userKey to ensure uniqueness
      const uniqueResults = allResults.filter(
        (result, index, self) => index === self.findIndex((r) => r.user?.userKey === result.user?.userKey),
      );

      const processedUsers = processList(uniqueResults, currentUser);
      const total = data.pages[0]?.totalCount || data.pages[0]?.totalSize || 0;

      return { list: processedUsers, total };
    },
    ...queryOptions,
  });
};

function processList(
  results: ConfluenceSearchResult[],
  currentUser: ConfluenceCurrentUser | null,
): ProcessedConfluenceUser[] {
  return results.map((item) => processItem(item, currentUser));
}

function processItem(item: ConfluenceSearchResult, currentUser: ConfluenceCurrentUser | null): ProcessedConfluenceUser {
  const user = item.user!;

  const title = user.displayName;
  const username = user.username;
  // Anonymous user may not have userKey, use username as fallback
  const userKey = user.userKey || user.username;

  const avatarUrl = user.profilePicture.path ? `${CONFLUENCE_BASE_URL}${user.profilePicture.path}` : "";
  const avatarCacheKey = userKey;
  const icon = getAvatarIcon(avatarCacheKey, user.displayName);

  // TODO: Open user space homepage
  const url = `${CONFLUENCE_BASE_URL}${item.url}`;

  const subtitle = { value: username, tooltip: `Username: ${username}` };

  const isCurrentUser = currentUser?.userKey === userKey;

  const accessories = [
    ...(user.status !== CONFLUENCE_USER_STATUS.CURRENT
      ? [{ text: user.status.charAt(0).toUpperCase() + user.status.slice(1), tooltip: `User Status: ${user.status}` }]
      : []),
    ...(isCurrentUser ? [{ text: "You", tooltip: "Current User" }] : []),
  ];

  return {
    renderKey: userKey,
    userKey,
    title,
    displayName: user.displayName,
    icon,
    subtitle,
    accessories,
    url,
    avatarUrl,
    avatarCacheKey,
  };
}
