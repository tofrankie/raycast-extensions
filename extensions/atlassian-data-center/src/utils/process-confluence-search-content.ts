import { Icon, Image } from "@raycast/api";

import { avatarCache } from "@/utils";
import {
  CONFLUENCE_BASE_URL,
  CONFLUENCE_CONTENT_TYPE,
  DEFAULT_AVATAR,
  CONFLUENCE_TYPE_ICON,
  CONFLUENCE_TYPE_LABEL,
} from "@/constants";
import type { ConfluenceSearchContentResult, ConfluenceIconType, ProcessedConfluenceContentItem } from "@/types";

export function processConfluenceSearchContentItems(
  items: ConfluenceSearchContentResult[],
): ProcessedConfluenceContentItem[] {
  return items.map((item) => processConfluenceSearchContentItem(item));
}

function processConfluenceSearchContentItem(item: ConfluenceSearchContentResult): ProcessedConfluenceContentItem {
  const id = item.id;
  const title = { value: item.title, tooltip: `Title: ${item.title}` };
  const spaceName = item.space?.name || "";

  const iconType = item.type as ConfluenceIconType;
  const icon = {
    value: CONFLUENCE_TYPE_ICON[iconType] ?? "icon-unknown.svg",
    tooltip: `Content Type: ${CONFLUENCE_TYPE_LABEL[iconType] ?? "Unknown"}`,
  };

  const baseUrl = CONFLUENCE_BASE_URL;

  const url = `${baseUrl}${item._links.webui}`;
  const editUrl = `${baseUrl}/pages/editpage.action?pageId=${item.id}`;
  const spaceUrl = `${baseUrl}${item.space._links.webui}`;

  const createdAt = new Date(item.history.createdDate);
  const updatedAt = new Date(item.history.lastUpdated.when);
  const isSingleVersion = item.history.lastUpdated?.when === item.history.createdDate;

  const creator = item.history.createdBy.displayName;
  const updater = item.history.lastUpdated.by.displayName;
  // Anonymous user may not have userKey
  const creatorUserKey = item.history.createdBy.userKey;

  const creatorAvatarUrl = `${baseUrl}${item.history.createdBy.profilePicture.path}`;
  const creatorAvatarCacheKey = creatorUserKey;
  const creatorAvatar = (creatorAvatarCacheKey && avatarCache.get(creatorAvatarCacheKey)) ?? DEFAULT_AVATAR;

  const isFavourited = item.metadata.currentuser.favourited?.isFavourite ?? false;
  const favouritedAt = item.metadata.currentuser.favourited?.favouritedDate
    ? new Date(item.metadata.currentuser.favourited.favouritedDate).toISOString()
    : null;

  const EDITABLE_TYPES = [CONFLUENCE_CONTENT_TYPE.PAGE, CONFLUENCE_CONTENT_TYPE.BLOGPOST] as const;
  const type = item.type as (typeof EDITABLE_TYPES)[number];
  const canEdit = EDITABLE_TYPES.includes(type);
  const canFavorite = EDITABLE_TYPES.includes(type);

  const subtitle = { value: spaceName, tooltip: `Space: ${spaceName}` };
  const accessories = [
    ...(isFavourited
      ? [
          {
            icon: Icon.Star,
            tooltip: `Favourited at ${favouritedAt ? new Date(favouritedAt).toLocaleString() : ""}`,
          },
        ]
      : []),
    {
      date: updatedAt,
      tooltip: isSingleVersion
        ? `Created at ${createdAt.toLocaleString()} by ${creator}`
        : `Created at ${createdAt.toLocaleString()} by ${creator}\nUpdated at ${updatedAt.toLocaleString()} by ${updater}`,
    },
    ...(creatorAvatar
      ? [
          {
            icon: { source: creatorAvatar, mask: Image.Mask.Circle },
            tooltip: `Created by ${creator}`,
          },
        ]
      : []),
  ];

  return {
    renderKey: id,
    title,
    id,
    icon,
    subtitle,
    accessories,
    canEdit,
    canFavorite,
    isFavourited,
    url,
    editUrl,
    spaceUrl,
    spaceName,
    creatorAvatarUrl,
    creatorAvatarCacheKey,
  };
}
