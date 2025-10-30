import { Image } from "@raycast/api";

import { avatarCache, confluenceCurrentUserCache } from "@/utils";
import {
  CONFLUENCE_BASE_URL,
  CONFLUENCE_ENTITY_TYPE,
  CONFLUENCE_USER_STATUS,
  DEFAULT_AVATAR,
  CONFLUENCE_TYPE_ICON,
  CACHE_KEY,
} from "@/constants";
import type { ConfluenceSearchResult, ProcessedConfluenceUser, ConfluenceCurrentUser } from "@/types";

export function processConfluenceSearchUsers(items: ConfluenceSearchResult[]): ProcessedConfluenceUser[] {
  const cachedCurrentUser = confluenceCurrentUserCache.get(CACHE_KEY.CONFLUENCE_CURRENT_USER);
  const currentUser = cachedCurrentUser ? JSON.parse(cachedCurrentUser) : null;
  return items.map((item) => processConfluenceSearchUserItem(item, currentUser));
}

function processConfluenceSearchUserItem(
  item: ConfluenceSearchResult,
  currentUser: ConfluenceCurrentUser | null,
): ProcessedConfluenceUser {
  const user = item.user!;

  const title = user.displayName;
  const username = user.username;
  // Anonymous user may not have userKey, use username as fallback
  const userKey = user.userKey || user.username;

  const avatarUrl = user.profilePicture.path ? `${CONFLUENCE_BASE_URL}${user.profilePicture.path}` : "";
  const avatarCacheKey = userKey;
  const avatar = (avatarCacheKey && avatarCache.get(avatarCacheKey)) ?? DEFAULT_AVATAR;

  const icon = avatar
    ? {
        source: avatar,
        mask: Image.Mask.Circle,
      }
    : CONFLUENCE_TYPE_ICON[CONFLUENCE_ENTITY_TYPE.USER];

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
